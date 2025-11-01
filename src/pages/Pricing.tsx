import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Sparkles, ArrowLeft } from "lucide-react";
import PremiumFooter from "@/components/PremiumFooter";

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Starter",
      price: 9,
      credits: 20,
      features: [
        "20 AI design generations",
        "All 8+ premium themes",
        "High-resolution downloads",
        "Email support",
      ],
    },
    {
      name: "Pro Designer",
      price: 29,
      credits: 100,
      popular: true,
      features: [
        "100 AI design generations",
        "All premium themes + marketplace",
        "Before/After sliders",
        "Client preview pages",
        "Priority support",
        "Remove watermarks",
      ],
    },
    {
      name: "Studio Premium",
      price: 79,
      credits: 400,
      features: [
        "400 AI design generations",
        "Everything in Pro +",
        "White-label branding",
        "Bulk credit packs",
        "Dedicated account manager",
        "API access (coming soon)",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--gradient-hero)]">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 border-b border-border/50">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button variant="outline" onClick={() => navigate("/auth")}>
            Sign In
          </Button>
        </div>
      </header>

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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`p-8 relative ${
                  plan.popular
                    ? "border-primary shadow-[var(--shadow-glow)] scale-105"
                    : "border-border/50"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-serif font-bold text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-foreground">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {plan.credits} credits per month
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => navigate("/auth")}
                >
                  {plan.popular && <Sparkles className="w-4 h-4 mr-2" />}
                  Get Started
                </Button>
              </Card>
            ))}
          </div>

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
