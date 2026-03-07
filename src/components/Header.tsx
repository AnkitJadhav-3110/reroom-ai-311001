import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileNavDrawer from "@/components/MobileNavDrawer";

interface HeaderProps {
  showBack?: boolean;
  showAuthButtons?: boolean;
  sticky?: boolean;
  isScrolled?: boolean;
  className?: string;
}

const Header = ({
  showBack = false,
  showAuthButtons = true,
  sticky = false,
  isScrolled = false,
  className = "",
}: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header
      className={`${
        sticky
          ? `fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
              isScrolled
                ? "bg-background/95 backdrop-blur-lg shadow-[var(--shadow-card)] border-b border-border/50"
                : "bg-transparent"
            }`
          : "border-b border-border/50"
      } ${className}`}
    >
      <div className="container mx-auto px-4 xs:px-6 py-3 xs:py-4 sm:py-6">
        <div className="flex items-center justify-between gap-2">
          <div
            className="flex items-center gap-2 xs:gap-3 min-w-0 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-xl xs:rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 shadow-card">
              <Sparkles className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <span className="text-base xs:text-lg sm:text-xl font-serif font-bold text-foreground tracking-tight truncate block">
                ReRoom AI
              </span>
              <p className="text-[9px] xs:text-[10px] sm:text-xs text-muted-foreground -mt-0.5 hidden xs:block">
                Design Without Limits
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile hamburger menu */}
            <MobileNavDrawer />

            {/* Desktop navigation */}
            {showAuthButtons && (
              <div className="hidden md:flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/pricing")}
                  className="text-foreground hover:bg-primary/10"
                >
                  Pricing
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/auth")}
                  className="text-foreground hover:bg-primary/10"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => navigate("/auth")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl shadow-card"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
