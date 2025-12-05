import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const themeSchema = z.object({
  name: z.string().trim().min(1, "Theme name is required").max(100, "Theme name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  prompt: z.string().trim()
    .min(10, "Prompt must be at least 10 characters")
    .max(2000, "Prompt must be less than 2000 characters")
    .regex(/^[a-zA-Z0-9\s.,!?'"-]+$/, "Prompt contains invalid characters"),
  price: z.number().min(0).max(9999).optional(),
});

interface UploadThemeModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const UploadThemeModal = ({ open, onClose, onSuccess }: UploadThemeModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate with Zod schema
    const validationResult = themeSchema.safeParse({
      name,
      description: description || undefined,
      prompt,
      price: isFree ? undefined : parseInt(price) || 0,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    setLoading(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        toast.error("Please sign in to upload themes");
        return;
      }

      const { error } = await supabase.from("marketplace_themes").insert({
        name: validationResult.data.name,
        description: validationResult.data.description || null,
        prompt: validationResult.data.prompt,
        is_free: isFree,
        price: isFree ? 0 : validationResult.data.price || 0,
        creator_id: session.session.user.id,
        is_approved: false,
      });

      if (error) throw error;

      toast.success("Theme submitted for review!");
      setName("");
      setDescription("");
      setPrompt("");
      setIsFree(true);
      setPrice("");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to upload theme");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Your Theme</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Theme Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Modern Minimalist"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your theme style..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="prompt">AI Prompt *</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter the AI prompt that creates this style..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              This prompt will be used to generate designs with your style
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                id="free"
                checked={isFree}
                onCheckedChange={setIsFree}
              />
              <Label htmlFor="free">Free theme</Label>
            </div>

            {!isFree && (
              <div className="flex items-center gap-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-24"
                  min="1"
                />
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Your theme will be reviewed before appearing in the marketplace.
          </p>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Theme
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadThemeModal;
