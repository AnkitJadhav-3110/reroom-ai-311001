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
    return <div className="text-center py-12 text-muted-foreground">Loading designs...</div>;
  }

  if (designs.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Image className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No designs yet</h3>
        <p className="text-muted-foreground">Upload a room photo to get started!</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {designs.map((design) => (
        <Card key={design.id} className="overflow-hidden">
          <div className="grid grid-cols-2 gap-2 p-4">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Original</p>
              <img 
                src={imageUrls[design.id] || ''} 
                alt="Original room" 
                className="w-full h-auto rounded-md border border-border"
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Generated</p>
              <img 
                src={design.generated_image_url} 
                alt="Generated design" 
                className="w-full h-auto rounded-md border border-border"
              />
            </div>
          </div>
          <div className="px-4 pb-4 space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">
                {new Date(design.created_at).toLocaleDateString()}
              </p>
              <p className="text-sm font-medium text-foreground mt-1">
                {design.theme || design.custom_prompt || "Custom Design"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => handleDownload(design.generated_image_url, design.id)}
              >
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
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
