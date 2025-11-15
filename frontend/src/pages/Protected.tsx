import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { Lock, Wallet, CheckCircle2, FileText } from "lucide-react";
import { toast } from "sonner";

const Protected = () => {
  const [searchParams] = useSearchParams();
  const contentId = searchParams.get("content");
  const [isPaid, setIsPaid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Mock content data
  const contentPrice = "5.0";
  const contentType = "video";

  const handlePayment = () => {
    setIsProcessing(true);
    
    // Simulate payment process
    setTimeout(() => {
      setIsPaid(true);
      setIsProcessing(false);
      toast.success("Payment successful! Content unlocked");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-3xl mx-auto">
          {!isPaid ? (
            // Paywall View
            <Card className="p-12 bg-gradient-card border-border/50 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow-primary">
                <Lock className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Premium Content
              </h1>
              
              <p className="text-muted-foreground text-lg mb-8">
                This content is locked. Pay to unlock and view.
              </p>

              <div className="inline-flex items-center gap-2 bg-secondary px-6 py-3 rounded-full mb-8">
                <Wallet className="w-5 h-5 text-accent" />
                <span className="text-2xl font-bold">{contentPrice} ALGO</span>
              </div>

              <div className="space-y-4 max-w-sm mx-auto">
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    "Processing Payment..."
                  ) : (
                    <>
                      <Wallet className="w-5 h-5" />
                      Pay with Wallet
                    </>
                  )}
                </Button>

                <div className="text-sm text-muted-foreground">
                  <p>Content ID: {contentId}</p>
                  <p className="mt-2">Powered by Algorand X402</p>
                </div>
              </div>
            </Card>
          ) : (
            // Content Unlocked View
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-accent">
                <CheckCircle2 className="w-6 h-6" />
                <span className="font-medium">Payment confirmed - Content unlocked</span>
              </div>

              <Card className="p-8 bg-gradient-card border-border/50">
                <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center mb-6">
                  {contentType === "video" ? (
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Video Player Placeholder</p>
                      <p className="text-sm text-muted-foreground mt-2">Your content would appear here</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Content Preview</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Premium Content</h2>
                    <p className="text-sm text-muted-foreground">Thank you for your purchase!</p>
                  </div>
                  <Button variant="glass">
                    Download
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Protected;
