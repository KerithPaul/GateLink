import React, { StrictMode, Suspense, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
// Lazily import use-wallet-react only when the modal is opened to avoid
// top-level dynamic imports during initial bundle creation.
let WalletProvider: any;
let WalletManager: any;
let WalletId: any;
let NetworkId: any;
const LazyApp = React.lazy(() => import(
  /* webpackMode: "eager" */ "./App"
));
import { Buffer } from "buffer";

(window as any).Buffer = Buffer;
(window as any).global = window;

async function ensureWalletLibLoaded() {
  if (!WalletProvider) {
    const mod = await import(
      /* webpackMode: "eager" */ "@txnlab/use-wallet-react"
    );
    WalletProvider = mod.WalletProvider;
    WalletManager = mod.WalletManager;
    WalletId = mod.WalletId;
    NetworkId = mod.NetworkId;
  }
}

function Bootstrap() {
  const [manager, setManager] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const start = async () => {
    setLoading(true);
    await ensureWalletLibLoaded();
    setManager(
      new WalletManager({
        wallets: [WalletId.PERA, WalletId.LUTE, WalletId.DEFLY],
        defaultNetwork: NetworkId.TESTNET,
      })
    );
  };

  // Auto-load wallet UI on page load
  useEffect(() => {
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!manager) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Required</h1>
          <p className="text-gray-600 mb-6">Loading wallet UI...</p>
        </div>
      </div>
    );
  }

  return (
    <WalletProvider manager={manager}>
      <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
        <LazyApp />
      </Suspense>
    </WalletProvider>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <Bootstrap />
  </StrictMode>
);
