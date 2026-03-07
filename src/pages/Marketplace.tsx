import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Plus, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";
import PremiumFooter from "@/components/PremiumFooter";
import UploadThemeModal from "@/components/marketplace/UploadThemeModal";
import Header from "@/components/Header";

interface MarketplaceTheme {
  id: string;
  name: string;
  description: string | null;
  prompt: string;
  preview_image_url: string | null;
  price: number | null;
  is_free: boolean | null;
  download_count: number | null;
  creator_id: string | null;
}

const Marketplace = () => {
  const navigate = useNavigate();
  const [themes, setThemes] = useState<MarketplaceTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [purchasedThemes, setPurchasedThemes] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUserId(data.session.user.id);
        fetchPurchasedThemes(data.session.user.id);
      }
      fetchThemes();
    };
    init();
  }, []);

  const fetchThemes = async () => {
    const { data, error } = await supabase
      .from("marketplace_themes")
      .select("*")
      .eq("is_approved", true)
      .order("download_count", { ascending: false });

    if (error) {
      console.error("Error fetching themes:", error);
    } else {
      setThemes(data || []);
    }
    setLoading(false);
  };

  const fetchPurchasedThemes = async (uid: string) => {
    const { data } = await supabase
      .from("user_purchased_themes")
      .select("theme_id")
      .eq("user_id", uid);

    if (data) {
      setPurchasedThemes(data.map((p) => p.theme_id));
    }
  };

  const handlePurchase = async (theme: MarketplaceTheme) => {
    if (!userId) {
      navigate("/auth");
      return;
    }

    if (theme.is_free || purchasedThemes.includes(theme.id)) {
      toast.success("Theme added to your collection!");
      return;
    }

    // For paid themes, would integrate with Razorpay
    toast.info("Payment integration coming soon!");
  };

  const filteredThemes = themes.filter(
    (theme) =>
      theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      theme.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-serif font-bold text-foreground mb-4">
              Theme Marketplace
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Discover and use premium AI design prompts created by the community
            </p>

            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search themes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center text-muted-foreground">Loading themes...</div>
          ) : filteredThemes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No themes found</p>
              {userId && (
                <Button onClick={() => setShowUploadModal(true)}>
                  Be the first to upload a theme!
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredThemes.map((theme) => (
                <Card key={theme.id} className="overflow-hidden group">
                  <div className="aspect-video bg-muted relative">
                    {theme.preview_image_url ? (
                      <img
                        src={theme.preview_image_url}
                        alt={theme.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-muted-foreground/50" />
                      </div>
                    )}
                    {theme.is_free && (
                      <Badge className="absolute top-2 left-2 bg-green-500">Free</Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{theme.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {theme.description || "A beautiful design theme"}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Download className="w-4 h-4" />
                        {theme.download_count || 0}
                      </div>
                      <Button
                        size="sm"
                        variant={purchasedThemes.includes(theme.id) ? "outline" : "default"}
                        onClick={() => handlePurchase(theme)}
                      >
                        {purchasedThemes.includes(theme.id)
                          ? "Owned"
                          : theme.is_free
                          ? "Get Free"
                          : `₹${(theme.price || 0) * 83}`}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <PremiumFooter />
      
      <UploadThemeModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={() => {
          setShowUploadModal(false);
          fetchThemes();
        }}
      />
    </div>
  );
};

export default Marketplace;
