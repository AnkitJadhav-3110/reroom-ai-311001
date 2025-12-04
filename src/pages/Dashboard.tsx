import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Sparkles, Upload, History, Store, Settings, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import UploadSection from "@/components/dashboard/UploadSection";
import DesignHistory from "@/components/dashboard/DesignHistory";
import CreditDisplay from "@/components/dashboard/CreditDisplay";
import FeedbackForm from "@/components/dashboard/FeedbackForm";
import LowCreditsBanner from "@/components/dashboard/LowCreditsBanner";
import PremiumFooter from "@/components/PremiumFooter";
import AIAssistantChat from "@/components/dashboard/AIAssistantChat";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);
  const [userId, setUserId] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);

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
    await checkAdminRole(currentUserId);
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

  const checkAdminRole = async (uid: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid)
      .eq("role", "admin")
      .maybeSingle();
    
    setIsAdmin(!!data);
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
    <div className="min-h-screen bg-background">
      <header className="border-b-2 border-primary/10 bg-background/95 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-card">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground tracking-tight">ReRoom AI</h1>
              <p className="text-xs text-muted-foreground font-body tracking-wide hidden sm:block">Design Without Limits</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/marketplace")}
              className="hidden md:flex text-foreground hover:bg-primary/10 rounded-xl"
            >
              <Store className="w-4 h-4 mr-2" />
              Marketplace
            </Button>
            {isAdmin && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/analytics")}
                className="hidden md:flex text-foreground hover:bg-primary/10 rounded-xl"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            )}
            <FeedbackForm userId={userId} />
            <CreditDisplay credits={credits} />
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/subscription")}
              className="hidden md:flex text-foreground hover:bg-primary/10 rounded-xl"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button 
              onClick={handleSignOut} 
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-card"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <LowCreditsBanner credits={credits} />
        
        <Tabs defaultValue="upload" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-secondary/50 p-2 rounded-2xl border-2 border-primary/10">
            <TabsTrigger 
              value="upload" 
              className="flex items-center gap-2 rounded-xl font-subheading data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-card transition-all duration-300"
            >
              <Upload className="w-4 h-4" />
              Create Design
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="flex items-center gap-2 rounded-xl font-subheading data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-card transition-all duration-300"
            >
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
      <AIAssistantChat />
    </div>
  );
};

export default Dashboard;
