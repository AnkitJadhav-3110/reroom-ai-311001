import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const themes = [
  { id: "modern", name: "Modern", emoji: "🏢", description: "Clean lines & minimalism" },
  { id: "minimalist", name: "Minimalist", emoji: "⚪", description: "Less is more" },
  { id: "scandinavian", name: "Scandinavian", emoji: "🌲", description: "Nordic simplicity" },
  { id: "industrial", name: "Industrial", emoji: "🏭", description: "Urban & raw" },
  { id: "luxury", name: "Luxury", emoji: "💎", description: "Elegant & refined" },
  { id: "bohemian", name: "Bohemian", emoji: "🌺", description: "Eclectic & artistic" },
  { id: "traditional", name: "Traditional", emoji: "🏛️", description: "Classic & timeless" },
  { id: "contemporary", name: "Contemporary", emoji: "✨", description: "Modern elegance" },
];

interface ThemeSelectorProps {
  selectedTheme: string;
  onThemeSelect: (theme: string) => void;
}

const ThemeSelector = ({ selectedTheme, onThemeSelect }: ThemeSelectorProps) => {
  return (
    <div>
      <Label className="text-base font-subheading text-forest-green mb-3 block">Choose Your Design Mood</Label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
        {themes.map((theme) => (
          <Button
            key={theme.id}
            variant={selectedTheme === theme.id ? "luxury" : "outline"}
            onClick={() => onThemeSelect(theme.id)}
            className={`h-auto flex flex-col items-center gap-2 py-6 rounded-2xl transition-all hover:scale-105 border-champagne-gold/30 ${
              selectedTheme === theme.id 
                ? 'shadow-glow border-champagne-gold' 
                : 'hover:border-champagne-gold/60 hover:bg-stone/10'
            }`}
          >
            <span className="text-4xl">{theme.emoji}</span>
            <span className="text-sm font-subheading">{theme.name}</span>
            <span className="text-xs opacity-75 font-body">{theme.description}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;
