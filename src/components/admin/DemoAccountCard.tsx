import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RefreshCw, Coins, CheckCircle2, AlertCircle } from "lucide-react";

type Status = {
  exists: boolean;
  email: string;
  user_id: string | null;
  credits: number | null;
  subscription_tier?: string | null;
  subscription_status?: string | null;
  target_credits?: number;
  message?: string;
};

export default function DemoAccountCard() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(false);
  const [reseeding, setReseeding] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("demo-account", {
      method: "GET",
    });
    setLoading(false);
    if (error) {
      toast.error(error.message || "Failed to load demo status");
      return;
    }
    setStatus(data as Status);
  };

  const reseed = async () => {
    setReseeding(true);
    const { data, error } = await supabase.functions.invoke("demo-account", {
      method: "POST",
    });
    setReseeding(false);
    if (error) {
      toast.error(error.message || "Reseed failed");
      return;
    }
    setStatus(data as Status);
    toast.success(`Demo credits reset to ${(data as Status).credits ?? 0}`);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">Demo account</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={load}
          disabled={loading}
          aria-label="Refresh demo status"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {!status ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !status.exists ? (
          <div className="flex items-start gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Demo account not created yet</p>
              <p className="text-muted-foreground text-xs mt-1">
                Sign up once with <code className="font-mono">{status.email}</code>, then reseed.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="font-mono">{status.email}</span>
              {status.subscription_tier && (
                <Badge variant="secondary" className="uppercase text-[10px]">
                  {status.subscription_tier}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-2xl font-serif">
              <Coins className="w-5 h-5 text-primary" />
              {status.credits?.toLocaleString() ?? "—"}
              <span className="text-xs font-body text-muted-foreground">
                / target {status.target_credits?.toLocaleString() ?? "—"}
              </span>
            </div>
          </div>
        )}

        <Button
          onClick={reseed}
          disabled={reseeding || !status?.exists}
          className="w-full sm:w-auto"
        >
          {reseeding ? "Reseeding…" : "Reseed demo credits"}
        </Button>
      </CardContent>
    </Card>
  );
}
