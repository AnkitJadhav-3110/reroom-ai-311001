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
    <Alert className="mb-6 border-primary/50 bg-primary/5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <AlertDescription className="text-foreground">
            {credits === 0 ? (
              <span className="font-semibold">You're out of credits!</span>
            ) : (
              <span>
                Only <span className="font-semibold">{credits} credits</span> remaining
              </span>
            )}
            {" "}Upgrade now to continue creating stunning designs.
          </AlertDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate("/pricing")} size="sm">
            Upgrade Now
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Alert>
  );
};

export default LowCreditsBanner;
