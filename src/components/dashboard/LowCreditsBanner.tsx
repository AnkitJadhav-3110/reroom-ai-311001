import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface LowCreditsBannerProps {
  credits: number;
}

const LowCreditsBanner = ({ credits }: LowCreditsBannerProps) => {
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  if (dismissed || credits > 5) return null;

  return (
    <Alert className="mb-8 border-champagne-gold/40 bg-champagne-gold/10 rounded-2xl shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-champagne-gold animate-parallaxFloat" />
          <AlertDescription className="text-forest-green font-body">
            {credits === 0 ? (
              <span className="font-subheading font-semibold">You're out of credits!</span>
            ) : (
              <span>
                Only <span className="font-subheading font-semibold">{credits} credits</span> remaining
              </span>
            )}
            {" "}Upgrade now to continue creating stunning designs.
          </AlertDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate("/pricing")} size="sm" variant="luxury" className="rounded-2xl">
            Upgrade Now
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="h-8 w-8 p-0 hover:bg-stone/20 rounded-xl text-forest-green"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Alert>
  );
};

export default LowCreditsBanner;
