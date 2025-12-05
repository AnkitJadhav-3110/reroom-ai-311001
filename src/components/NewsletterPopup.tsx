import { useState, useEffect } from "react";
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
import { z } from "zod";

// Email validation schema with proper constraints
const emailSchema = z
  .string()
  .trim()
  .email({ message: "Please enter a valid email address" })
  .max(255, { message: "Email must be less than 255 characters" })
  .refine(
    (email) => !email.includes("+") || email.split("+").length <= 2,
    { message: "Invalid email format" }
  );

const NewsletterPopup = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);

    // Validate email using Zod schema
    const validationResult = emailSchema.safeParse(email);
    if (!validationResult.success) {
      setError(validationResult.error.errors[0].message);
      return;
    }

    const validatedEmail = validationResult.data;

    // Rate limiting check on client side (basic protection)
    const lastSubmit = localStorage.getItem("newsletter_last_submit");
    const now = Date.now();
    if (lastSubmit && now - parseInt(lastSubmit) < 60000) {
      toast.error("Please wait a moment before trying again");
      return;
    }

    setLoading(true);

    try {
      // Call server-side edge function with rate limiting
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/newsletter-signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: validatedEmail }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Too many attempts. Please try again later.");
        } else {
          throw new Error(data.error || "Failed to subscribe");
        }
        return;
      }

      if (data.duplicate) {
        toast.info("You're already subscribed!");
      } else {
        toast.success("Welcome! Check your email for design tips.");
      }

      localStorage.setItem("newsletter_subscribed", "true");
      localStorage.setItem("newsletter_last_submit", now.toString());
      setOpen(false);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to subscribe";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("newsletter_dismissed", "true");
    setOpen(false);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError(null);
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
            Join 500+ designers getting weekly AI interior design tips, trends,
            and exclusive prompts.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={handleEmailChange}
              maxLength={255}
              className={error ? "border-destructive" : ""}
              autoComplete="email"
            />
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
          </div>
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
