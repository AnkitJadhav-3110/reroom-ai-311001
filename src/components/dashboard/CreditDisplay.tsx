import { Coins } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CreditDisplayProps {
  credits: number;
}

const CreditDisplay = ({ credits }: CreditDisplayProps) => {
  return (
    <Card className="px-4 py-2 flex items-center gap-2 border-primary/20 bg-primary/5">
      <Coins className="w-5 h-5 text-primary" />
      <div>
        <p className="text-sm font-medium text-foreground">{credits}</p>
        <p className="text-xs text-muted-foreground">Credits</p>
      </div>
    </Card>
  );
};

export default CreditDisplay;
