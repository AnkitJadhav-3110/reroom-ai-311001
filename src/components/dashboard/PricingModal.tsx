import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Sparkles } from "lucide-react";

interface PricingModalProps {
  open: boolean;
  onClose: () => void;
}

const PricingModal = ({ open, onClose }: PricingModalProps) => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Starter",
      price: 9,
      credits: 20,
      features: ["20 AI generations", "All premium themes", "High-res downloads"],
    },
    {
      name: "Pro Designer",
      price: 29,
      credits: 100,
      popular: true,
      features: ["100 AI generations", "Before/After sliders", "Client preview pages", "No watermarks"],
    },
    {
      name: "Studio Premium",
      price: 79,
      credits: 400,
      features: ["400 AI generations", "White-label branding", "Bulk credits", "Priority support"],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Upgrade Your Plan</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`p-6 ${
                plan.popular ? "border-primary shadow-[var(--shadow-elegant)]" : ""
              }`}
            >
              {plan.popular && (
                <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold mb-4 inline-block">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-lg font-serif font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>
              
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
                onClick={() => {
                  navigate("/pricing");
                  onClose();
                }}
              >
                {plan.popular && <Sparkles className="w-4 h-4 mr-2" />}
                Choose Plan
              </Button>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PricingModal;
