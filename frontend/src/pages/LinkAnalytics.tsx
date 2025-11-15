import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { api, ApiError, type LinkAnalytics } from "@/services/api";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const LinkAnalytics = () => {
  const { linkId } = useParams<{ linkId: string }>();
  const navigate = useNavigate();

  const {
    data: analytics,
    isLoading,
    error,
  } = useQuery<LinkAnalytics>({
    queryKey: ["analytics", linkId],
    queryFn: () => api.getLinkAnalytics(linkId!),
    enabled: !!linkId,
  });

  const getExplorerUrl = (txnId: string | null, network: string) => {
    if (!txnId) return null;
    const baseUrl =
      network === "algorand"
        ? "https://algoexplorer.io/tx/"
        : "https://testnet.algoexplorer.io/tx/";
    return `${baseUrl}${txnId}`;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy HH:mm");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 pb-20">
          <div className="text-center">
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 pb-20">
          <Card className="p-6 bg-destructive/10 border-destructive/20">
            <p className="text-destructive">
              {error instanceof ApiError
                ? error.message
                : "Failed to load analytics. Please try again."}
            </p>
            <Button
              onClick={() => navigate("/dashboard")}
              variant="outline"
              className="mt-4"
            >
              Back to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">Link Analytics</h1>
            <p className="text-muted-foreground">
              {analytics.link.contentType === "FILE" ? "File" : "External Link"} • Created{" "}
              {formatDate(analytics.link.createdAt)}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card className="p-6 bg-gradient-card border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
                  <p className="text-3xl font-bold text-accent">
                    ${analytics.stats.totalEarnings}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-accent" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-card border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Payments</p>
                  <p className="text-3xl font-bold">{analytics.stats.paymentCount}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-card border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Average Payment</p>
                  <p className="text-3xl font-bold">${analytics.stats.averagePayment}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </Card>
          </div>

          {/* Link Details */}
          <Card className="p-6 mb-8 bg-gradient-card border-border/50">
            <h2 className="text-xl font-semibold mb-4">Link Details</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="text-lg font-semibold">${analytics.link.price}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Network</p>
                <p className="text-lg font-semibold">{analytics.link.network}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Content Type</p>
                <p className="text-lg font-semibold">{analytics.link.contentType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Creator Wallet</p>
                <p className="text-lg font-mono text-sm break-all">
                  {analytics.link.creatorWallet}
                </p>
              </div>
            </div>
          </Card>

          {/* Payment History */}
          <Card className="p-6 bg-gradient-card border-border/50">
            <h2 className="text-xl font-semibold mb-4">Payment History</h2>
            {analytics.payments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No payments yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Payer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Transaction</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {formatDate(payment.timestamp)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-mono text-sm">
                            {payment.payerAddress.slice(0, 8)}...
                            {payment.payerAddress.slice(-8)}
                          </p>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-accent">
                            ${payment.amount}
                          </span>
                        </TableCell>
                        <TableCell>
                          {payment.txnId ? (
                            <a
                              href={getExplorerUrl(
                                payment.txnId,
                                analytics.link.network
                              )!}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-primary hover:underline"
                            >
                              View
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LinkAnalytics;

