import { Coins } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CreditDisplayProps {
  credits: number;
}

const CreditDisplay = ({ credits }: CreditDisplayProps) => {
  return (
    <Card className="px-5 py-2.5 flex items-center gap-3 border-2 border-accent/30 bg-accent/10 shadow-card rounded-2xl">
      <Coins className="w-5 h-5 text-accent" />
      <div>
        <p className="text-base font-subheading font-semibold text-foreground">{credits}</p>
        <p className="text-xs text-muted-foreground font-body">Credits</p>
      </div>
    </Card>
  );
};

export default CreditDisplay;
