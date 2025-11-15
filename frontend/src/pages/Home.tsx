import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { Upload, Link2, Wallet, CheckCircle2 } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: `url(${heroBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Monetize Any Link
              <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                In Seconds
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Upload content, set a price, and share paid-access links. Get paid instantly via Algorand's X402 protocol.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/upload">
                <Button variant="hero" size="lg">
                  Try Demo
                </Button>
              </Link>
              <Button variant="glass" size="lg">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg">
              Four simple steps to start earning
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Upload,
                title: "Upload Content",
                description: "Upload any file - video, PDF, audio, or document"
              },
              {
                icon: Wallet,
                title: "Set Price",
                description: "Choose your price in ALGO tokens"
              },
              {
                icon: Link2,
                title: "Share Link",
                description: "Get a unique paid-access link to share"
              },
              {
                icon: CheckCircle2,
                title: "Get Paid",
                description: "Instant payment when users unlock content"
              }
            ].map((step, index) => (
              <Card key={index} className="p-6 bg-gradient-card border-border/50 hover:border-primary/50 transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Built for <span className="bg-gradient-primary bg-clip-text text-transparent">Creators</span>
              </h2>
              <p className="text-muted-foreground text-lg">
                No middlemen. No fees. No hassle.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Instant Payments",
                  description: "Get paid immediately via Algorand blockchain"
                },
                {
                  title: "Low Fees",
                  description: "Minimal transaction costs with Algorand"
                },
                {
                  title: "Your Content",
                  description: "Full control over pricing and access"
                }
              ].map((feature, index) => (
                <Card key={index} className="p-6 bg-card border-border/50">
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center bg-gradient-card border border-border/50 rounded-2xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Earning?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join creators who are monetizing their content the Web3 way
            </p>
            <Link to="/upload">
              <Button variant="hero" size="lg">
                Upload Your First Content
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
