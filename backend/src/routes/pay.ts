import { Router, Request, Response, NextFunction } from "express";
import { useFacilitator } from "../facilitator";
import prisma from "../db";
import { getFilePath, fileExists } from "../utils/upload";
import {
  FacilitatorConfig,
  PaymentCallback,
  PaymentRequirements,
} from "../middleware/types";
import {
  processPriceToAtomicAmount,
  decodePayment,
  findMatchingPaymentRequirements,
  toJsonSafe,
  settleResponseHeader,
  getDefaultAssetDecimals,
} from "../middleware/helpers";
import { getPaywallHtml } from "../middleware/paywall";
import algosdk from "algosdk";
import path from "path";
import fs from "fs";

export function createPayRoute(facilitator: FacilitatorConfig) {
  const router = Router();
  const { verify, settle, supported } = useFacilitator(facilitator);
  const x402Version = 1;

  // Payment callback to save payment to database
  const onPaymentSettled: PaymentCallback = async (data) => {
    if (!data.linkId) return;

    try {
      // Convert atomic amount back to USD for storage
      const link = await prisma.link.findUnique({
        where: { id: data.linkId },
      });

      if (!link) {
        console.error(`Link ${data.linkId} not found for payment tracking`);
        return;
      }

      // Amount is in atomic units, convert to decimal
      const atomicAmount = BigInt(data.amount);
      const amountDecimal = Number(atomicAmount) / Math.pow(10, link.decimals);

      await prisma.payment.create({
        data: {
          linkId: data.linkId,
          payerAddress: data.payerAddress,
          amount: amountDecimal, // Store as USD amount
          txnId: data.txnId || null,
          txnGroupId: data.txnId || null, // Using txnId as group ID for now
        },
      });
    } catch (error) {
      console.error("Error saving payment to database:", error);
    }
  };

  // GET /pay/:linkId - Dynamic payment route
  router.get(
    "/:linkId",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { linkId } = req.params;

        // Fetch link from database FIRST
        const link = await prisma.link.findUnique({
          where: { id: linkId },
        });

        if (!link) {
          return res.status(404).json({ error: "Link not found" });
        }

        // Process price to get atomic amount and asset
        const price = `$${link.price.toString()}`;
        const atomicAmountForAsset = processPriceToAtomicAmount(
          price,
          link.network as "algorand" | "algorand-testnet"
        );
        if ("error" in atomicAmountForAsset) {
          return res.status(500).json({ error: atomicAmountForAsset.error });
        }
        const { maxAmountRequired, asset } = atomicAmountForAsset;

        // Get supported payment kinds
        const paymentKinds = await supported();
        let feePayer: string | undefined;
        for (const kind of paymentKinds.kinds) {
          if (kind.network === link.network && kind.scheme === "exact") {
            feePayer = kind?.extra?.feePayer;
            break;
          }
        }

        // Build payment requirements
        const resourceUrl = `${req.protocol}://${req.headers.host}${req.path}`;
        const paymentRequirements: PaymentRequirements[] = [
          {
            scheme: "exact",
            network: link.network as "algorand" | "algorand-testnet",
            maxAmountRequired,
            resource: resourceUrl,
            description: `Payment for ${
              link.contentType === "FILE" ? "file" : "content"
            }`,
            mimeType: "",
            payTo: link.creatorWallet,
            maxTimeoutSeconds: 60,
            asset: asset.id.toString(),
            outputSchema: {
              input: {
                type: "http",
                method: req.method.toUpperCase(),
              },
            },
            extra: {
              feePayer,
            },
          },
        ];

        // Check for payment header
        const payment = req.header("X-PAYMENT");
        const userAgent = req.header("User-Agent") || "";
        const acceptHeader = req.header("Accept") || "";
        const isWebBrowser =
          acceptHeader.includes("text/html") && userAgent.includes("Mozilla");

        if (!payment) {
          // No payment - show paywall
          if (isWebBrowser) {
            const html = getPaywallHtml(
              paymentRequirements,
              req.originalUrl,
              link.network === "algorand-testnet"
            );
            return res.status(402).send(html);
          }
          return res.status(402).json({
            x402Version,
            error: "X-PAYMENT header is required",
            accepts: toJsonSafe(paymentRequirements),
          });
        }

        // Decode and validate payment
        let decodedPayment;
        try {
          decodedPayment = decodePayment(payment);
          decodedPayment.x402Version = x402Version;
        } catch (error) {
          console.error(error);
          return res.status(402).json({
            x402Version,
            error: error || "Invalid or malformed payment header",
            accepts: toJsonSafe(paymentRequirements),
          });
        }

        // Find matching payment requirements
        const selectedPaymentRequirements = findMatchingPaymentRequirements(
          paymentRequirements,
          decodedPayment
        );
        if (!selectedPaymentRequirements) {
          return res.status(402).json({
            x402Version,
            error: "Unable to find matching payment requirements",
            accepts: toJsonSafe(paymentRequirements),
          });
        }

        // Verify payment
        try {
          const verifyResponse = await verify(
            decodedPayment,
            selectedPaymentRequirements
          );
          if (!verifyResponse.isValid) {
            return res.status(402).json({
              x402Version,
              error: verifyResponse.invalidReason,
              accepts: toJsonSafe(paymentRequirements),
              payer: verifyResponse.payer,
            });
          }
        } catch (error) {
          console.error(error);
          return res.status(402).json({
            x402Version,
            error,
            accepts: toJsonSafe(paymentRequirements),
          });
        }

        // Intercept response end to settle payment after content is served
        /* eslint-disable @typescript-eslint/no-explicit-any */
        type EndArgs =
          | [cb?: () => void]
          | [chunk: any, cb?: () => void]
          | [chunk: any, encoding: BufferEncoding, cb?: () => void];
        /* eslint-enable @typescript-eslint/no-explicit-any */

        const originalEnd = res.end.bind(res);
        let endArgs: EndArgs | null = null;

        res.end = function (...args: EndArgs) {
          endArgs = args;

          // Settle payment asynchronously (don't block response)
          if (res.statusCode < 400) {
            settle(decodedPayment, selectedPaymentRequirements)
              .then((settleResponse) => {
                if (!settleResponse.success) {
                  console.error(
                    "Payment settlement failed:",
                    settleResponse.errorReason
                  );
                  return;
                }

                // Payment successful - save to database
                try {
                  const paymentTxn =
                    decodedPayment.payload.paymentGroup[
                      decodedPayment.payload.paymentIndex
                    ];
                  const decodedTxn = algosdk.decodeSignedTransaction(
                    Buffer.from(paymentTxn, "base64")
                  );
                  const payerAddress = decodedTxn.txn.sender.toString();

                  onPaymentSettled({
                    payerAddress,
                    amount: selectedPaymentRequirements.maxAmountRequired,
                    txnId: settleResponse.transaction,
                    linkId,
                  }).catch((err) => {
                    console.error("Error in payment callback:", err);
                  });
                } catch (err) {
                  console.error("Error extracting payer address:", err);
                }
              })
              .catch((error) => {
                console.error("Error settling payment:", error);
              });
          }

          // Restore original end and call it immediately
          res.end = originalEnd;
          return originalEnd(...(args as Parameters<typeof res.end>));
        };

        // Serve content - payment will be settled when res.end() is called
        if (link.contentType === "FILE" && link.contentPath) {
          // Serve file
          const filePath = getFilePath(link.contentPath);
          if (fileExists(link.contentPath)) {
            const ext = path.extname(link.contentPath).toLowerCase();
            const mimeTypes: Record<string, string> = {
              ".pdf": "application/pdf",
              ".jpg": "image/jpeg",
              ".jpeg": "image/jpeg",
              ".png": "image/png",
              ".gif": "image/gif",
              ".mp4": "video/mp4",
              ".mp3": "audio/mpeg",
              ".txt": "text/plain",
            };
            const contentType = mimeTypes[ext] || "application/octet-stream";

            res.setHeader("Content-Type", contentType);
            res.setHeader(
              "Content-Disposition",
              `inline; filename="${link.contentPath}"`
            );

            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
          } else {
            res.status(404).json({ error: "File not found" });
          }
        } else if (link.contentType === "URL" && link.contentPath) {
          if (isWebBrowser) {
            res.status(200).json({ redirect: true, link: link.contentPath });
          } else {
            res.redirect(link.contentPath);
          }
        } else {
          res.status(404).json({ error: "Content not available" });
        }
      } catch (error) {
        console.error("Error in pay route:", error);
        if (!res.headersSent) {
          res.status(500).json({ error: "Internal server error" });
        }
      }
    }
  );

  return router;
}
