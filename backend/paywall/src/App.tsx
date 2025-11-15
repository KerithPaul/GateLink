import { useState, useEffect, useCallback } from "react";
import { NetworkId, useNetwork, useWallet } from "@txnlab/use-wallet-react";
import algosdk from "algosdk";
import WalletConnectModal from "./WalletConnectModal";

// --- Helper Components ---

const Spinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-primary-500"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-20"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="3"
    ></circle>
    <path
      className="opacity-90"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

const ErrorDisplay = ({ message }: { message: string }) => {
  // Attempt to extract and pretty-print JSON from message when present
  const parseJsonFromMessage = (raw: string): any | null => {
    try {
      // Direct parse first
      return JSON.parse(raw);
    } catch (_) {
      // Try to find a JSON-looking substring
      const start = Math.min(
        ...["{", "["].map((c) => raw.indexOf(c)).filter((i) => i !== -1)
      );
      if (!isFinite(start)) return null;
      const candidate = raw.slice(start).trim();
      try {
        return JSON.parse(candidate);
      } catch {
        return null;
      }
    }
  };

  const json = parseJsonFromMessage(message);

  return (
    <div className="mt-4 p-4 bg-destructive/5 border-2 border-destructive/30 rounded-lg shadow-soft backdrop-blur-sm">
      {!json ? (
        <p className="text-destructive text-sm font-semibold whitespace-pre-wrap break-words">
          {message}
        </p>
      ) : (
        <div>
          <p className="text-destructive text-sm font-semibold flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            An error occurred
          </p>
          <pre className="mt-3 text-xs font-mono bg-white/80 text-destructive border border-destructive/20 rounded-md p-3 max-h-48 overflow-auto whitespace-pre-wrap break-words shadow-soft">
            {JSON.stringify(json, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

// --- Types ---

interface AssetDetails {
  name: string;
  unitName: string;
  decimals: number;
}

interface PaymentRequirements {
  scheme: "exact";
  network: "algorand-testnet" | "algorand";
  maxAmountRequired: string;
  resource: string;
  description: string;
  mimeType: string;
  outputSchema?: Record<string, any>;
  payTo: string;
  maxTimeoutSeconds: number;
  asset: string;
  extra?: Record<string, any>;
}

interface WindowX402 {
  paymentRequirements: PaymentRequirements[];
  currentUrl: string;
  testnet: boolean;
}

declare global {
  interface Window {
    x402?: WindowX402;
  }
}

// --- Main Component ---

function App() {
  const { activeAccount, signTransactions, activeWallet, algodClient } =
    useWallet();
  const { activeNetwork, setActiveNetwork } = useNetwork();

  const [paymentData, setPaymentData] = useState<WindowX402 | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assetDetails, setAssetDetails] = useState<
    Record<string, AssetDetails>
  >({});
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  const handleSuccessfulResponse = useCallback(async (response: Response) => {
    setIsLoadingContent(true);
    try {
      const contentType = response.headers.get("content-type") || "";
      const contentDisposition =
        response.headers.get("content-disposition") || "";
      const clonedResponse = response.clone();
      try {
        const data = await clonedResponse.json();
        if (data.redirect) {
          window.open(data.link, "_blank");
          return;
        }
      } catch (error) {}

      // Handle HTML content
      if (contentType.includes("text/html")) {
        const html = await response.text();
        document.documentElement.innerHTML = html;
        return;
      }

      // Handle file downloads/displays
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      // Determine if we should display inline or download
      const isInline =
        contentDisposition.includes("inline") ||
        contentType.startsWith("image/") ||
        contentType.startsWith("video/") ||
        contentType.startsWith("audio/") ||
        contentType === "application/pdf";

      if (isInline) {
        // For images, videos, audio, PDFs - open in new tab/window
        window.open(blobUrl, "_blank");
        // Clean up after a delay
        setTimeout(() => {
          window.URL.revokeObjectURL(blobUrl);
        }, 1000);
      } else {
        // For other files - trigger download
        const link = document.createElement("a");
        link.href = blobUrl;

        // Extract filename from Content-Disposition header or use default
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        );
        const filename = filenameMatch
          ? filenameMatch[1].replace(/['"]/g, "")
          : `download-${Date.now()}`;

        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up
        setTimeout(() => {
          window.URL.revokeObjectURL(blobUrl);
        }, 100);
      }
    } catch (error) {
      console.error("Error handling successful response:", error);
      setErrorMessage(
        "An issue occurred while handling the successful response."
      );
      setPaymentStatus("error");
    } finally {
      setIsLoadingContent(false);
    }
  }, []);

  useEffect(() => {
    if (window.x402) {
      setPaymentData(window.x402);
      const targetNetwork = window.x402.testnet
        ? NetworkId.TESTNET
        : NetworkId.MAINNET;
      if (activeNetwork !== targetNetwork) {
        setActiveNetwork(targetNetwork);
      }
    }
  }, [activeNetwork, setActiveNetwork]);

  useEffect(() => {
    const fetchAssetDetails = async () => {
      if (!paymentData || !algodClient) return;

      setIsLoadingAssets(true);
      setErrorMessage("");
      try {
        const details: Record<string, AssetDetails> = {};
        const assetIds = new Set(
          paymentData.paymentRequirements
            .map((req) => req.asset)
            .filter((id) => id !== "0")
        );

        for (const assetId of assetIds) {
          const asset = await algodClient.getAssetByID(parseInt(assetId)).do();
          details[assetId] = {
            name: asset.params.name || "Unknown Asset",
            unitName: asset.params.unitName || "units",
            decimals: asset.params.decimals,
          };
        }
        setAssetDetails(details);
      } catch (error) {
        console.error("Failed to fetch asset details:", error);
        setErrorMessage(
          "Could not load asset information. Please refresh and try again."
        );
      } finally {
        setIsLoadingAssets(false);
      }
    };

    fetchAssetDetails();
  }, [paymentData, algodClient]);

  const handleDisconnect = async () => {
    if (activeWallet) {
      try {
        await activeWallet.disconnect();
      } catch (error) {
        console.error("Failed to disconnect:", error);
        setErrorMessage("An issue occurred while disconnecting.");
      }
    }
  };

  const bytesToBase64 = (bytes: Uint8Array) => {
    return Buffer.from(bytes).toString("base64");
  };

  const processPayment = async () => {
    if (!activeAccount || !paymentData || !signTransactions || !algodClient) {
      setErrorMessage("Wallet not connected or payment data missing.");
      return;
    }

    setIsProcessing(true);
    setPaymentStatus("processing");
    setErrorMessage("");

    try {
      const suggestedParams = await algodClient.getTransactionParams().do();
      const requirements = paymentData.paymentRequirements[0];
      if (!requirements) {
        setErrorMessage("Payment requirements are not defined.");
        setPaymentStatus("error");
        return;
      }

      const feePayer = requirements.extra?.feePayer;
      const payTo = requirements.payTo;
      const maxAmountRequired = parseInt(requirements.maxAmountRequired, 10);
      const assetId = parseInt(requirements.asset, 10);

      if (feePayer) {
        suggestedParams.fee = 0n;
        suggestedParams.flatFee = true;
      }

      const paymentTxn: algosdk.Transaction =
        algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
          sender: activeAccount.address,
          receiver: payTo,
          amount: maxAmountRequired,
          assetIndex: assetId,
          suggestedParams,
        });

      const txns = [paymentTxn];

      if (feePayer) {
        const feePayerSuggestedParams = { ...suggestedParams };
        feePayerSuggestedParams.fee = 2000n;
        feePayerSuggestedParams.flatFee = true;
        txns.push(
          algosdk.makePaymentTxnWithSuggestedParamsFromObject({
            sender: feePayer,
            receiver: feePayer,
            amount: 0n,
            suggestedParams: feePayerSuggestedParams,
          })
        );
      }

      const paymentIndex = 0;
      const group = algosdk.assignGroupID(txns);
      const stxns = await signTransactions(
        group.map((t) => t.toByte()),
        [paymentIndex]
      );

      const paymentBytes = bytesToBase64(stxns[paymentIndex]!);
      const payments = [paymentBytes];
      if (feePayer && group[1]) {
        const feePayerBytes = bytesToBase64(group[1].toByte());
        payments.push(feePayerBytes);
      }

      const paymentObject = {
        x402Version: 1,
        scheme: "exact",
        network: requirements.network,
        payload: {
          paymentIndex,
          paymentGroup: payments,
        },
      };

      const base64Payment = Buffer.from(JSON.stringify(paymentObject)).toString(
        "base64"
      );

      // --- NEW LOGIC: Fetch content based on outputSchema ---
      const outputSchema = requirements.outputSchema as any;
      const method = outputSchema?.input?.method?.toUpperCase() || "GET";

      // First, try with redirect: "follow" to see if we can get the final URL
      // If it fails with CORS, we know it redirected externally and will handle it

      try {
        const response = await fetch(paymentData.currentUrl, {
          method: method,
          headers: {
            "X-PAYMENT": base64Payment,
            Accept: "text/html",
          },
        });
        if (response.ok) {
          setPaymentStatus("success");
          await handleSuccessfulResponse(response);
        } else {
          const errorBody = await response.text();
          console.error(
            "Payment submission failed:",
            response.status,
            errorBody
          );
          setErrorMessage(
            `Payment submission failed: ${
              response.statusText || response.status
            }. ${errorBody}`.trim()
          );
          setPaymentStatus("error");
        }
      } catch (error: any) {
        console.error("Error fetching response:", error);
        setErrorMessage("Error fetching content response. Please try again.");
        setPaymentStatus("error");
      } finally {
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error("Payment failed:", error);
      if (error.message?.includes("cancelled")) {
        setErrorMessage("Payment was cancelled.");
      } else {
        setErrorMessage(
          "Payment failed. Please check your balance and try again."
        );
      }
      throw error;
    }
  };

  const formatAmount = (amountStr: string, assetIdStr: string) => {
    const amount = BigInt(amountStr);
    const assetId = assetIdStr;

    const details = assetDetails[assetId];
    if (!details) return `${amount.toString()} units`;

    const formattedAmount = (
      Number(amount) / Math.pow(10, details.decimals)
    ).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: details.decimals,
    });
    return `${formattedAmount} ${details.unitName}`;
  };

  const renderContent = () => {
    if (!paymentData || isLoadingAssets) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse-soft bg-gradient-primary rounded-full blur-xl opacity-30"></div>
            <Spinner />
          </div>
          <p className="text-muted-foreground font-medium">
            Loading Payment Information...
          </p>
        </div>
      );
    }

    if (!activeAccount) {
      return (
        <>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary mb-4 shadow-glow-primary">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Payment Required
            </h1>
            <p className="text-muted-foreground font-medium">
              Connect your wallet to proceed with payment.
            </p>
          </div>

          <div className="mb-6 space-y-3">
            {paymentData.paymentRequirements.map((req, index) => (
              <div
                key={index}
                className="relative border-2 border-border/50 rounded-xl p-5 bg-gradient-card shadow-medium hover:shadow-strong transition-smooth overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-primary opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-smooth"></div>
                <div className="relative">
                  <p className="text-sm text-muted-foreground mb-3 font-semibold">
                    {req.description || "Payment required"}
                  </p>
                  <p className="font-bold text-2xl text-foreground">
                    {formatAmount(req.maxAmountRequired, req.asset)}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 capitalize border border-primary-200">
                      {req.network.replace("algorand-", "")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="relative w-full py-3.5 px-4 rounded-xl font-semibold transition-smooth bg-gradient-primary text-primary-foreground hover:shadow-glow-primary hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-background overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Connect Wallet
            </span>
            <div className="absolute inset-0 bg-gradient-shine transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </button>
          {errorMessage && <ErrorDisplay message={errorMessage} />}
        </>
      );
    }

    return (
      <>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-primary mb-3 shadow-glow-primary">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Complete Payment
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Review and confirm your transaction
          </p>
        </div>

        <div className="mb-6 bg-gradient-hero border-2 border-primary-100 p-4 rounded-xl shadow-soft">
          <div className="flex items-center justify-between">
            <div className="text-sm overflow-hidden flex-1 min-w-0">
              <span className="text-muted-foreground block mb-1.5 font-medium">
                Connected Wallet
              </span>
              <p
                className="font-mono text-foreground truncate text-xs bg-white/60 px-2.5 py-1.5 rounded-md"
                title={activeAccount.address}
              >
                {activeAccount.address}
              </p>
            </div>
            <button
              onClick={handleDisconnect}
              className="text-sm cursor-pointer font-semibold text-destructive hover:text-destructive/80 transition-fast flex-shrink-0 ml-4 px-3 py-1.5 rounded-lg hover:bg-destructive/5 bg-destructive/5"
            >
              Disconnect
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-primary-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path
                fillRule="evenodd"
                d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                clipRule="evenodd"
              />
            </svg>
            Payment Summary
          </h2>
          {paymentData.paymentRequirements.map((req, index) => (
            <div
              key={index}
              className="relative border-2 border-primary-100 rounded-xl p-5 mb-3 bg-gradient-card shadow-medium hover:shadow-strong transition-smooth overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-primary opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-smooth"></div>
              <div className="relative">
                <p className="text-sm text-muted-foreground mb-3 font-semibold">
                  {req.description || "Payment"}
                </p>
                <p className="font-bold text-3xl text-foreground mb-3">
                  {formatAmount(req.maxAmountRequired, req.asset)}
                </p>
                <div className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-lg">
                  <svg
                    className="w-4 h-4 text-muted-foreground flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <div className="text-xs overflow-hidden flex-1 min-w-0">
                    <span className="text-muted-foreground font-medium">
                      Recipient:
                    </span>{" "}
                    <span className="font-mono text-primary-600 font-semibold">
                      {req.payTo.slice(0, 8)}...{req.payTo.slice(-8)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {paymentStatus === "success" ? (
          <div className="p-5 bg-success/10 border-2 border-success/30 rounded-xl text-center shadow-medium backdrop-blur-sm">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success/20 mb-3">
              <svg
                className="w-6 h-6 text-success"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-success font-bold text-lg">
              Payment Successful!
            </p>
            {isLoadingContent ? (
              <p className="text-muted-foreground text-sm mt-2 flex items-center justify-center gap-2">
                <Spinner />
                Loading content...
              </p>
            ) : (
              <p className="text-muted-foreground text-sm mt-2 flex items-center justify-center gap-2">
                Content loaded successfully.
              </p>
            )}
          </div>
        ) : (
          <>
            <button
              onClick={processPayment}
              disabled={isProcessing}
              className="relative w-full py-3.5 px-4 rounded-xl font-semibold transition-smooth flex items-center justify-center bg-gradient-primary text-primary-foreground hover:shadow-glow-primary hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 overflow-hidden group"
            >
              {isProcessing ? (
                <>
                  <Spinner />
                  <span className="ml-2">Processing Payment...</span>
                </>
              ) : (
                <>
                  <span className="relative z-10 flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Pay Now
                  </span>
                  <div className="absolute inset-0 bg-gradient-shine transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </>
              )}
            </button>
            <p className="text-xs text-muted-foreground text-center mt-4 flex items-center justify-center gap-1.5">
              <svg
                className="w-3.5 h-3.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              You will be asked to approve the transaction in your wallet.
            </p>
          </>
        )}

        {paymentStatus === "error" && errorMessage && (
          <ErrorDisplay message={errorMessage} />
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="relative">
        {/* Decorative background elements */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-soft"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-accent/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-soft delay-1000"></div>

        {/* Main card */}
        <div className="relative bg-white/80 backdrop-blur-xl border-2 border-primary-100 p-8 rounded-2xl shadow-strong max-w-md w-full">
          {renderContent()}
        </div>
      </div>
      <WalletConnectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default App;
