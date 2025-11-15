// Simple script to copy Vite single-file output to server public folder
const fs = require("fs");
const path = require("path");

const SRC = path.resolve(process.cwd(), "paywall", "dist", "index.html");
const DEST_DIR = path.resolve(process.cwd(), "public");
const DEST = path.join(DEST_DIR, "paywall.html");

try {
  if (!fs.existsSync(SRC)) {
    console.error(`Source not found: ${SRC}`);
    process.exit(1);
  }
  if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
  }
  fs.copyFileSync(SRC, DEST);
  const bytes = fs.statSync(DEST).size;
  console.log(`Copied paywall HTML → ${DEST} (${bytes} bytes)`);
} catch (err) {
  console.error("Failed to copy paywall HTML:", err);
  process.exit(1);
}


