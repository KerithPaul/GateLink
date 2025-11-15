import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import { Upload as UploadIcon, Copy, CheckCircle2, Link as LinkIcon, Wallet, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/services/api";
import { useWallet } from "@txnlab/use-wallet-react";
import WalletConnectModal from "@/components/WalletConnectModal";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Upload = () => {
  const { activeAccount } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contentType, setContentType] = useState<"FILE" | "URL">("FILE");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [price, setPrice] = useState("");
  const [network, setNetwork] = useState("algorand-testnet");
  const [generatedLink, setGeneratedLink] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleGenerateLink = async () => {
    if (!activeAccount) {
      toast.error("Please connect your wallet first");
      setIsModalOpen(true);
      return;
    }

    if (!price) {
      toast.error("Please set a price");
      return;
    }

    if (contentType === "FILE" && !file) {
      toast.error("Please upload a file");
      return;
    }

    if (contentType === "URL" && !url) {
      toast.error("Please enter a URL");
      return;
    }

    setIsGenerating(true);

    try {
      const link = await api.createLink({
        wallet: activeAccount.address,
        price,
        contentType,
        url: contentType === "URL" ? url : undefined,
        network,
        file: contentType === "FILE" ? file! : undefined,
      });

      const paymentLink = `${API_BASE_URL}/pay/${link.id}`;
      setGeneratedLink(paymentLink);
      toast.success("Link generated successfully!");
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to create link. Please try again.");
      }
      console.error("Error creating link:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Upload Your Content
            </h1>
            <p className="text-muted-foreground text-lg">
              Upload any file, set your price, and start earning
            </p>
          </div>

          <Card className="p-8 bg-gradient-card border-border/50">
            <div className="space-y-6">
              {/* Wallet Address */}
              <div>
                <Label htmlFor="wallet" className="text-base mb-3 block">
                  Your Wallet Address
                </Label>
                {activeAccount ? (
                  <div className="relative">
                    <div className="flex items-center gap-3 px-4 py-3 bg-secondary border border-border rounded-md">
                      <Wallet className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-mono text-foreground truncate" title={activeAccount.address}>
                          {activeAccount.address}
                        </p>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Wallet connected
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 border-2 border-dashed border-border rounded-md">
                      <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          No wallet connected
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsModalOpen(true)}
                      className="w-full"
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      Connect Wallet
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      You need to connect your wallet to create paid links
                    </p>
                  </div>
                )}
              </div>

              {/* Content Type Toggle */}
              <div>
                <Label className="text-base mb-3 block">Content Type</Label>
                <Tabs value={contentType} onValueChange={(v) => setContentType(v as "FILE" | "URL")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="FILE">Upload File</TabsTrigger>
                    <TabsTrigger value="URL">External Link</TabsTrigger>
                  </TabsList>
                  <TabsContent value="FILE" className="mt-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <input
                        type="file"
                        id="file"
                        onChange={handleFileChange}
                        className="hidden"
                        accept="video/*,audio/*,.pdf,.doc,.docx,image/*"
                      />
                      <label htmlFor="file" className="cursor-pointer">
                        <UploadIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        {file ? (
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-accent" />
                            <span className="text-foreground font-medium">{file.name}</span>
                          </div>
                        ) : (
                          <div>
                            <p className="text-foreground font-medium mb-2">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Video, Audio, PDF, Image, or Document
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </TabsContent>
                  <TabsContent value="URL" className="mt-4">
                    <div>
                      <Input
                        type="url"
                        placeholder="https://example.com/content"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="text-lg h-12 bg-secondary border-border"
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        Enter the URL to your content
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Price Input */}
              <div>
                <Label htmlFor="price" className="text-base mb-3 block">
                  Set Price (USD)
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="5.0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="text-lg h-12 bg-secondary border-border"
                  min="0"
                  step="0.1"
                />
              </div>

              {/* Network Selection */}
              <div>
                <Label htmlFor="network" className="text-base mb-3 block">
                  Network
                </Label>
                <select
                  id="network"
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  className="flex h-12 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="algorand-testnet">Algorand TestNet</option>
                  <option value="algorand">Algorand MainNet</option>
                </select>
              </div>

              {/* Generate Button */}
              <Button 
                variant="hero" 
                size="lg" 
                className="w-full"
                onClick={handleGenerateLink}
                disabled={isGenerating || !activeAccount}
              >
                {isGenerating ? "Generating..." : activeAccount ? "Generate Paid Link" : "Connect Wallet to Continue"}
              </Button>

              {/* Generated Link */}
              {generatedLink && (
                <div className="mt-6 p-6 bg-secondary rounded-lg border border-border">
                  <Label className="text-sm text-muted-foreground mb-2 block">
                    Your Paid Link
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={generatedLink}
                      readOnly
                      className="bg-background border-border"
                    />
                    <Button variant="glass" onClick={handleCopyLink}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    Share this link to start receiving payments
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
      <WalletConnectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Upload;
