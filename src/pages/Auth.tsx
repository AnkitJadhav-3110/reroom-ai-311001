import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Sparkles } from "lucide-react";
import Header from "@/components/Header";

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Handle referral attribution after signup
        handleReferralAttribution(session.user.id);
        navigate("/dashboard");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // Handle referral on any sign in
        await handleReferralAttribution(session.user.id);
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleReferralAttribution = async (userId: string) => {
    const referralCode = localStorage.getItem("referral_code");
    if (!referralCode) return;

    try {
      // Use secure RPC function to look up affiliate by code
      // This bypasses RLS restrictions safely via SECURITY DEFINER
      const { data: affiliateId, error: rpcError } = await supabase.rpc(
        "get_affiliate_by_code",
        { code: referralCode }
      );

      if (rpcError) {
        console.error("Error looking up affiliate:", rpcError);
        localStorage.removeItem("referral_code");
        return;
      }

      if (affiliateId) {
        // Check if referral already exists
        const { data: existingReferral } = await supabase
          .from("referrals")
          .select("id")
          .eq("referred_user_id", userId)
          .maybeSingle();

        if (!existingReferral) {
          // Create referral record
          await supabase.from("referrals").insert({
            affiliate_id: affiliateId,
            referred_user_id: userId,
            status: "pending",
          });
        }
      }

      // Clear the referral code from localStorage
      localStorage.removeItem("referral_code");
    } catch (error) {
      console.error("Error processing referral:", error);
      localStorage.removeItem("referral_code");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 mb-6 shadow-elegant">
            <Sparkles className="w-10 h-10 text-primary animate-parallax-float" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-foreground mb-3 tracking-tight">
            ReRoom AI
          </h1>
          <p className="text-muted-foreground font-body tracking-wide">
            Design Without Limits
          </p>
          <p className="text-sm text-muted-foreground/80 mt-2 font-body">
            Welcome to your digital atelier
          </p>
        </div>

        <div
          className="bg-card rounded-3xl shadow-elegant p-10 border-2 border-primary/10 backdrop-blur-sm animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "#1E3B32",
                    brandAccent: "#C8B88A",
                    brandButtonText: "#FAFAF7",
                    defaultButtonBackground: "#1E3B32",
                    defaultButtonBackgroundHover: "#2A4F42",
                    inputBackground: "#FAFAF7",
                    inputBorder: "#E9E6E1",
                    inputBorderFocus: "#1E3B32",
                    inputBorderHover: "#C8B88A",
                    inputText: "#1E3B32",
                    inputLabelText: "#1E3B32",
                    inputPlaceholder: "#1E3B32",
                  },
                  radii: {
                    borderRadiusButton: "1rem",
                    buttonBorderRadius: "1rem",
                    inputBorderRadius: "0.75rem",
                  },
                  fonts: {
                    bodyFontFamily: "Inter, sans-serif",
                    buttonFontFamily: "Outfit, sans-serif",
                    inputFontFamily: "Inter, sans-serif",
                    labelFontFamily: "Outfit, sans-serif",
                  },
                },
              },
            }}
            providers={[]}
            redirectTo={window.location.origin + "/dashboard"}
          />
        </div>

        <p className="text-center mt-6 text-sm text-primary/70 font-medium">
          ⭐ 4 Free Credits — No Card Required
        </p>
      </div>
    </div>
  );
};

export default Auth;
