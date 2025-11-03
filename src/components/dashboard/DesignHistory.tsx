import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, Download, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DesignHistoryProps {
  userId: string;
}

const DesignHistory = ({ userId }: DesignHistoryProps) => {
  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchDesigns();
    }
  }, [userId]);

  const fetchDesigns = async () => {
    const { data, error } = await supabase
      .from("generated_designs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching designs:", error);
    } else {
      setDesigns(data || []);
      // Generate signed URLs for all images
      await generateSignedUrls(data || []);
    }
    
    setLoading(false);
  };

  const generateSignedUrls = async (designs: any[]) => {
    const urls: Record<string, string> = {};
    
    for (const design of designs) {
      // Generate signed URL for original image
      const { data: signedData, error } = await supabase.storage
        .from('room-images')
        .createSignedUrl(design.original_image_url, 3600); // 1 hour expiry

      if (!error && signedData) {
        urls[design.id] = signedData.signedUrl;
      }
    }
    
    setImageUrls(urls);
  };

  const handleDownload = async (imageUrl: string, designId: string) => {
    try {
      const response = await fetch(imageUrl);
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
        description: "Failed to download the image.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (designId: string) => {
    try {
      const shareId = `design-${designId.slice(0, 8)}`;
      
      const { error } = await supabase
        .from("generated_designs")
        .update({ public_share_id: shareId })
        .eq("id", designId);

      if (error) throw error;

      const url = `${window.location.origin}/shared/${shareId}`;
      await navigator.clipboard.writeText(url);
      
      toast({
        title: "Share link copied",
        description: "Share link copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Failed to create share link.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-forest-green/60 font-body animate-fadeInUp">Loading your designs...</div>;
  }

  if (designs.length === 0) {
    return (
      <Card className="p-16 text-center bg-warm-white/80 backdrop-blur-sm border-champagne-gold/20 shadow-elegant rounded-3xl animate-fadeInUp">
        <Image className="w-20 h-20 mx-auto text-champagne-gold/50 mb-6" />
        <h3 className="text-2xl font-serif font-semibold text-forest-green mb-3">No designs yet</h3>
        <p className="text-forest-green/70 font-body">Upload a room photo to begin your design journey!</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {designs.map((design, index) => (
        <Card 
          key={design.id} 
          className="overflow-hidden bg-warm-white/80 backdrop-blur-sm border-champagne-gold/20 shadow-elegant rounded-3xl hover:shadow-glow transition-all duration-300 hover:scale-[1.02] animate-fadeInUp"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="grid grid-cols-2 gap-3 p-5">
            <div className="space-y-2">
              <p className="text-xs text-forest-green/60 font-body font-medium">Original</p>
              <div className="rounded-2xl overflow-hidden border-2 border-champagne-gold/20">
                <img 
                  src={imageUrls[design.id] || ''} 
                  alt="Original room" 
                  className="w-full h-auto"
                />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-forest-green/60 font-body font-medium">Generated</p>
              <div className="rounded-2xl overflow-hidden border-2 border-champagne-gold">
                <img 
                  src={design.generated_image_url} 
                  alt="Generated design" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
          <div className="px-5 pb-5 space-y-4">
            <div>
              <p className="text-xs text-forest-green/60 font-body">
                {new Date(design.created_at).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
              <p className="text-sm font-subheading font-semibold text-forest-green mt-2">
                {design.theme ? `${design.theme.charAt(0).toUpperCase() + design.theme.slice(1)} Style` : design.custom_prompt || "Custom Design"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-champagne-gold/30 text-forest-green hover:bg-stone/20 rounded-2xl font-subheading"
                onClick={() => handleDownload(design.generated_image_url, design.id)}
              >
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-champagne-gold/30 text-forest-green hover:bg-stone/20 rounded-2xl font-subheading"
                onClick={() => handleShare(design.id)}
              >
                <Share2 className="w-3 h-3 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default DesignHistory;
