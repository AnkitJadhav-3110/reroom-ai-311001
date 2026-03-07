import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkles, Wand2, Zap, Shield, ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

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
      <Header />

      {/* Hero Section */}
      <main className="container mx-auto px-4 xs:px-6 py-10 xs:py-16 md:py-20">
        <div className="max-w-5xl mx-auto text-center space-y-6 xs:space-y-8 md:space-y-10">
          <div className="inline-flex items-center justify-center w-16 h-16 xs:w-20 xs:h-20 md:w-24 md:h-24 rounded-2xl xs:rounded-3xl bg-primary/10 mb-4 xs:mb-6 md:mb-8 shadow-elegant animate-parallax-float">
            <Sparkles className="w-8 h-8 xs:w-10 xs:h-10 md:w-12 md:h-12 text-primary" />
          </div>

          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-7xl font-bold text-foreground leading-tight">
            Transform Your Space with{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI-Powered Design
            </span>
          </h1>

          <p className="text-base xs:text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2">
            Upload a photo of your room and let our AI reimagine it in any style you desire. 
            From modern minimalism to luxury elegance.
          </p>

          <div className="flex flex-col gap-3 xs:gap-4 justify-center pt-4 xs:pt-6 md:pt-8 px-2">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")} 
              className="text-base xs:text-lg px-6 xs:px-10 py-5 xs:py-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl xs:rounded-2xl shadow-elegant hover:shadow-glow transition-all duration-300 group w-full sm:w-auto sm:mx-auto"
            >
              <Wand2 className="w-4 h-4 xs:w-5 xs:h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Get Started Free
              <ArrowRight className="w-3 h-3 xs:w-4 xs:h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate("/auth")} 
              className="text-base xs:text-lg px-6 xs:px-10 py-5 xs:py-6 border-2 border-primary/30 text-foreground hover:bg-primary/10 hover:border-primary/50 rounded-xl xs:rounded-2xl transition-all w-full sm:w-auto sm:mx-auto"
            >
              Sign In
            </Button>
          </div>

          <p className="text-sm xs:text-base text-primary/70 font-medium">
            ⭐ 4 Free Credits — No Card Required
          </p>

          {/* Features Grid */}
          <div className="pt-12 xs:pt-16 md:pt-20">
            <h2 className="text-xl xs:text-2xl font-serif font-bold text-foreground mb-6 xs:mb-8 md:mb-10">Why Choose ReRoom AI?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 xs:gap-6 md:gap-8">
              <div className="p-5 xs:p-6 md:p-8 rounded-2xl xs:rounded-3xl bg-card border-2 border-primary/10 shadow-card hover:shadow-elegant transition-all duration-300 group">
                <div className="w-12 h-12 xs:w-14 xs:h-14 md:w-16 md:h-16 rounded-xl xs:rounded-2xl bg-primary/10 flex items-center justify-center mb-4 xs:mb-5 md:mb-6 mx-auto group-hover:bg-primary/20 transition-colors">
                  <Zap className="w-6 h-6 xs:w-7 xs:h-7 md:w-8 md:h-8 text-primary" />
                </div>
                <h3 className="text-lg xs:text-xl font-semibold text-foreground mb-2 xs:mb-3">Instant Results</h3>
                <p className="text-sm xs:text-base text-muted-foreground leading-relaxed">Get AI-generated designs in seconds. Transform any room with just one click.</p>
              </div>

              <div className="p-5 xs:p-6 md:p-8 rounded-2xl xs:rounded-3xl bg-card border-2 border-primary/10 shadow-card hover:shadow-elegant transition-all duration-300 group">
                <div className="w-12 h-12 xs:w-14 xs:h-14 md:w-16 md:h-16 rounded-xl xs:rounded-2xl bg-primary/10 flex items-center justify-center mb-4 xs:mb-5 md:mb-6 mx-auto group-hover:bg-primary/20 transition-colors">
                  <Sparkles className="w-6 h-6 xs:w-7 xs:h-7 md:w-8 md:h-8 text-primary" />
                </div>
                <h3 className="text-lg xs:text-xl font-semibold text-foreground mb-2 xs:mb-3">Multiple Styles</h3>
                <p className="text-sm xs:text-base text-muted-foreground leading-relaxed">Choose from 8+ preset themes or create custom designs tailored to your vision.</p>
              </div>

              <div className="p-5 xs:p-6 md:p-8 rounded-2xl xs:rounded-3xl bg-card border-2 border-primary/10 shadow-card hover:shadow-elegant transition-all duration-300 group">
                <div className="w-12 h-12 xs:w-14 xs:h-14 md:w-16 md:h-16 rounded-xl xs:rounded-2xl bg-primary/10 flex items-center justify-center mb-4 xs:mb-5 md:mb-6 mx-auto group-hover:bg-primary/20 transition-colors">
                  <Shield className="w-6 h-6 xs:w-7 xs:h-7 md:w-8 md:h-8 text-primary" />
                </div>
                <h3 className="text-lg xs:text-xl font-semibold text-foreground mb-2 xs:mb-3">4 Free Credits</h3>
                <p className="text-sm xs:text-base text-muted-foreground leading-relaxed">Start designing immediately upon signup with free credits. No credit card required.</p>
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
