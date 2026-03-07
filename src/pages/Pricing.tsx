import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PremiumFooter from "@/components/PremiumFooter";
import SubscriptionCard from "@/components/dashboard/SubscriptionCard";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";
import Header from "@/components/Header";

const Pricing = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | undefined>();
  const { plans, currentPlan, loading } = useSubscription(userId);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUserId(data.session.user.id);
      }
    };
    checkUser();
  }, []);

  const handleSubscribed = (credits: number) => {
    toast.success(`Subscription activated! You now have ${credits} credits.`);
    navigate("/dashboard");
  };

  const popularSlugs = ["pro-designer"];

  return (
    <div className="min-h-screen bg-[var(--gradient-hero)]">
      <Header />

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-muted-foreground">
              Choose the perfect plan for your design needs
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-pulse text-muted-foreground">Loading plans...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              {plans.map((plan) => (
                <SubscriptionCard
                  key={plan.id}
                  plan={plan}
                  isCurrentPlan={currentPlan?.id === plan.id}
                  isPopular={popularSlugs.includes(plan.slug)}
                  onSubscribed={handleSubscribed}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-12 space-y-4">
            <p className="text-muted-foreground">
              All plans include a 7-day money-back guarantee
            </p>
            <p className="text-sm text-muted-foreground">
              Need more? Contact us for enterprise pricing and custom solutions
            </p>
          </div>
        </div>
      </section>

      <PremiumFooter />
    </div>
  );
};

export default Pricing;
