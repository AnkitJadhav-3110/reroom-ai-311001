import { Coins } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CreditDisplayProps {
  credits: number;
}

const CreditDisplay = ({ credits }: CreditDisplayProps) => {
  return (
    <Card className="px-5 py-2.5 flex items-center gap-3 border-champagne-gold/30 bg-champagne-gold/10 shadow-sm rounded-2xl">
      <Coins className="w-5 h-5 text-champagne-gold" />
      <div>
        <p className="text-base font-subheading font-semibold text-forest-green">{credits}</p>
        <p className="text-xs text-forest-green/60 font-body">Credits</p>
      </div>
    </Card>
  );
};

export default CreditDisplay;
