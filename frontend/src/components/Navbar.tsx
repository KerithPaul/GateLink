import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, Home, Upload, LayoutDashboard } from "lucide-react";
import { useWallet } from "@txnlab/use-wallet-react";
import WalletConnectModal from "./WalletConnectModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const { activeAccount, activeWallet } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  const handleDisconnect = async () => {
    if (activeWallet) {
      try {
        await activeWallet.disconnect();
      } catch (error) {
        console.error("Failed to disconnect:", error);
      }
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    {
      path: "/",
      label: "Home",
      icon: Home,
      showAlways: true,
    },
    {
      path: "/upload",
      label: "Upload",
      icon: Upload,
      showWhenConnected: true,
    },
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      showWhenConnected: true,
    },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary" />
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              GateLink
            </span>
          </Link>

          <div className="flex items-center gap-6">
            {navLinks
              .filter((link) => link.showAlways || (link.showWhenConnected && activeAccount))
              .map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      "text-sm flex items-center gap-2 transition-colors",
                      isActive(link.path)
                        ? "text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            {activeAccount ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Wallet className="w-4 h-4" />
                    <span className="font-mono text-xs">
                      {formatAddress(activeAccount.address)}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-xs text-muted-foreground">Connected Wallet</p>
                    <p className="text-xs font-mono text-foreground truncate mt-1" title={activeAccount.address}>
                      {activeAccount.address}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDisconnect} className="text-destructive cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="gap-2 bg-gradient-primary hover:shadow-glow-primary"
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </nav>
      <WalletConnectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default Navbar;
