import { PaymentRequirements } from "../types";
import { escapeString } from "../helpers";
import fs from "fs";
import path from "path";

// Read the static HTML file once when the module loads.
// This is efficient as it caches the template in memory.
// It resolves relative to the current file, so it works in dev and prod.
const paywallPath = path.resolve(process.cwd(), "public", "paywall.html");
const PAYWALL_TEMPLATE = fs.readFileSync(paywallPath, "utf-8");

export const getPaywallHtml = (
  paymentRequirements: PaymentRequirements[],
  currentUrl: string,
  testnet: boolean
) => {
  const configScript = `
    <script>
        window.x402 = {
            paymentRequirements: ${JSON.stringify(paymentRequirements)},
            currentUrl: "${escapeString(currentUrl)}",
            testnet: ${testnet}
        }
    </script>
    `;

  return PAYWALL_TEMPLATE.replace("</head>", `${configScript}\n</head>`);
};
