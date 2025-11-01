import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Coins } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AddCreditsModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

const creditPlans = [
  { credits: 20, price: 9, popular: false, name: "Starter" },
  { credits: 100, price: 29, popular: true, name: "Pro Designer" },
  { credits: 400, price: 79, popular: false, name: "Studio Premium" },
];

const AddCreditsModal = ({ open, onClose, onSuccess, userId }: AddCreditsModalProps) => {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);

  const handlePurchase = async () => {
    if (selectedPlan === null) {
      toast.error("Please select a credit plan");
      return;
    }

    const plan = creditPlans[selectedPlan];
    setProcessing(true);

    try {
      // TODO: Integrate with payment gateway
      // For now, we'll show a message that payment integration is needed
      toast.info(
        `Payment gateway integration pending. Selected: ${plan.credits} credits for ₹${plan.price}`,
        { duration: 5000 }
      );

      // This is where you would call the payment gateway edge function
      // const { data, error } = await supabase.functions.invoke('process-payment', {
      //   body: { planIndex: selectedPlan, userId }
      // });

      onClose();
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Add Credits</DialogTitle>
          <DialogDescription className="text-center">
            Choose a credit plan to continue generating stunning designs
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {creditPlans.map((plan, index) => (
            <Card
              key={index}
              className={`p-6 cursor-pointer transition-all ${
                selectedPlan === index
                  ? "border-primary shadow-lg scale-105"
                  : "border-border hover:border-primary/50"
              } ${plan.popular ? "ring-2 ring-primary" : ""}`}
              onClick={() => setSelectedPlan(index)}
            >
              {plan.popular && (
                <div className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full inline-block mb-2">
                  Most Popular
                </div>
              )}
              
              <div className="flex items-center justify-center mb-4">
                <Coins className="w-8 h-8 text-primary" />
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm font-semibold text-primary">{plan.name}</p>
                <h3 className="text-3xl font-bold text-foreground">{plan.credits}</h3>
                <p className="text-sm text-muted-foreground">Credits</p>
              </div>

              <div className="mt-4 text-center">
                <p className="text-2xl font-bold text-foreground">${plan.price}</p>
                <p className="text-xs text-muted-foreground mt-1">per month</p>
              </div>

              <ul className="mt-4 space-y-2">
                <li className="flex items-center text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary mr-2" />
                  {plan.credits} Design Generations
                </li>
                <li className="flex items-center text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary mr-2" />
                  HD Quality Outputs
                </li>
                <li className="flex items-center text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary mr-2" />
                  Download & Share
                </li>
              </ul>
            </Card>
          ))}
        </div>

        <div className="flex gap-4 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handlePurchase}
            disabled={selectedPlan === null || processing}
            className="flex-1"
          >
            {processing ? "Processing..." : "Continue to Payment"}
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-4">
          Secure payment via Stripe. Cancel anytime.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default AddCreditsModal;
