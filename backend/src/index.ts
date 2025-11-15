import express from "express";
import "dotenv/config";
import algosdk from "algosdk";
import cors from "cors";
import linksRouter from "./api/links";
import paymentsRouter from "./api/payments";
import { createPayRoute } from "./routes/pay";

if (!process.env.FACILITATOR_MNEMONIC) {
  throw new Error("FACILITATOR_MNEMONIC is not set");
}

const facilitator_mnemonic = process.env.FACILITATOR_MNEMONIC;
const account = algosdk.mnemonicToSecretKey(facilitator_mnemonic);

const facilitator = {
  account: account,
  feePayer: true,
};

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/links", linksRouter);
app.use("/api/links", paymentsRouter);

// Dynamic Payment Route
app.use("/pay", createPayRoute(facilitator));

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
