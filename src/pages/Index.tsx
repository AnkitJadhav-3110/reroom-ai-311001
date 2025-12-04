import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkles, Wand2, Zap, Shield, ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Capture referral code from URL
    const refCode = searchParams.get('ref');
    if (refCode) {
      localStorage.setItem('referral_code', refCode);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-card">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <span className="text-xl font-serif font-bold text-foreground">ReRoom AI</span>
              <p className="text-xs text-muted-foreground">Design Without Limits</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate("/auth")} className="text-foreground hover:bg-primary/10">
              Sign In
            </Button>
            <Button onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl shadow-card">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="max-w-5xl mx-auto text-center space-y-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-primary/10 mb-8 shadow-elegant animate-parallax-float">
            <Sparkles className="w-12 h-12 text-primary" />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
            Transform Your Space with{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI-Powered Design
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Upload a photo of your room and let our AI reimagine it in any style you desire. 
            From modern minimalism to luxury elegance.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")} 
              className="text-lg px-10 py-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl shadow-elegant hover:shadow-glow transition-all duration-300 group"
            >
              <Wand2 className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate("/auth")} 
              className="text-lg px-10 py-6 border-2 border-primary/30 text-foreground hover:bg-primary/10 hover:border-primary/50 rounded-2xl transition-all"
            >
              Sign In
            </Button>
          </div>

          <p className="text-primary/70 font-medium">
            ⭐ 4 Free Credits — No Card Required
          </p>

          {/* Features Grid */}
          <div className="pt-20">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-10">Why Choose ReRoom AI?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-3xl bg-card border-2 border-primary/10 shadow-card hover:shadow-elegant transition-all duration-300 group">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 mx-auto group-hover:bg-primary/20 transition-colors">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Instant Results</h3>
                <p className="text-muted-foreground leading-relaxed">Get AI-generated designs in seconds. Transform any room with just one click.</p>
              </div>

              <div className="p-8 rounded-3xl bg-card border-2 border-primary/10 shadow-card hover:shadow-elegant transition-all duration-300 group">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 mx-auto group-hover:bg-primary/20 transition-colors">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Multiple Styles</h3>
                <p className="text-muted-foreground leading-relaxed">Choose from 8+ preset themes or create custom designs tailored to your vision.</p>
              </div>

              <div className="p-8 rounded-3xl bg-card border-2 border-primary/10 shadow-card hover:shadow-elegant transition-all duration-300 group">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 mx-auto group-hover:bg-primary/20 transition-colors">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">4 Free Credits</h3>
                <p className="text-muted-foreground leading-relaxed">Start designing immediately upon signup with free credits. No credit card required.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
