import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Sparkles, Upload, History } from "lucide-react";
import { toast } from "sonner";
import UploadSection from "@/components/dashboard/UploadSection";
import DesignHistory from "@/components/dashboard/DesignHistory";
import CreditDisplay from "@/components/dashboard/CreditDisplay";
import FeedbackForm from "@/components/dashboard/FeedbackForm";
import LowCreditsBanner from "@/components/dashboard/LowCreditsBanner";
import PremiumFooter from "@/components/PremiumFooter";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const sessionData = await supabase.auth.getSession();
    
    if (!sessionData.data.session) {
      navigate("/auth");
      return;
    }

    const currentUserId = sessionData.data.session.user.id;
    setUserId(currentUserId);
    await fetchCredits(currentUserId);
    setLoading(false);
  };

  const fetchCredits = async (uid: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", uid)
      .maybeSingle();

    if (error) {
      console.error("Error fetching credits:", error);
      return;
    }

    setCredits(data?.credits || 0);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    toast.success("Signed out successfully");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--gradient-hero)]">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-semibold text-foreground">ReRoom AI</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Design Without Limits</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <FeedbackForm userId={userId} />
            <CreditDisplay credits={credits} />
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <LowCreditsBanner credits={credits} />
        
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Create Design
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              My Designs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <UploadSection credits={credits} onCreditsUpdate={setCredits} userId={userId} />
          </TabsContent>

          <TabsContent value="history">
            <DesignHistory userId={userId} />
          </TabsContent>
        </Tabs>
      </main>

      <PremiumFooter />
    </div>
  );
};

export default Dashboard;
