import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import DemoAccountCard from "@/components/admin/DemoAccountCard";

type AuditRow = {
  id: string;
  user_id: string;
  mode: "theme" | "prompt";
  theme: string | null;
  credit_cost: number;
  status: string;
  correlation_id: string | null;
  error_code: string | null;
  created_at: string;
};

const STATUSES = [
  "all",
  "success",
  "failed",
  "rate_limited",
  "insufficient_credits",
  "validation_failed",
  "blocked",
] as const;

const MODES = ["all", "theme", "prompt"] as const;

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  success: "default",
  failed: "destructive",
  rate_limited: "secondary",
  insufficient_credits: "secondary",
  validation_failed: "outline",
  blocked: "destructive",
};

export default function AdminAuditLog() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<AuditRow[]>([]);

  // filters
  const [userIdFilter, setUserIdFilter] = useState("");
  const [modeFilter, setModeFilter] = useState<(typeof MODES)[number]>("all");
  const [statusFilter, setStatusFilter] = useState<(typeof STATUSES)[number]>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
      setIsAdmin(!!data);
      setAuthChecked(true);
    })();
  }, [navigate, toast]);

  const runQuery = async () => {
    setLoading(true);
    let q = supabase
      .from("generation_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (userIdFilter.trim()) q = q.eq("user_id", userIdFilter.trim());
    if (modeFilter !== "all") q = q.eq("mode", modeFilter);
    if (statusFilter !== "all") q = q.eq("status", statusFilter);
    if (from) q = q.gte("created_at", new Date(from).toISOString());
    if (to) q = q.lte("created_at", new Date(to).toISOString());

    const { data, error } = await q;
    setLoading(false);
    if (error) {
      toast({ title: "Query failed", description: error.message, variant: "destructive" });
      return;
    }
    setRows((data ?? []) as AuditRow[]);
  };

  useEffect(() => {
    if (isAdmin) runQuery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const summary = useMemo(() => {
    const total = rows.length;
    const success = rows.filter((r) => r.status === "success").length;
    const failed = rows.filter((r) => r.status === "failed").length;
    const credits = rows.reduce((acc, r) => acc + (r.credit_cost ?? 0), 0);
    return { total, success, failed, credits };
  }, [rows]);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-10 space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h1 className="font-serif text-3xl mb-3">Admin access required</h1>
          <p className="text-muted-foreground mb-6">
            Your account does not have the <code>admin</code> role.
          </p>
          <Button onClick={() => navigate("/dashboard")}>Back to dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 space-y-6">
        <header className="space-y-1">
          <h1 className="font-serif text-3xl md:text-4xl">Generation Audit Log</h1>
          <p className="text-muted-foreground text-sm">
            Filter and inspect AI generation events. The Gemini API key is never stored in this log.
          </p>
        </header>

        <DemoAccountCard />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filters</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="lg:col-span-2 space-y-1.5">
              <Label htmlFor="user">User ID</Label>
              <Input
                id="user"
                placeholder="uuid"
                value={userIdFilter}
                onChange={(e) => setUserIdFilter(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Mode</Label>
              <Select value={modeFilter} onValueChange={(v) => setModeFilter(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MODES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="from">From</Label>
              <Input id="from" type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="to">To</Label>
              <Input id="to" type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div className="lg:col-span-6 flex gap-2">
              <Button onClick={runQuery} disabled={loading}>{loading ? "Loading…" : "Apply filters"}</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setUserIdFilter(""); setModeFilter("all"); setStatusFilter("all"); setFrom(""); setTo("");
                  setTimeout(runQuery, 0);
                }}
              >Reset</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Rows", value: summary.total },
            { label: "Success", value: summary.success },
            { label: "Failed", value: summary.failed },
            { label: "Credits used", value: summary.credits },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="py-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                <div className="text-2xl font-serif mt-1">{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Theme</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Error</TableHead>
                  <TableHead>Correlation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && rows.length === 0 ? (
                  <TableRow><TableCell colSpan={8}><Skeleton className="h-6 w-full" /></TableCell></TableRow>
                ) : rows.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No matching events.</TableCell></TableRow>
                ) : rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap text-xs">{new Date(r.created_at).toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-xs">{r.user_id.slice(0, 8)}…</TableCell>
                    <TableCell>{r.mode}</TableCell>
                    <TableCell className="text-xs">{r.theme ?? "—"}</TableCell>
                    <TableCell className="text-right">{r.credit_cost}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[r.status] ?? "outline"}>{r.status}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">{r.error_code ?? "—"}</TableCell>
                    <TableCell className="font-mono text-xs">{r.correlation_id?.slice(0, 8) ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
