import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Crown, Calendar, CreditCard, TrendingUp } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { format } from "date-fns";
import PremiumFooter from "@/components/PremiumFooter";

const Subscription = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | undefined>();
  const [credits, setCredits] = useState(0);
  const { userSubscription, currentPlan, loading } = useSubscription(userId);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session?.user) {
        navigate("/auth");
        return;
      }
      setUserId(data.session.user.id);
      
      // Fetch credits
      const { data: profile } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", data.session.user.id)
        .single();
      
      setCredits(profile?.credits || 0);
    };
    checkUser();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="container mx-auto px-4 py-6 border-b border-border/50">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-8">
            Subscription Management
          </h1>

          {loading ? (
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          ) : (
            <div className="grid gap-6">
              {/* Current Plan */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Crown className="w-5 h-5 text-primary" />
                    Current Plan
                  </h2>
                  {userSubscription?.status === "active" && (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                      Active
                    </Badge>
                  )}
                </div>

                {currentPlan ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-3xl font-bold">{currentPlan.name}</p>
                      <p className="text-muted-foreground">
                        ₹{currentPlan.price_monthly * 83}/month
                      </p>
                    </div>
                    
                    {userSubscription?.current_period_end && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        Renews on {format(new Date(userSubscription.current_period_end), "PPP")}
                      </div>
                    )}

                    <Button variant="outline" onClick={() => navigate("/pricing")}>
                      Change Plan
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">You're on the free plan</p>
                    <Button onClick={() => navigate("/pricing")}>
                      Upgrade Now
                    </Button>
                  </div>
                )}
              </Card>

              {/* Credits */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Credits
                  </h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-4xl font-bold">{credits}</p>
                    <p className="text-muted-foreground">credits remaining</p>
                  </div>
                  {currentPlan && (
                    <p className="text-sm text-muted-foreground">
                      You receive {currentPlan.credits_per_month} credits per month with your plan
                    </p>
                  )}
                </div>
              </Card>

              {/* Usage Stats */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">Usage This Month</h2>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">--</p>
                    <p className="text-sm text-muted-foreground">Designs Created</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">--</p>
                    <p className="text-sm text-muted-foreground">Credits Used</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">--</p>
                    <p className="text-sm text-muted-foreground">Shares</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>

      <PremiumFooter />
    </div>
  );
};

export default Subscription;
