import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Wand2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ThemeSelector from "./ThemeSelector";
import GeneratedDesignResult from "./GeneratedDesignResult";
import AddCreditsModal from "./AddCreditsModal";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

interface UploadSectionProps {
  credits: number;
  onCreditsUpdate: (credits: number) => void;
  userId: string;
}

const UploadSection = ({ credits, onCreditsUpdate, userId }: UploadSectionProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<{
    originalImageUrl: string;
    generatedImageUrl: string;
    designId: string;
    theme: string;
    customPrompt?: string;
  } | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    // Validate dimensions
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      
      if (img.width > 4096 || img.height > 4096) {
        toast.error('Image dimensions must not exceed 4096x4096 pixels');
        return;
      }
      
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      toast.error('Invalid image file');
    };

    img.src = objectUrl;
  };

  const handleGenerate = async () => {
    if (!selectedImage) {
      toast.error("Please upload a room image");
      return;
    }

    if (!selectedTheme && !customPrompt) {
      toast.error("Please select a theme or enter a custom prompt");
      return;
    }

    if (credits < 1) {
      setShowCreditsModal(true);
      return;
    }

    setGenerating(true);
    setProgress(10);
    
    try {
      // Upload original image to storage with UUID-based path
      setProgress(20);
      const fileExt = selectedImage.name.split('.').pop();
      const imageId = crypto.randomUUID();
      const fileName = `designs/${imageId}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('room-images')
        .upload(fileName, selectedImage);

      if (uploadError) throw uploadError;

      setProgress(40);

      // Get signed URL for the uploaded image (valid for 1 hour)
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('room-images')
        .createSignedUrl(fileName, 3600);

      if (signedUrlError) throw signedUrlError;

      const imageUrl = signedUrlData.signedUrl;

      // Call edge function to generate design (credits are deducted server-side)
      setProgress(50);
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'generate-room-design',
        {
          body: {
            imageUrl: imageUrl,
            theme: selectedTheme,
            customPrompt: customPrompt
          }
        }
      );

      if (functionError) {
        // Handle specific error cases
        if (functionError.message?.includes('Insufficient credits')) {
          setShowCreditsModal(true);
          toast.error("Insufficient credits. Please add credits to continue.");
          return;
        }
        throw functionError;
      }

      if (!functionData?.generatedImageUrl) {
        throw new Error('No generated image received');
      }

      setProgress(80);

      // Save design to database (note: original_image_url is now the path, not public URL)
      const { data: insertData, error: insertError } = await supabase
        .from('generated_designs')
        .insert({
          user_id: userId,
          original_image_url: fileName, // Store the path, not the signed URL
          generated_image_url: functionData.generatedImageUrl,
          theme: selectedTheme || 'custom',
          custom_prompt: customPrompt || null
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setProgress(100);
      
      // Update credits from server response
      if (functionData.creditsRemaining !== undefined) {
        onCreditsUpdate(functionData.creditsRemaining);
      } else {
        // Fallback: refresh credits from database
        const { data: profileData } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', userId)
          .single();
        if (profileData) {
          onCreditsUpdate(profileData.credits);
        }
      }
      toast.success("Design generated successfully!");
      
      // Show the generated result
      setGeneratedResult({
        originalImageUrl: fileName, // Pass the path instead of URL
        generatedImageUrl: functionData.generatedImageUrl,
        designId: insertData.id,
        theme: selectedTheme || 'custom',
        customPrompt: customPrompt || undefined,
      });
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || "Failed to generate design. Please try again.");
    } finally {
      setGenerating(false);
      setProgress(0);
    }
  };

  const handleNewDesign = () => {
    setGeneratedResult(null);
    setSelectedImage(null);
    setPreviewUrl("");
    setSelectedTheme("");
    setCustomPrompt("");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeInUp">
      <AddCreditsModal
        open={showCreditsModal}
        onClose={() => setShowCreditsModal(false)}
        onSuccess={() => {
          setShowCreditsModal(false);
          toast.success("Credits added successfully!");
        }}
        userId={userId}
      />

      <Card className="p-10 bg-warm-white/80 backdrop-blur-sm border-champagne-gold/20 shadow-elegant rounded-3xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-bold text-forest-green mb-3 tracking-tight">Your Space, Reimagined Instantly</h2>
          <p className="text-forest-green/70 font-body tracking-wide">Upload, customize, and watch AI design intelligence unfold</p>
        </div>
        
        <div className="space-y-8">
          <div>
            <Label htmlFor="room-image" className="text-base font-subheading text-forest-green mb-3 block">Select Your Room Photo</Label>
            <div className="mt-2">
              <Input
                id="room-image"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="cursor-pointer border-champagne-gold/30 rounded-2xl h-14 file:mr-4 file:py-2 file:px-6 file:rounded-xl file:border-0 file:bg-forest-green file:text-warm-white file:font-subheading hover:file:bg-forest-green/90 transition-all"
              />
            </div>
            <p className="text-sm text-forest-green/60 mt-2 font-body">Supported: JPEG, PNG, WebP • Max 10MB • Up to 4096x4096px</p>
          </div>

          {previewUrl && (
            <div className="rounded-3xl overflow-hidden border-2 border-champagne-gold/20 shadow-elegant animate-fadeInUp">
              <img src={previewUrl} alt="Room preview" className="w-full h-auto" />
            </div>
          )}

          <ThemeSelector selectedTheme={selectedTheme} onThemeSelect={setSelectedTheme} />

          <div>
            <Label htmlFor="custom-prompt" className="text-base font-subheading text-forest-green mb-3 block">Or Describe Your Vision</Label>
            <Textarea
              id="custom-prompt"
              placeholder="e.g., A serene Scandinavian bedroom with natural wood and soft textures..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="mt-2 min-h-32 border-champagne-gold/30 rounded-2xl font-body resize-none focus:border-champagne-gold focus:ring-champagne-gold"
            />
            <p className="text-sm text-forest-green/60 mt-2 font-body">Maximum 500 characters</p>
          </div>

          {generating && (
            <div className="space-y-4 p-6 bg-stone/20 rounded-2xl border border-champagne-gold/10 animate-fadeInUp">
              <div className="flex items-center gap-3 text-forest-green font-subheading">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="animate-scanLine">Analyzing space and generating design...</span>
              </div>
              <Progress value={progress} className="h-3 bg-stone/30" />
              <p className="text-sm text-forest-green/70 font-body text-center">This may take 30-60 seconds</p>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={generating}
            variant="luxury"
            className="w-full h-14 text-lg shadow-glow"
            size="lg"
          >
            <Wand2 className="w-5 h-5 mr-2" />
            {generating ? "Generating Your Design..." : "Generate Design (1 Credit)"}
          </Button>
          
          <p className="text-center text-sm text-forest-green/60 font-body">
            ⭐ 4 Free Credits Included — No Card Required
          </p>
        </div>
      </Card>

      {generatedResult && (
        <>
          <GeneratedDesignResult {...generatedResult} />
          <div className="flex justify-center animate-fadeInUp">
            <Button onClick={handleNewDesign} variant="outline" size="lg" className="border-champagne-gold/30 text-forest-green hover:bg-stone/20 rounded-3xl h-12 px-8 font-subheading">
              Create Another Design
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default UploadSection;
