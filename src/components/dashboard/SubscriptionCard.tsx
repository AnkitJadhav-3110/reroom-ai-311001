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
    <Card
      className={`p-6 relative transition-all duration-300 ${
        isPopular
          ? "border-primary shadow-[var(--shadow-glow)] scale-105 z-10"
          : "border-border/50 hover:border-primary/50"
      } ${isCurrentPlan ? "ring-2 ring-primary" : ""}`}
    >
      {isPopular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
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
        <h3 className="text-xl font-serif font-bold text-foreground mb-2">{plan.name}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold text-foreground">₹{Math.round((plan.price_monthly / 100) * 83).toLocaleString("en-IN")}</span>
          <span className="text-muted-foreground">/month</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {plan.credits_per_month} credits per month
        </p>
      </div>

      <ul className="space-y-3 mb-6">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-foreground">{feature}</span>
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
  );
};

export default SubscriptionCard;
