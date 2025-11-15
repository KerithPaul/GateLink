import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { Link, Calendar, ExternalLink, Wallet } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError, type Link as LinkType } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useWallet } from "@txnlab/use-wallet-react";
import WalletConnectModal from "@/components/WalletConnectModal";

const Dashboard = () => {
  const { activeAccount } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const {
    data: links,
    isLoading,
    error,
    refetch,
  } = useQuery<LinkType[]>({
    queryKey: ["links", activeAccount?.address],
    queryFn: () => api.getLinks(activeAccount!.address),
    enabled: !!activeAccount?.address,
  });

  useEffect(() => {
    if (!activeAccount) {
      setIsModalOpen(true);
    }
  }, [activeAccount]);

  const handleViewAnalytics = (linkId: string) => {
    navigate(`/analytics/${linkId}`);
  };

  const getContentTypeIcon = (contentType: string) => {
    return contentType === "FILE" ? "📄" : "🔗";
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  if (!activeAccount) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 pb-20">
          <div className="max-w-2xl mx-auto">
            <Card className="p-12 text-center bg-gradient-card border-border/50">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
                <Wallet className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Wallet Connection Required</h2>
              <p className="text-muted-foreground mb-6">
                Please connect your wallet to view your payment links dashboard.
              </p>
              <Button
                onClick={() => setIsModalOpen(true)}
                variant="hero"
                className="gap-2"
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </Button>
            </Card>
          </div>
        </div>
        <WalletConnectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Your Links</h1>
            <p className="text-muted-foreground text-lg">
              View and manage your payment links
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <Wallet className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground font-mono">
                {activeAccount.address.slice(0, 8)}...{activeAccount.address.slice(-6)}
              </p>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading links...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="p-6 bg-destructive/10 border-destructive/20">
              <p className="text-destructive">
                {error instanceof ApiError
                  ? error.message
                  : "Failed to load links. Please try again."}
              </p>
            </Card>
          )}

          {/* Empty State */}
          {!isLoading && !error && links && links.length === 0 && (
            <Card className="p-12 text-center bg-gradient-card border-border/50">
              <Link className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No links found</h3>
              <p className="text-muted-foreground mb-6">
                You haven't created any payment links yet. Start by uploading your first content.
              </p>
              <Button onClick={() => navigate("/upload")} variant="hero">
                Create Your First Link
              </Button>
            </Card>
          )}

          {/* Links Grid */}
          {!isLoading && !error && links && links.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {links.map((link) => (
                <Card
                  key={link.id}
                  className="p-6 bg-gradient-card border-border/50 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {getContentTypeIcon(link.contentType)}
                      </span>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {link.contentType === "FILE"
                            ? link.contentPath?.split("-").pop() || "File"
                            : "External Link"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {link.contentType}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Price</span>
                      <span className="font-semibold">${link.price}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Earnings</span>
                      <span className="font-semibold text-accent">
                        ${link.totalEarnings || "0.00"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Payments</span>
                      <span className="font-semibold">{link.paymentCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(link.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleViewAnalytics(link.id)}
                    >
                      Analytics
                    </Button>
                    <Button
                      variant="glass"
                      onClick={() => {
                        const paymentLink = `${window.location.origin}/pay/${link.id}`;
                        navigator.clipboard.writeText(paymentLink);
                        toast.success("Link copied to clipboard!");
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <WalletConnectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Dashboard;

