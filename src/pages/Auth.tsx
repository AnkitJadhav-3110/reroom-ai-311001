import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Sparkles } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10 animate-fadeInUp">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-forest-green/10 mb-6 shadow-elegant">
            <Sparkles className="w-10 h-10 text-forest-green animate-parallaxFloat" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-forest-green mb-3 tracking-tight">ReRoom AI</h1>
          <p className="text-forest-green/70 font-body tracking-wide">Design Without Limits</p>
          <p className="text-sm text-forest-green/60 mt-2 font-body">Welcome to your digital atelier</p>
        </div>

        <div className="bg-warm-white rounded-3xl shadow-elegant p-10 border border-champagne-gold/20 backdrop-blur-sm animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#1E3B32',
                    brandAccent: '#C8B88A',
                    brandButtonText: '#FAFAF7',
                    defaultButtonBackground: '#1E3B32',
                    defaultButtonBackgroundHover: '#2A4F42',
                    inputBackground: '#FAFAF7',
                    inputBorder: '#E9E6E1',
                    inputBorderFocus: '#C8B88A',
                    inputBorderHover: '#C8B88A',
                  },
                  radii: {
                    borderRadiusButton: '1.5rem',
                    buttonBorderRadius: '1.5rem',
                    inputBorderRadius: '1rem',
                  },
                  fonts: {
                    bodyFontFamily: 'Inter, sans-serif',
                    buttonFontFamily: 'Outfit, sans-serif',
                    inputFontFamily: 'Inter, sans-serif',
                    labelFontFamily: 'Outfit, sans-serif',
                  },
                },
              },
            }}
            providers={[]}
            redirectTo={window.location.origin + "/dashboard"}
          />
        </div>
        
        <p className="text-center mt-6 text-sm text-forest-green/60 font-body">
          ⭐ 4 Free Credits — No Card Required
        </p>
      </div>
    </div>
  );
};

export default Auth;
