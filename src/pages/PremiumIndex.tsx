import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkles, Upload, Camera, Zap, Shield, TrendingUp, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import PremiumFooter from "@/components/PremiumFooter";

const PremiumIndex = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // In production, would handle file upload here
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-[var(--gradient-hero)]">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 border-b border-border/30 backdrop-blur-sm bg-background/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-[var(--shadow-card)]">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-semibold text-foreground tracking-tight">ReRoom AI</h1>
              <p className="text-xs text-muted-foreground">Digital Atelier for Spaces</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/auth")}
              className="text-foreground hover:text-primary transition-colors"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => navigate("/auth")}
              className="shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-float)] transition-all duration-500 rounded-2xl px-6"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card border border-border/50 text-sm text-foreground shadow-[var(--shadow-card)] mb-4">
            <Shield className="w-4 h-4 text-primary" />
            <span className="font-medium">Trusted by 500+ design professionals worldwide</span>
          </div>

          <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-foreground leading-[1.1] tracking-tight">
            Reimagine Your Space<br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary-glow bg-clip-text text-transparent">
              With AI Precision
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed">
            Upload a photo of your room and watch as advanced AI transforms it into any interior design style — instantly, professionally, beautifully.
          </p>
        </div>
      </section>

      {/* Upload Feature Section */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <Card 
            className={`p-12 border-2 transition-all duration-500 rounded-3xl shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-float)] bg-card ${
              isDragging ? 'border-primary bg-primary/5' : 'border-border/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-center space-y-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 shadow-[var(--shadow-card)]">
                <Upload className="w-10 h-10 text-primary" />
              </div>

              <div className="space-y-3">
                <h3 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
                  Start Your Transformation
                </h3>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Upload or capture your room photo to begin the AI-powered redesign process
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto pt-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={() => navigate("/auth")}
                />
                <input
                  type="file"
                  ref={cameraInputRef}
                  className="hidden"
                  accept="image/*"
                  capture="environment"
                  onChange={() => navigate("/auth")}
                />
                
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-auto py-6 px-6 rounded-2xl border-2 hover:border-primary hover:bg-primary/5 transition-all duration-500 group"
                >
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-500" />
                    <div>
                      <div className="font-semibold text-base text-foreground">Upload from Device</div>
                      <div className="text-xs text-muted-foreground mt-1">Browse your photo library</div>
                    </div>
                  </div>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => cameraInputRef.current?.click()}
                  className="h-auto py-6 px-6 rounded-2xl border-2 hover:border-primary hover:bg-primary/5 transition-all duration-500 group"
                >
                  <div className="flex flex-col items-center gap-3">
                    <Camera className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-500" />
                    <div>
                      <div className="font-semibold text-base text-foreground">Click from Camera</div>
                      <div className="text-xs text-muted-foreground mt-1">Capture your space now</div>
                    </div>
                  </div>
                </Button>
              </div>

              <p className="text-sm text-muted-foreground pt-2">
                or drag and drop your image anywhere in this area
              </p>

              <div className="flex items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>4 free credits</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>No credit card required</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 bg-card/30 backdrop-blur-sm border-y border-border/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h3 className="text-4xl md:text-5xl font-serif font-bold text-foreground tracking-tight">
              Luxury Meets Technology
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional-grade AI tools designed for discerning designers and homeowners
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-8 border border-border/50 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all duration-500 rounded-3xl bg-card group">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-[var(--shadow-card)]">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-2xl font-serif font-semibold text-foreground mb-3">Instant Results</h4>
              <p className="text-muted-foreground leading-relaxed">
                AI-powered transformations in seconds. No rendering delays, no complex software — just pure creative flow.
              </p>
            </Card>

            <Card className="p-8 border border-border/50 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all duration-500 rounded-3xl bg-card group">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-[var(--shadow-card)]">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-2xl font-serif font-semibold text-foreground mb-3">Premium Styles</h4>
              <p className="text-muted-foreground leading-relaxed">
                Curated design themes from Modern Minimalism to Luxury Elegance. Custom prompts for unlimited creativity.
              </p>
            </Card>

            <Card className="p-8 border border-border/50 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all duration-500 rounded-3xl bg-card group">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-[var(--shadow-card)]">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-2xl font-serif font-semibold text-foreground mb-3">Client Ready</h4>
              <p className="text-muted-foreground leading-relaxed">
                Professional before/after presentations with shareable preview pages. Impress clients instantly.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-12 text-center">
            Trusted by Design Professionals
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 text-center border border-border/50 rounded-3xl shadow-[var(--shadow-card)] bg-card">
              <div className="text-5xl font-bold text-primary mb-2 font-serif">500+</div>
              <div className="text-muted-foreground font-medium">Active Designers</div>
            </Card>
            <Card className="p-8 text-center border border-border/50 rounded-3xl shadow-[var(--shadow-card)] bg-card">
              <div className="text-5xl font-bold text-primary mb-2 font-serif">10k+</div>
              <div className="text-muted-foreground font-medium">Designs Created</div>
            </Card>
            <Card className="p-8 text-center border border-border/50 rounded-3xl shadow-[var(--shadow-card)] bg-card">
              <div className="text-5xl font-bold text-primary mb-2 font-serif">4.9★</div>
              <div className="text-muted-foreground font-medium">Average Rating</div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-4xl mx-auto p-12 md:p-16 text-center bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-[var(--shadow-glow)] rounded-3xl border-0">
          <h3 className="text-4xl md:text-5xl font-serif font-bold mb-4 tracking-tight">
            Enter Your Digital Atelier
          </h3>
          <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Begin your journey into AI-powered space transformation. Start with 4 complimentary credits.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate("/auth")}
            className="text-lg px-10 py-6 rounded-2xl shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-float)] transition-all duration-500 group"
          >
            <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-500" />
            Start Designing Now
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-500" />
          </Button>
        </Card>
      </section>

      <PremiumFooter />
    </div>
  );
};

export default PremiumIndex;
