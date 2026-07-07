import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SharedDesign {
  id: string;
  original_image_url: string;
  generated_image_url: string;
  theme: string;
  custom_prompt: string | null;
  public_share_id: string;
  created_at: string;
}

const SharedDesign = () => {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [design, setDesign] = useState<SharedDesign | null>(null);
  const [loading, setLoading] = useState(true);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>("");

  useEffect(() => {
    const fetchSharedDesign = async () => {
      if (!shareId) return;

      try {
        // Use the secure view that excludes user_id
        const { data, error } = await supabase
          .from("public_shared_designs")
          .select("*")
          .eq("public_share_id", shareId)
          .single();

        if (error) throw error;

        if (!data) {
          toast({
            title: "Design not found",
            description: "This shared design does not exist or has been removed.",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        setDesign(data);

        // Generate signed URLs for images
        const { data: originalSignedUrl } = await supabase.storage
          .from("room-images")
          .createSignedUrl(data.original_image_url, 3600);

        const { data: generatedSignedUrl } = await supabase.storage
          .from("room-images")
          .createSignedUrl(data.generated_image_url, 3600);

        if (originalSignedUrl) setOriginalImageUrl(originalSignedUrl.signedUrl);
        if (generatedSignedUrl) setGeneratedImageUrl(generatedSignedUrl.signedUrl);
      } catch (error) {
        console.error("Error fetching shared design:", error);
        toast({
          title: "Error loading design",
          description: "Failed to load the shared design. Please try again.",
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchSharedDesign();
  }, [shareId, navigate, toast]);

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast({
        title: "Download started",
        description: "Your image is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the image. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading shared design...</p>
        </div>
      </div>
    );
  }

  if (!design) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Shared Design</h1>
          <Button onClick={() => navigate("/")} variant="outline">
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">
                Theme: {design.theme}
              </h2>
              {design.custom_prompt && (
                <p className="text-muted-foreground mb-4">
                  Custom Prompt: <span className="break-words">{design.custom_prompt}</span>
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Original</h3>
                {originalImageUrl && (
                  <img
                    src={originalImageUrl}
                    alt="Original room"
                    className="w-full rounded-lg shadow-lg"
                  />
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Generated Design</h3>
                {generatedImageUrl && (
                  <img
                    src={generatedImageUrl}
                    alt="Generated room design"
                    className="w-full rounded-lg shadow-lg"
                  />
                )}
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <Button
                onClick={() =>
                  handleDownload(generatedImageUrl, `velora-design-${design.id}.png`)
                }
                disabled={!generatedImageUrl}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Design
              </Button>
            </div>
          </div>
        </Card>

        <div className="text-center mt-8">
          <p className="text-muted-foreground mb-4">
            Create your own AI-powered room designs
          </p>
          <Button onClick={() => navigate("/auth")}>
            Get Started with Velora Studios
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SharedDesign;
