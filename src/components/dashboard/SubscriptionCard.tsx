import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Crown } from "lucide-react";
import { useRazorpay } from "@/hooks/useRazorpay";

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  price_monthly: number;
  credits_per_month: number;
  features: string[];
}

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  isCurrentPlan?: boolean;
  isPopular?: boolean;
  onSubscribed: (credits: number) => void;
}

const SubscriptionCard = ({
  plan,
  isCurrentPlan,
  isPopular,
  onSubscribed,
}: SubscriptionCardProps) => {
  const { initiatePayment } = useRazorpay();

  const handleSubscribe = () => {
    initiatePayment({
      planId: plan.id,
      onSuccess: onSubscribed,
    });
  };

  return (
    <div className={`relative ${isPopular ? "md:-translate-y-2" : ""}`}>
      {isPopular && (
        <div className="absolute -inset-[1px] rounded-2xl bg-[image:var(--gradient-border)] opacity-90 blur-[1px]" aria-hidden />
      )}
      <Card
        className={`relative p-6 transition-all duration-300 rounded-2xl glass-strong lift ${
          isPopular
            ? "shadow-[var(--shadow-glow)] border-transparent"
            : "border-border/60 hover:border-primary/40"
        } ${isCurrentPlan ? "ring-2 ring-primary/60 ring-offset-2 ring-offset-background" : ""}`}
      >
        {isPopular && (
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[image:var(--gradient-primary)] text-primary-foreground border-0 shadow-[var(--shadow-glow)]">
            <Sparkles className="w-3 h-3 mr-1" />
            Most Popular
          </Badge>
        )}

        {isCurrentPlan && (
          <Badge className="absolute -top-3 right-4 bg-secondary text-secondary-foreground">
            <Crown className="w-3 h-3 mr-1" />
            Current Plan
          </Badge>
        )}

        <div className="text-center mb-6">
          <h3 className="text-xl font-display font-semibold text-foreground mb-2 tracking-tight">{plan.name}</h3>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-display font-bold text-foreground tracking-tight">₹{Math.round((plan.price_monthly / 100) * 83).toLocaleString("en-IN")}</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2 font-mono">
            {plan.credits_per_month} credits / month
          </p>
        </div>

        <ul className="space-y-3 mb-6">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-primary" />
              </span>
              <span className="text-foreground/90">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          className="w-full"
          variant={isPopular ? "default" : "outline"}
          disabled={isCurrentPlan}
          onClick={handleSubscribe}
        >
          {isCurrentPlan ? (
            "Current Plan"
          ) : (
            <>
              {isPopular && <Sparkles className="w-4 h-4 mr-2" />}
              Subscribe Now
            </>
          )}
        </Button>
      </Card>
    </div>
  );
};

export default SubscriptionCard;
