import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkles, Upload, Camera, Zap, Shield, TrendingUp, ArrowRight, Palette, LayoutGrid, Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import PremiumFooter from "@/components/PremiumFooter";

const PremiumIndex = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    // Handle sticky header on scroll
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-background/95 backdrop-blur-lg shadow-[var(--shadow-card)] border-b border-border/50' 
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-serif font-bold text-foreground tracking-tight">ReRoom AI</h1>
                <p className="text-[10px] text-muted-foreground -mt-0.5">Design Without Limits</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/auth")}
                className="text-foreground hover:text-primary"
              >
                Sign In
              </Button>
              <Button 
                variant="luxury"
                onClick={() => navigate("/auth")}
                className="group"
              >
                <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                Launch Studio
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-[var(--gradient-hero)] pointer-events-none" />
        <div className="absolute inset-0 bg-[var(--gradient-spotlight)] pointer-events-none animate-parallax-float" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 text-sm shadow-[var(--shadow-micro)]">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-foreground font-medium">Trusted by 500+ design professionals worldwide</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-foreground leading-[1.1] tracking-tight">
              Design Without Limits.
            </h1>

            <p className="text-xl md:text-2xl font-subheading text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Reimagine your space through AI artistry and human precision.
            </p>

            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Upload your space. Select a mood. Watch design intelligence unfold.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button 
                variant="luxury"
                size="lg"
                onClick={() => fileInputRef.current?.click()}
                className="group px-10 py-6 text-base"
              >
                <Upload className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Upload Your Room
              </Button>
              <Button 
                variant="outline"
                size="lg"
                onClick={() => navigate("/auth")}
                className="px-10 py-6 text-base"
              >
                Try Demo Room
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Experience Module */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <Card 
            className={`p-12 border-2 transition-all duration-500 rounded-[2rem] shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-float)] bg-card relative overflow-hidden ${
              isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-center space-y-8 relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 shadow-[var(--shadow-card)]">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>

              <div className="space-y-3">
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
                  Your Space, Reimagined Instantly
                </h2>
                <p className="text-lg font-subheading text-muted-foreground max-w-2xl mx-auto">
                  Transform any room into your vision with AI-powered precision
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto pt-4">
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
                  className="h-auto py-6 px-6 hover:scale-105 transition-all group"
                >
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="font-semibold text-base">Upload from Device</div>
                      <div className="text-xs text-muted-foreground mt-1">Browse library</div>
                    </div>
                  </div>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => cameraInputRef.current?.click()}
                  className="h-auto py-6 px-6 hover:scale-105 transition-all group"
                >
                  <div className="flex flex-col items-center gap-3">
                    <Camera className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="font-semibold text-base">Click from Camera</div>
                      <div className="text-xs text-muted-foreground mt-1">Capture now</div>
                    </div>
                  </div>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/auth")}
                  className="h-auto py-6 px-6 hover:scale-105 transition-all group"
                >
                  <div className="flex flex-col items-center gap-3">
                    <LayoutGrid className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="font-semibold text-base">Try Demo Room</div>
                      <div className="text-xs text-muted-foreground mt-1">See examples</div>
                    </div>
                  </div>
                </Button>
              </div>

              <p className="text-sm text-muted-foreground pt-2">
                or drag and drop your image anywhere in this area
              </p>

              <div className="flex items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>4 free credits</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-accent" />
                  <span>No card required</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Features Section - Horizontal Scroll */}
      <section className="py-20 bg-card/30 backdrop-blur-sm border-y border-border/30 overflow-hidden">
        <div className="container mx-auto px-4 mb-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h3 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
              The Intelligence Behind Beauty
            </h3>
            <p className="text-lg font-subheading text-muted-foreground">
              Where cutting-edge AI meets timeless design principles
            </p>
          </div>
        </div>

        <div className="flex gap-6 px-4 overflow-x-auto snap-x snap-mandatory pb-8 scrollbar-hide">
          <div className="flex-none w-[90vw] md:w-[500px] snap-center">
            <Card className="h-full p-10 border border-border/50 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all rounded-[2rem] bg-card group">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-2xl font-serif font-semibold text-foreground mb-4">AI Design Engine</h4>
              <p className="text-muted-foreground leading-relaxed font-subheading">
                Trained on global design archives; learns your taste instantly. Our AI understands spatial relationships, color theory, and design harmony at an expert level.
              </p>
            </Card>
          </div>

          <div className="flex-none w-[90vw] md:w-[500px] snap-center">
            <Card className="h-full p-10 border border-border/50 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all rounded-[2rem] bg-card group">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Palette className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-2xl font-serif font-semibold text-foreground mb-4">Adaptive Styles</h4>
              <p className="text-muted-foreground leading-relaxed font-subheading">
                From Japandi to Luxury Elegance — crafted by real designers. Every style captures authentic aesthetic principles while adapting to your unique space.
              </p>
            </Card>
          </div>

          <div className="flex-none w-[90vw] md:w-[500px] snap-center">
            <Card className="h-full p-10 border border-border/50 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all rounded-[2rem] bg-card group">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Share2 className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-2xl font-serif font-semibold text-foreground mb-4">Client-Grade Outputs</h4>
              <p className="text-muted-foreground leading-relaxed font-subheading">
                Generate high-resolution before/after decks instantly. Professional presentations that wow clients and close projects faster than ever before.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-12 text-center">
            Trusted by Design Professionals Worldwide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 text-center border border-border/50 rounded-[2rem] shadow-[var(--shadow-card)] bg-card hover:scale-105 transition-transform">
              <div className="text-5xl font-bold text-primary mb-2 font-serif">12,000+</div>
              <div className="text-muted-foreground font-medium font-subheading">Rooms Transformed</div>
            </Card>
            <Card className="p-8 text-center border border-border/50 rounded-[2rem] shadow-[var(--shadow-card)] bg-card hover:scale-105 transition-transform">
              <div className="text-5xl font-bold text-primary mb-2 font-serif">500+</div>
              <div className="text-muted-foreground font-medium font-subheading">Active Designers</div>
            </Card>
            <Card className="p-8 text-center border border-border/50 rounded-[2rem] shadow-[var(--shadow-card)] bg-card hover:scale-105 transition-transform">
              <div className="text-5xl font-bold text-primary mb-2 font-serif">4.9★</div>
              <div className="text-muted-foreground font-medium font-subheading">Average Rating</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Signature CTA Block */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-4xl mx-auto p-12 md:p-16 text-center bg-[var(--gradient-cta)] text-primary-foreground shadow-[var(--shadow-glow)] rounded-[2rem] border-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-[var(--gradient-spotlight)] opacity-50 pointer-events-none" />
          <div className="relative z-10 space-y-6">
            <h3 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">
              Welcome to the Future of Interior Design
            </h3>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto font-subheading">
              Begin your journey with AI-powered transformation and 4 complimentary credits.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate("/auth")}
              className="text-lg px-10 py-6 group bg-background/95 hover:bg-background text-primary hover:scale-105 animate-gold-glow"
            >
              <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Start Designing
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </Card>
      </section>

      <PremiumFooter />
    </div>
  );
};

export default PremiumIndex;
