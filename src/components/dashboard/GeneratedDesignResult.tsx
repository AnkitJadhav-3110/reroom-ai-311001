import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, Check, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BeforeAfterSlider from "./BeforeAfterSlider";
import ShareToSocial from "./ShareToSocial";

interface GeneratedDesignResultProps {
  originalImageUrl: string; // Now this is the storage path, not a URL
  generatedImageUrl: string;
  designId: string;
  theme: string;
  customPrompt?: string;
}

const GeneratedDesignResult = ({
  originalImageUrl,
  generatedImageUrl,
  designId,
  theme,
  customPrompt,
}: GeneratedDesignResultProps) => {
  const [originalSignedUrl, setOriginalSignedUrl] = useState<string>("");

  useEffect(() => {
    // Generate signed URL for the original image
    const getSignedUrl = async () => {
      const { data, error } = await supabase.storage
        .from('room-images')
        .createSignedUrl(originalImageUrl, 3600); // 1 hour expiry

      if (!error && data) {
        setOriginalSignedUrl(data.signedUrl);
      }
    };

    getSignedUrl();
  }, [originalImageUrl]);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `redesign-${designId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download started",
        description: "Your design is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      // Generate a unique share ID if not exists
      const shareId = `design-${designId.slice(0, 8)}`;
      
      // Update the design with public share ID
      const { error } = await supabase
        .from("generated_designs")
        .update({ public_share_id: shareId })
        .eq("id", designId);

      if (error) throw error;

      const url = `${window.location.origin}/shared/${shareId}`;
      setShareUrl(url);
      setShareDialogOpen(true);
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Failed to create share link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link copied",
        description: "Share link copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy link. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="p-6 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-[var(--shadow-elegant)]">
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-serif font-bold text-foreground mb-2">
              Your Design is Ready! 🎉
            </h3>
            <p className="text-sm text-muted-foreground">
              {customPrompt || theme}
            </p>
          </div>

          {/* Before/After Slider */}
          {originalSignedUrl && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Interactive Comparison</h4>
              <BeforeAfterSlider 
                beforeImage={originalSignedUrl} 
                afterImage={generatedImageUrl} 
              />
            </div>
          )}

          {/* Side by Side View */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Side by Side</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Original</p>
                <img
                  src={originalSignedUrl}
                  alt="Original room"
                  className="w-full h-auto rounded-lg border border-border shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Generated Design</p>
                <div className="relative">
                  <img
                    src={generatedImageUrl}
                    alt="Generated design"
                    className="w-full h-auto rounded-lg border border-border shadow-sm"
                  />
                  {/* Free watermark */}
                  <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1 rounded text-xs backdrop-blur-sm">
                    Made with ReRoom AI
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button onClick={handleDownload} className="gap-2">
              <Download className="w-4 h-4" />
              Download Image
            </Button>
            <Button onClick={handleShare} variant="outline" className="gap-2">
              <Share2 className="w-4 h-4" />
              Share Design
            </Button>
            {shareUrl && <ShareToSocial shareUrl={shareUrl} imageUrl={generatedImageUrl} />}
          </div>
        </div>
      </Card>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Your Design</DialogTitle>
            <DialogDescription>
              Share this link with others to show off your redesigned space!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 text-sm border border-input rounded-md bg-background"
              />
              <Button onClick={handleCopyLink} variant="outline" size="icon">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="flex gap-2 justify-center flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out my AI-generated room design from ReRoom AI! ${shareUrl}`)}`, '_blank')}
              >
                Share on WhatsApp
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=Check out my AI-generated room design from ReRoom AI!`, '_blank')}
              >
                Share on Twitter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')}
              >
                Share on Facebook
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GeneratedDesignResult;
