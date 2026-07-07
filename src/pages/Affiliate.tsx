import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  DollarSign,
  Link as LinkIcon,
  Copy,
  CheckCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import PremiumFooter from "@/components/PremiumFooter";
import Header from "@/components/Header";

interface AffiliateProfile {
  id: string;
  affiliate_code: string;
  commission_rate: number | null;
  total_earnings: number | null;
  pending_earnings: number | null;
  is_approved: boolean | null;
}

interface Referral {
  id: string;
  status: string | null;
  created_at: string | null;
}

const Affiliate = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [affiliateProfile, setAffiliateProfile] = useState<AffiliateProfile | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session?.user) {
        navigate("/auth");
        return;
      }
      setUserId(data.session.user.id);
      await fetchAffiliateData(data.session.user.id);
      setLoading(false);
    };
    init();
  }, [navigate]);

  const fetchAffiliateData = async (uid: string) => {
    const { data: profile } = await supabase
      .from("affiliate_profiles")
      .select("*")
      .eq("user_id", uid)
      .maybeSingle();

    if (profile) {
      setAffiliateProfile(profile);

      const { data: refs } = await supabase
        .from("referrals")
        .select("*")
        .eq("affiliate_id", profile.id)
        .order("created_at", { ascending: false });

      setReferrals(refs || []);
    }
  };

  const joinProgram = async () => {
    if (!userId) return;
    setJoining(true);

    try {
      const code = `REF${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const { error } = await supabase.from("affiliate_profiles").insert({
        user_id: userId,
        affiliate_code: code,
      });

      if (error) throw error;

      toast.success("Welcome to the affiliate program!");
      await fetchAffiliateData(userId);
    } catch (error: any) {
      toast.error(error.message || "Failed to join program");
    } finally {
      setJoining(false);
    }
  };

  const copyLink = () => {
    if (!affiliateProfile) return;
    const link = `${window.location.origin}?ref=${affiliateProfile.affiliate_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-serif font-bold text-foreground mb-4">
              Affiliate Program
            </h1>
            <p className="text-xl text-muted-foreground">
              Earn 20% commission on every referral
            </p>
          </div>

          {!affiliateProfile ? (
            <Card className="p-8 text-center max-w-lg mx-auto">
              <Users className="w-16 h-16 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Join Our Affiliate Program</h2>
              <p className="text-muted-foreground mb-6">
                Share Velora Studios with your audience and earn 20% commission on every
                subscription purchase.
              </p>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  20% recurring commission
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  30-day cookie duration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Monthly payouts
                </li>
              </ul>
              <Button onClick={joinProgram} disabled={joining} className="w-full">
                {joining ? "Joining..." : "Join Now"}
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Referral Link */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-primary" />
                  Your Referral Link
                </h2>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={`${window.location.origin}?ref=${affiliateProfile.affiliate_code}`}
                    className="font-mono text-sm"
                  />
                  <Button onClick={copyLink} variant="outline">
                    {copied ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </Card>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6 text-center">
                  <Users className="w-8 h-8 mx-auto text-primary mb-2" />
                  <p className="text-3xl font-bold">{referrals.length}</p>
                  <p className="text-sm text-muted-foreground">Total Referrals</p>
                </Card>
                <Card className="p-6 text-center">
                  <DollarSign className="w-8 h-8 mx-auto text-green-500 mb-2" />
                  <p className="text-3xl font-bold">
                    ₹{((affiliateProfile.total_earnings || 0) * 83).toFixed(0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                </Card>
                <Card className="p-6 text-center">
                  <Clock className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                  <p className="text-3xl font-bold">
                    ₹{((affiliateProfile.pending_earnings || 0) * 83).toFixed(0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </Card>
              </div>

              {/* Recent Referrals */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Referrals</h2>
                {referrals.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No referrals yet. Share your link to start earning!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {referrals.slice(0, 10).map((ref) => (
                      <div
                        key={ref.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <span className="text-sm">
                          {new Date(ref.created_at || "").toLocaleDateString()}
                        </span>
                        <Badge
                          variant={ref.status === "converted" ? "default" : "secondary"}
                        >
                          {ref.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </main>

      <PremiumFooter />
    </div>
  );
};

export default Affiliate;
