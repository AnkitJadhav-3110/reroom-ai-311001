import { Link } from "react-router-dom";
import { Sparkles, Twitter, Instagram, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer
      className="mt-24 text-primary-foreground"
      style={{ background: "var(--gradient-footer)" }}
      aria-label="Site footer"
    >
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-accent/30">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-accent/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="font-serif text-lg">ReRoom AI</div>
                <div className="text-[10px] tracking-[0.2em] uppercase text-accent/80">
                  Design Without Limits
                </div>
              </div>
            </div>
            <p className="font-serif italic text-primary-foreground/70 leading-relaxed max-w-xs">
              "Technology Inspired by Taste."
            </p>
          </div>

          {/* Navigation */}
          <div className="md:justify-self-center">
            <h3 className="font-subheading text-sm tracking-[0.2em] uppercase text-accent mb-5">
              Explore
            </h3>
            <ul className="space-y-3 font-subheading">
              <li><Link to="/pricing" className="hover:text-accent transition-colors">Pricing</Link></li>
              <li><Link to="/marketplace" className="hover:text-accent transition-colors">Features</Link></li>
              <li><Link to="/blog" className="hover:text-accent transition-colors">Blog</Link></li>
              <li><Link to="/affiliate" className="hover:text-accent transition-colors">Partners</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div className="md:justify-self-end">
            <h3 className="font-subheading text-sm tracking-[0.2em] uppercase text-accent mb-5">
              Connect
            </h3>
            <div className="flex items-center gap-3 mb-5">
              <a href="https://twitter.com/reroomai" aria-label="Twitter" className="w-10 h-10 rounded-full border border-accent/30 flex items-center justify-center hover:bg-accent hover:text-primary transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://instagram.com/reroomai" aria-label="Instagram" className="w-10 h-10 rounded-full border border-accent/30 flex items-center justify-center hover:bg-accent hover:text-primary transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com/company/reroomai" aria-label="LinkedIn" className="w-10 h-10 rounded-full border border-accent/30 flex items-center justify-center hover:bg-accent hover:text-primary transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
            <a href="mailto:hello@reroomai.com" className="inline-flex items-center gap-2 text-sm text-primary-foreground/80 hover:text-accent transition-colors">
              <Mail className="w-4 h-4" /> hello@reroomai.com
            </a>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row justify-between gap-4 text-xs text-primary-foreground/60 font-subheading">
          <p>© {new Date().getFullYear()} ReRoom AI. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-accent transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
