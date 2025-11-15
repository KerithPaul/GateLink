import { Router, Request, Response } from "express";
import prisma from "../db";

const router = Router();

// GET /api/links/:linkId/payments - List all successful payments for a link
router.get("/:linkId/payments", async (req: Request, res: Response) => {
  try {
    const { linkId } = req.params;

    // Verify link exists
    const link = await prisma.link.findUnique({
      where: { id: linkId },
    });

    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    const payments = await prisma.payment.findMany({
      where: {
        linkId,
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    return res.json(
      payments.map((payment) => ({
        id: payment.id,
        payerAddress: payment.payerAddress,
        amount: payment.amount.toString(),
        txnId: payment.txnId,
        txnGroupId: payment.txnGroupId,
        timestamp: payment.timestamp,
      }))
    );
  } catch (error) {
    console.error("Error fetching payments:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/links/:linkId/analytics - Get payment history and earnings
router.get("/:linkId/analytics", async (req: Request, res: Response) => {
  try {
    const { linkId } = req.params;

    const link = await prisma.link.findUnique({
      where: { id: linkId },
      include: {
        payments: {
          orderBy: {
            timestamp: "desc",
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

    // Calculate earnings by day for chart data
    const earningsByDay = link.payments.reduce(
      (acc, payment) => {
        const date = payment.timestamp.toISOString().split("T")[0];
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += Number(payment.amount);
        return acc;
      },
      {} as Record<string, number>
    );

    const chartData = Object.entries(earningsByDay)
      .map(([date, amount]) => ({
        date,
        amount: amount.toString(),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return res.json({
      link: {
        id: link.id,
        creatorWallet: link.creatorWallet,
        contentType: link.contentType,
        contentPath: link.contentPath,
        price: link.price.toString(),
        network: link.network,
        createdAt: link.createdAt,
      },
      stats: {
        totalEarnings: totalEarnings.toString(),
        paymentCount: link.payments.length,
        averagePayment: link.payments.length > 0
          ? (totalEarnings / link.payments.length).toString()
          : "0",
      },
      payments: link.payments.map((payment) => ({
        id: payment.id,
        payerAddress: payment.payerAddress,
        amount: payment.amount.toString(),
        txnId: payment.txnId,
        txnGroupId: payment.txnGroupId,
        timestamp: payment.timestamp,
      })),
      chartData,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

