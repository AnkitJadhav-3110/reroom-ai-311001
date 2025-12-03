import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Sparkles, X } from "lucide-react";

const NewsletterPopup = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Show popup after 30 seconds if not dismissed before
    const dismissed = localStorage.getItem("newsletter_dismissed");
    const subscribed = localStorage.getItem("newsletter_subscribed");

    if (!dismissed && !subscribed) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("newsletter_subscriptions").insert({
        email,
      });

      if (error) {
        if (error.code === "23505") {
          toast.info("You're already subscribed!");
        } else {
          throw error;
        }
      } else {
        toast.success("Welcome! Check your email for design tips.");
      }

      localStorage.setItem("newsletter_subscribed", "true");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to subscribe");
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("newsletter_dismissed", "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>

        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-serif">
            Get Design Inspiration
          </DialogTitle>
          <DialogDescription>
            Join 500+ designers getting weekly AI interior design tips, trends, and
            exclusive prompts.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Subscribing..." : "Subscribe Free"}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            No spam, unsubscribe anytime.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewsletterPopup;
