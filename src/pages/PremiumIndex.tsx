import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkles, Wand2, Zap, Shield, TrendingUp, Heart, Users, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import PremiumFooter from "@/components/PremiumFooter";

const PremiumIndex = () => {
  const navigate = useNavigate();
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    // Show newsletter popup after 5 seconds
    const timer = setTimeout(() => setShowNewsletter(true), 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Newsletter logic would go here
    setShowNewsletter(false);
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-[var(--gradient-hero)]">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-semibold text-foreground">ReRoom AI</h1>
              <p className="text-xs text-muted-foreground">Design Without Limits</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate("/auth")}>
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-sm text-primary mb-6">
            <Users className="w-4 h-4" />
            <span>Used by 500+ designers worldwide</span>
          </div>

          <h2 className="text-5xl md:text-7xl font-serif font-bold text-foreground leading-tight">
            Transform Your Space<br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              in Seconds
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-light">
            Powered by AI. Upload a photo of your room and recreate it in any interior design style instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")} 
              className="text-lg px-10 py-6 shadow-[var(--shadow-elegant)]"
            >
              <Wand2 className="w-5 h-5 mr-2" />
              Start Designing Free
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate("/pricing")} 
              className="text-lg px-10 py-6"
            >
              View Pricing
            </Button>
          </div>

          <p className="text-sm text-muted-foreground pt-4">
            ✨ 4 free credits • No credit card required
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 bg-card/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Why Designers Choose ReRoom AI
            </h3>
            <p className="text-lg text-muted-foreground">
              Professional tools built for modern interior design
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 border-border/50 shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] transition-all">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-primary" />
              </div>
              <h4 className="text-2xl font-serif font-semibold text-foreground mb-3">Instant Results</h4>
              <p className="text-muted-foreground leading-relaxed">
                AI-powered transformations in seconds. No rendering delays, no complex software.
              </p>
            </Card>

            <Card className="p-8 border-border/50 shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] transition-all">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Heart className="w-7 h-7 text-primary" />
              </div>
              <h4 className="text-2xl font-serif font-semibold text-foreground mb-3">Premium Styles</h4>
              <p className="text-muted-foreground leading-relaxed">
                8+ curated themes from Modern to Luxury. Access exclusive style marketplace.
              </p>
            </Card>

            <Card className="p-8 border-border/50 shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] transition-all">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-primary" />
              </div>
              <h4 className="text-2xl font-serif font-semibold text-foreground mb-3">Client Ready</h4>
              <p className="text-muted-foreground leading-relaxed">
                Generate shareable preview pages. Professional before/after sliders included.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-12">
            Trusted by Design Professionals
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">500+</div>
              <div className="text-muted-foreground">Active Designers</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">10k+</div>
              <div className="text-muted-foreground">Designs Created</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">4.9★</div>
              <div className="text-muted-foreground">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-4xl mx-auto p-12 text-center bg-primary text-primary-foreground shadow-[var(--shadow-glow)]">
          <h3 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Ready to Transform Your Design Process?
          </h3>
          <p className="text-lg mb-8 opacity-90">
            Start with 4 free credits. No credit card required.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate("/auth")}
            className="text-lg px-10 py-6"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Get Started Free
          </Button>
        </Card>
      </section>

      {/* Newsletter Popup */}
      <Dialog open={showNewsletter} onOpenChange={setShowNewsletter}>
        <DialogContent className="sm:max-w-md">
          <button
            onClick={() => setShowNewsletter(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="space-y-4 pt-4">
            <div className="text-center">
              <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
              <h4 className="text-2xl font-serif font-bold mb-2">Join Our Newsletter</h4>
              <p className="text-muted-foreground">
                Get AI interior design tips and exclusive style packs
              </p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full">
                Subscribe
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <PremiumFooter />
    </div>
  );
};

export default PremiumIndex;
