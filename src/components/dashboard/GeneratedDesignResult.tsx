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
      <Card className="p-10 mt-8 animate-fadeInUp bg-warm-white/80 backdrop-blur-sm border-champagne-gold/20 shadow-elegant rounded-3xl">
        <div className="space-y-8">
          <div className="text-center">
            <h3 className="text-3xl font-serif font-bold text-forest-green mb-3 tracking-tight">
              Your Design is Ready! 🎉
            </h3>
            <p className="text-forest-green/70 font-body tracking-wide">
              {customPrompt || `${theme.charAt(0).toUpperCase() + theme.slice(1)} Style`}
            </p>
          </div>

          {/* Before/After Slider */}
          {originalSignedUrl && (
            <div className="space-y-4">
              <h4 className="text-lg font-subheading font-semibold text-forest-green">Interactive Comparison</h4>
              <div className="rounded-3xl overflow-hidden border-2 border-champagne-gold/30 shadow-elegant">
                <BeforeAfterSlider 
                  beforeImage={originalSignedUrl} 
                  afterImage={generatedImageUrl} 
                />
              </div>
            </div>
          )}

          {/* Side by Side View */}
          <div className="space-y-4">
            <h4 className="text-lg font-subheading font-semibold text-forest-green">Side by Side Transformation</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="text-sm text-forest-green/60 font-body font-medium">Original Space</p>
                <div className="rounded-2xl overflow-hidden border-2 border-champagne-gold/20 shadow-sm">
                  <img
                    src={originalSignedUrl}
                    alt="Original room design"
                    className="w-full h-auto"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-forest-green/60 font-body font-medium">AI-Generated Design</p>
                <div className="relative rounded-2xl overflow-hidden border-2 border-champagne-gold shadow-glow">
                  <img
                    src={generatedImageUrl}
                    alt="AI-generated interior design transformation"
                    className="w-full h-auto"
                  />
                  {/* Luxury watermark */}
                  <div className="absolute bottom-4 right-4 bg-forest-green/90 text-warm-white px-4 py-2 rounded-xl text-xs backdrop-blur-md font-subheading shadow-elegant">
                    Made with ReRoom AI
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button onClick={handleDownload} variant="luxury" className="gap-2 shadow-glow rounded-2xl h-12 px-8">
              <Download className="w-5 h-5" />
              Download Image
            </Button>
            <Button onClick={handleShare} variant="outline" className="gap-2 border-champagne-gold/30 text-forest-green hover:bg-stone/20 rounded-2xl h-12 px-8">
              <Share2 className="w-5 h-5" />
              Share Design
            </Button>
            {shareUrl && <ShareToSocial shareUrl={shareUrl} imageUrl={generatedImageUrl} />}
          </div>
        </div>
      </Card>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="bg-warm-white border-champagne-gold/30 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif text-forest-green">Share Your Design</DialogTitle>
            <DialogDescription className="font-body text-forest-green/70">
              Share this link with others to show off your AI-redesigned space!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-4 py-3 text-sm border border-champagne-gold/30 rounded-2xl bg-stone/10 font-body text-forest-green"
              />
              <Button onClick={handleCopyLink} variant="outline" size="icon" className="rounded-xl border-champagne-gold/30 hover:bg-stone/20">
                {copied ? <Check className="w-4 h-4 text-forest-green" /> : <Copy className="w-4 h-4 text-forest-green" />}
              </Button>
            </div>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="rounded-2xl border-champagne-gold/30 hover:bg-stone/20 text-forest-green font-subheading"
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out my AI-generated room design from ReRoom AI! ${shareUrl}`)}`, '_blank')}
              >
                Share on WhatsApp
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-2xl border-champagne-gold/30 hover:bg-stone/20 text-forest-green font-subheading"
                onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=Check out my AI-generated room design from ReRoom AI!`, '_blank')}
              >
                Share on Twitter
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-2xl border-champagne-gold/30 hover:bg-stone/20 text-forest-green font-subheading"
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
