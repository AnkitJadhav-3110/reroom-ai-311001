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
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Sticky Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-background/95 backdrop-blur-lg shadow-[var(--shadow-card)] border-b border-border/50' 
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-serif font-bold text-foreground tracking-tight truncate">Velora Studios</h1>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground -mt-0.5 hidden xs:block">Design Without Limits</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/auth")}
                className="text-foreground hover:text-primary text-sm px-2 sm:px-4"
                size="sm"
              >
                Sign In
              </Button>
              <Button 
                variant="luxury"
                onClick={() => navigate("/auth")}
                className="group text-xs sm:text-sm px-2.5 sm:px-4"
                size="sm"
              >
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 group-hover:rotate-12 transition-transform" />
                <span className="hidden xs:inline">Launch Studio</span>
                <span className="xs:hidden">Start</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-3 sm:px-4 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-[var(--gradient-hero)] pointer-events-none" />
        <div className="absolute inset-0 bg-[var(--gradient-spotlight)] pointer-events-none animate-parallax-float" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-4 sm:space-y-6 md:space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 text-xs sm:text-sm shadow-[var(--shadow-micro)]">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
              <span className="text-foreground font-medium">Trusted by 500+ design professionals</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-foreground leading-[1.1] tracking-tight px-2">
              Design Without Limits.
            </h1>

            <p className="text-base sm:text-xl md:text-2xl font-subheading text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2">
              Reimagine your space through AI artistry and human precision.
            </p>

            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
              Upload your space. Select a mood. Watch design intelligence unfold.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4 px-4">
              <Button 
                variant="luxury"
                size="lg"
                onClick={() => fileInputRef.current?.click()}
                className="group w-full sm:w-auto px-6 sm:px-10 py-5 sm:py-6 text-sm sm:text-base"
              >
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:scale-110 transition-transform" />
                Upload Your Room
              </Button>
              <Button 
                variant="outline"
                size="lg"
                onClick={() => navigate("/auth")}
                className="w-full sm:w-auto px-6 sm:px-10 py-5 sm:py-6 text-sm sm:text-base"
              >
                Try Demo Room
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Experience Module */}
      <section className="container mx-auto px-3 sm:px-4 pb-12 sm:pb-16 md:pb-20">
        <div className="max-w-4xl mx-auto">
          <Card 
            className={`p-6 sm:p-8 md:p-12 border-2 transition-all duration-500 rounded-2xl sm:rounded-[2rem] shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-float)] bg-card relative overflow-hidden ${
              isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-center space-y-5 sm:space-y-6 md:space-y-8 relative z-10">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl sm:rounded-3xl bg-primary/10 shadow-[var(--shadow-card)]">
                <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-primary" />
              </div>

              <div className="space-y-2 sm:space-y-3">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground px-2">
                  Your Space, Reimagined Instantly
                </h2>
                <p className="text-sm sm:text-base md:text-lg font-subheading text-muted-foreground max-w-2xl mx-auto px-2">
                  Transform any room into your vision with AI-powered precision
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto pt-2 sm:pt-4">
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
                  className="h-auto py-4 sm:py-5 md:py-6 px-4 sm:px-6 hover:scale-105 transition-all group"
                >
                  <div className="flex flex-row sm:flex-col items-center gap-3 w-full">
                    <Upload className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary group-hover:scale-110 transition-transform flex-shrink-0" />
                    <div className="text-left sm:text-center">
                      <div className="font-semibold text-sm sm:text-base">Upload from Device</div>
                      <div className="text-xs text-muted-foreground mt-0.5 sm:mt-1">Browse library</div>
                    </div>
                  </div>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => cameraInputRef.current?.click()}
                  className="h-auto py-4 sm:py-5 md:py-6 px-4 sm:px-6 hover:scale-105 transition-all group"
                >
                  <div className="flex flex-row sm:flex-col items-center gap-3 w-full">
                    <Camera className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary group-hover:scale-110 transition-transform flex-shrink-0" />
                    <div className="text-left sm:text-center">
                      <div className="font-semibold text-sm sm:text-base">Click from Camera</div>
                      <div className="text-xs text-muted-foreground mt-0.5 sm:mt-1">Capture now</div>
                    </div>
                  </div>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/auth")}
                  className="h-auto py-4 sm:py-5 md:py-6 px-4 sm:px-6 hover:scale-105 transition-all group"
                >
                  <div className="flex flex-row sm:flex-col items-center gap-3 w-full">
                    <LayoutGrid className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary group-hover:scale-110 transition-transform flex-shrink-0" />
                    <div className="text-left sm:text-center">
                      <div className="font-semibold text-sm sm:text-base">Try Demo Room</div>
                      <div className="text-xs text-muted-foreground mt-0.5 sm:mt-1">See examples</div>
                    </div>
                  </div>
                </Button>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground pt-1 sm:pt-2 hidden sm:block">
                or drag and drop your image anywhere in this area
              </p>

              <div className="flex flex-col xs:flex-row items-center justify-center gap-2 xs:gap-4 sm:gap-6 pt-2 sm:pt-4 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
                  <span>4 free credits</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-muted-foreground/30 hidden xs:block" />
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
                  <span>No card required</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Features Section - Horizontal Scroll */}
      <section className="py-12 sm:py-16 md:py-20 bg-card/30 backdrop-blur-sm border-y border-border/30 overflow-hidden">
        <div className="container mx-auto px-3 sm:px-4 mb-8 sm:mb-10 md:mb-12">
          <div className="text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto">
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground px-2">
              The Intelligence Behind Beauty
            </h3>
            <p className="text-sm sm:text-base md:text-lg font-subheading text-muted-foreground px-4">
              Where cutting-edge AI meets timeless design principles
            </p>
          </div>
        </div>

        <div className="flex gap-4 sm:gap-6 px-3 sm:px-4 overflow-x-auto snap-x snap-mandatory pb-6 sm:pb-8 scrollbar-hide">
          <div className="flex-none w-[85vw] sm:w-[75vw] md:w-[500px] snap-center first:ml-0 last:mr-0">
            <Card className="h-full p-6 sm:p-8 md:p-10 border border-border/50 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all rounded-2xl sm:rounded-[2rem] bg-card group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center mb-4 sm:mb-5 md:mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
              </div>
              <h4 className="text-lg sm:text-xl md:text-2xl font-serif font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">AI Design Engine</h4>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-subheading">
                Trained on global design archives; learns your taste instantly. Our AI understands spatial relationships, color theory, and design harmony.
              </p>
            </Card>
          </div>

          <div className="flex-none w-[85vw] sm:w-[75vw] md:w-[500px] snap-center">
            <Card className="h-full p-6 sm:p-8 md:p-10 border border-border/50 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all rounded-2xl sm:rounded-[2rem] bg-card group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center mb-4 sm:mb-5 md:mb-6 group-hover:scale-110 transition-transform">
                <Palette className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
              </div>
              <h4 className="text-lg sm:text-xl md:text-2xl font-serif font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">Adaptive Styles</h4>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-subheading">
                From Japandi to Luxury Elegance — crafted by real designers. Every style captures authentic aesthetic principles while adapting to your space.
              </p>
            </Card>
          </div>

          <div className="flex-none w-[85vw] sm:w-[75vw] md:w-[500px] snap-center">
            <Card className="h-full p-6 sm:p-8 md:p-10 border border-border/50 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all rounded-2xl sm:rounded-[2rem] bg-card group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center mb-4 sm:mb-5 md:mb-6 group-hover:scale-110 transition-transform">
                <Share2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
              </div>
              <h4 className="text-lg sm:text-xl md:text-2xl font-serif font-semibold text-foreground mb-2 sm:mb-3 md:mb-4">Client-Grade Outputs</h4>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-subheading">
                Generate high-resolution before/after decks instantly. Professional presentations that wow clients and close projects faster.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="container mx-auto px-3 sm:px-4 py-12 sm:py-16 md:py-20">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-foreground mb-6 sm:mb-8 md:mb-12 text-center px-2">
            Trusted by Design Professionals Worldwide
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <Card className="p-5 sm:p-6 md:p-8 text-center border border-border/50 rounded-2xl sm:rounded-[2rem] shadow-[var(--shadow-card)] bg-card hover:scale-105 transition-transform">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-1 sm:mb-2 font-serif">12,000+</div>
              <div className="text-sm sm:text-base text-muted-foreground font-medium font-subheading">Rooms Transformed</div>
            </Card>
            <Card className="p-5 sm:p-6 md:p-8 text-center border border-border/50 rounded-2xl sm:rounded-[2rem] shadow-[var(--shadow-card)] bg-card hover:scale-105 transition-transform">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-1 sm:mb-2 font-serif">500+</div>
              <div className="text-sm sm:text-base text-muted-foreground font-medium font-subheading">Active Designers</div>
            </Card>
            <Card className="p-5 sm:p-6 md:p-8 text-center border border-border/50 rounded-2xl sm:rounded-[2rem] shadow-[var(--shadow-card)] bg-card hover:scale-105 transition-transform">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-1 sm:mb-2 font-serif">4.9★</div>
              <div className="text-sm sm:text-base text-muted-foreground font-medium font-subheading">Average Rating</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Signature CTA Block */}
      <section className="container mx-auto px-3 sm:px-4 py-12 sm:py-16 md:py-20">
        <Card className="max-w-4xl mx-auto p-6 sm:p-10 md:p-12 lg:p-16 text-center bg-[var(--gradient-cta)] text-primary-foreground shadow-[var(--shadow-glow)] rounded-2xl sm:rounded-[2rem] border-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-[var(--gradient-spotlight)] opacity-50 pointer-events-none" />
          <div className="relative z-10 space-y-4 sm:space-y-5 md:space-y-6">
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold tracking-tight px-2">
              Welcome to the Future of Interior Design
            </h3>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl opacity-90 max-w-2xl mx-auto font-subheading px-2">
              Begin your journey with AI-powered transformation and 4 complimentary credits.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate("/auth")}
              className="text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 group bg-background/95 hover:bg-background text-primary hover:scale-105 animate-gold-glow"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Start Designing
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </Card>
      </section>

      <PremiumFooter />
    </div>
  );
};

export default PremiumIndex;
