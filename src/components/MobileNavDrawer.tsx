import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Sparkles, LogIn, UserPlus, Home, DollarSign, Users, BookOpen, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/", icon: <Home className="w-5 h-5" /> },
  { label: "Pricing", href: "/pricing", icon: <DollarSign className="w-5 h-5" /> },
  { label: "Blog", href: "/blog", icon: <BookOpen className="w-5 h-5" /> },
  { label: "Marketplace", href: "/marketplace", icon: <Store className="w-5 h-5" /> },
  { label: "Affiliate", href: "/affiliate", icon: <Users className="w-5 h-5" /> },
];

const MobileNavDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (href: string) => {
    setIsOpen(false);
    navigate(href);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden w-10 h-10 rounded-xl hover:bg-primary/10"
          aria-label="Open navigation menu"
        >
          <Menu className="w-6 h-6 text-foreground" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] xs:w-[300px] p-0 bg-background border-r border-border">
        <SheetHeader className="p-4 xs:p-6 border-b border-border">
          <SheetTitle className="flex items-center gap-3">
            <div className="w-10 h-10 xs:w-12 xs:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 xs:w-6 xs:h-6 text-primary" />
            </div>
            <div className="text-left">
              <span className="text-lg xs:text-xl font-serif font-bold text-foreground block">Velora Studios</span>
              <span className="text-xs text-muted-foreground">Design Without Limits</span>
            </div>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col p-4 xs:p-6 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <button
                key={item.label}
                onClick={() => handleNavigation(item.href)}
                className={`flex items-center gap-3 p-3 xs:p-4 rounded-xl transition-colors text-left w-full ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground hover:bg-primary/10"
                }`}
              >
                <span className={isActive ? "text-primary" : "text-primary"}>{item.icon}</span>
                <span className="text-sm xs:text-base font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 xs:p-6 border-t border-border bg-background space-y-3">
          <Button
            variant="outline"
            className="w-full justify-center gap-2 rounded-xl border-primary/30 text-foreground hover:bg-primary/10"
            onClick={() => handleNavigation("/auth")}
          >
            <LogIn className="w-4 h-4" />
            <span className="text-sm xs:text-base">Sign In</span>
          </Button>
          <Button
            className="w-full justify-center gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => handleNavigation("/auth")}
          >
            <UserPlus className="w-4 h-4" />
            <span className="text-sm xs:text-base">Get Started</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavDrawer;
