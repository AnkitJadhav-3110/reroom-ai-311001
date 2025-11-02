import { Sparkles, Twitter, Linkedin, Instagram, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const PremiumFooter = () => {
  return (
    <footer className="bg-[var(--gradient-footer)] text-primary-foreground border-t border-accent/20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-accent/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-semibold">ReRoom AI</h3>
                <p className="text-xs text-accent/80">Technology Inspired by Taste</p>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/80 leading-relaxed font-subheading">
              Where AI precision meets luxury design aesthetics.
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-accent border-b border-accent/30 pb-2">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/pricing" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors font-subheading">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors font-subheading">
                  Get Started
                </Link>
              </li>
              <li>
                <a href="#features" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors font-subheading">
                  Features
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-accent border-b border-accent/30 pb-2">Company</h4>
            <ul className="space-y-2">
              <li>
                <a href="#about" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors font-subheading">
                  About Us
                </a>
              </li>
              <li>
                <a href="#blog" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors font-subheading">
                  Blog
                </a>
              </li>
              <li>
                <a href="#partners" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors font-subheading">
                  Partners
                </a>
              </li>
            </ul>
          </div>

          {/* Connect Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-accent border-b border-accent/30 pb-2">Connect</h4>
            <div className="flex gap-3">
              <a
                href="https://twitter.com/reroomai"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center hover:bg-accent/30 transition-all hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4 text-accent" />
              </a>
              <a
                href="https://linkedin.com/company/reroomai"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center hover:bg-accent/30 transition-all hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4 text-accent" />
              </a>
              <a
                href="https://instagram.com/reroomai"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center hover:bg-accent/30 transition-all hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4 text-accent" />
              </a>
            </div>
            <div className="pt-2">
              <a 
                href="mailto:hello@reroomai.com" 
                className="text-sm text-primary-foreground/80 hover:text-accent transition-colors flex items-center gap-2 font-subheading"
              >
                <Mail className="w-4 h-4" />
                hello@reroomai.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-accent/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/70 font-subheading">
            © 2025 ReRoom AI. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#privacy" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors font-subheading">
              Privacy Policy
            </a>
            <a href="#terms" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors font-subheading">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PremiumFooter;
