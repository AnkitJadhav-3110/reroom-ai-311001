import { useNavigate, useLocation } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileNavDrawer from "@/components/MobileNavDrawer";
import DarkModeToggle from "@/components/DarkModeToggle";

interface HeaderProps {
  showBack?: boolean;
  showAuthButtons?: boolean;
  sticky?: boolean;
  isScrolled?: boolean;
  className?: string;
}

const navLinks = [
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Marketplace", href: "/marketplace" },
];

const Header = ({
  showAuthButtons = true,
  sticky = false,
  className = "",
}: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header
      className={`${
        sticky ? "fixed top-3 sm:top-4 left-0 right-0 z-50" : "sticky top-3 sm:top-4 z-50"
      } px-3 sm:px-4 ${className}`}
    >
      <div className="container mx-auto">
        <div className="glass-nav rounded-2xl shadow-[var(--shadow-card)] px-3 sm:px-5 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 sm:gap-3 min-w-0 group"
              aria-label="Velora Studios home"
            >
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[image:var(--gradient-primary)] shadow-[var(--shadow-glow)] group-hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.5),0_12px_40px_-8px_hsl(var(--primary)/0.6)] transition-shadow">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              </div>
              <div className="min-w-0 text-left">
                <span className="text-base sm:text-lg font-display font-semibold text-foreground tracking-tight truncate block">
                  Velora Studios
                </span>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground -mt-0.5 hidden xs:block font-mono uppercase tracking-[0.15em]">
                  AI · Design
                </p>
              </div>
            </button>

            <div className="flex items-center gap-1 sm:gap-2">
              {showAuthButtons && (
                <nav className="hidden md:flex items-center gap-1 mr-2">
                  {navLinks.map((link) => {
                    const active = location.pathname === link.href;
                    return (
                      <button
                        key={link.href}
                        onClick={() => navigate(link.href)}
                        className={`relative px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${
                          active
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {active && (
                          <span className="absolute inset-0 rounded-full bg-primary/10 border border-primary/20" />
                        )}
                        <span className="relative">{link.label}</span>
                      </button>
                    );
                  })}
                </nav>
              )}

              <DarkModeToggle />
              <MobileNavDrawer />

              {showAuthButtons && (
                <div className="hidden md:flex items-center gap-2 ml-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/auth")}
                    className="text-foreground"
                  >
                    Sign In
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate("/auth")}
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
