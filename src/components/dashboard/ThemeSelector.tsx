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
      <Label className="text-base font-semibold">Choose Design Theme</Label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
        {themes.map((theme) => (
          <Button
            key={theme.id}
            variant={selectedTheme === theme.id ? "default" : "outline"}
            onClick={() => onThemeSelect(theme.id)}
            className="h-auto flex flex-col items-center gap-2 py-5 transition-all hover:scale-105"
          >
            <span className="text-3xl">{theme.emoji}</span>
            <span className="text-sm font-semibold">{theme.name}</span>
            <span className="text-xs text-muted-foreground opacity-75">{theme.description}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;
