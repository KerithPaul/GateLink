import React, { useEffect, useState } from "react";
import { WalletProvider as TxnLabWalletProvider, WalletManager, WalletId, NetworkId } from "@txnlab/use-wallet-react";
import { Buffer } from "buffer";

// Polyfill Buffer for browser
if (typeof window !== "undefined") {
  (window as any).Buffer = Buffer;
  (window as any).global = window;
}

interface WalletProviderWrapperProps {
  children: React.ReactNode;
}

export const WalletProviderWrapper: React.FC<WalletProviderWrapperProps> = ({ children }) => {
  const [manager, setManager] = useState<WalletManager | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initWallet = async () => {
      try {
        const walletManager = new WalletManager({
          wallets: [WalletId.PERA, WalletId.LUTE, WalletId.DEFLY],
          defaultNetwork: NetworkId.TESTNET,
        });
        setManager(walletManager);
      } catch (error) {
        console.error("Failed to initialize wallet manager:", error);
      } finally {
        setLoading(false);
      }
    };

    initWallet();
  }, []);

  if (loading || !manager) {
    return null; // Or a loading spinner if needed
  }

  return <TxnLabWalletProvider manager={manager}>{children}</TxnLabWalletProvider>;
};

