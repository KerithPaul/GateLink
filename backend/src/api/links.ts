import { Router, Request, Response } from "express";
import { upload } from "../utils/upload";
import prisma from "../db";
import algosdk from "algosdk";
import { Network } from "../middleware/types";
import { getDefaultAssetDecimals } from "../middleware/helpers";

const router = Router();

// Validation helper
function isValidAlgorandAddress(address: string): boolean {
  return algosdk.isValidAddress(address);
}

// POST /api/links - Create a new link
router.post("/", upload.single("file"), async (req: Request, res: Response) => {
  try {
    const { wallet, price, contentType, url, network } = req.body;

    // Validate required fields
    if (!wallet || !price || !contentType) {
      return res.status(400).json({
        error: "Missing required fields: wallet, price, contentType",
      });
    }

    // Validate wallet address
    if (!isValidAlgorandAddress(wallet)) {
      return res.status(400).json({ error: "Invalid Algorand wallet address" });
    }

    // Validate contentType
    if (contentType !== "FILE" && contentType !== "URL") {
      return res.status(400).json({
        error: "contentType must be either 'FILE' or 'URL'",
      });
    }

    // Validate price
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return res.status(400).json({ error: "Price must be a positive number" });
    }

    // Validate network
    const validNetworks: Network[] = ["algorand", "algorand-testnet"];
    const selectedNetwork = (network || "algorand-testnet") as Network;
    if (!validNetworks.includes(selectedNetwork)) {
      return res.status(400).json({
        error: `Network must be one of: ${validNetworks.join(", ")}`,
      });
    }

    let contentPath: string | null = null;

    if (contentType === "FILE") {
      // Handle file upload
      if (!req.file) {
        return res.status(400).json({ error: "File is required for FILE type" });
      }
      contentPath = req.file.filename; // Store just the filename
    } else if (contentType === "URL") {
      // Handle URL
      if (!url) {
        return res.status(400).json({ error: "URL is required for URL type" });
      }
      try {
        new URL(url); // Validate URL format
        contentPath = url;
      } catch {
        return res.status(400).json({ error: "Invalid URL format" });
      }
    }

    // Get asset configuration
    const asset = getDefaultAssetDecimals(selectedNetwork);

    // Create link in database
    const link = await prisma.link.create({
      data: {
        creatorWallet: wallet,
        contentType,
        contentPath,
        price: priceNum,
        network: selectedNetwork,
        assetId: BigInt(asset.id),
        decimals: asset.decimals,
      },
    });

    return res.status(201).json({
      id: link.id,
      creatorWallet: link.creatorWallet,
      contentType: link.contentType,
      price: link.price.toString(),
      network: link.network,
      createdAt: link.createdAt,
    });
  } catch (error) {
    console.error("Error creating link:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/links - Get all links by creator wallet
router.get("/", async (req: Request, res: Response) => {
  try {
    const { wallet } = req.query;

    if (!wallet || typeof wallet !== "string") {
      return res.status(400).json({ error: "wallet query parameter is required" });
    }

    if (!isValidAlgorandAddress(wallet)) {
      return res.status(400).json({ error: "Invalid Algorand wallet address" });
    }

    const links = await prisma.link.findMany({
      where: {
        creatorWallet: wallet,
      },
      include: {
        payments: {
          select: {
            amount: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate total earnings for each link
    const linksWithEarnings = links.map((link) => {
      const totalEarnings = link.payments.reduce(
        (sum, payment) => sum + Number(payment.amount),
        0
      );
      const paymentCount = link.payments.length;

      return {
        id: link.id,
        creatorWallet: link.creatorWallet,
        contentType: link.contentType,
        contentPath: link.contentPath,
        price: link.price.toString(),
        network: link.network,
        createdAt: link.createdAt,
        totalEarnings: totalEarnings.toString(),
        paymentCount,
      };
    });

    return res.json(linksWithEarnings);
  } catch (error) {
    console.error("Error fetching links:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/links/:linkId - Get specific link details
router.get("/:linkId", async (req: Request, res: Response) => {
  try {
    const { linkId } = req.params;

    const link = await prisma.link.findUnique({
      where: {
        id: linkId,
      },
      include: {
        payments: {
          select: {
            amount: true,
          },
        },
      },
    });

    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    const totalEarnings = link.payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    );
    const paymentCount = link.payments.length;

    return res.json({
      id: link.id,
      creatorWallet: link.creatorWallet,
      contentType: link.contentType,
      contentPath: link.contentPath,
      price: link.price.toString(),
      network: link.network,
      createdAt: link.createdAt,
      totalEarnings: totalEarnings.toString(),
      paymentCount,
    });
  } catch (error) {
    console.error("Error fetching link:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

