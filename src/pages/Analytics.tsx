import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, ArrowLeft, Users, ImageIcon, CreditCard, TrendingUp, BarChart3, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

interface AnalyticsData {
  totalDesigns: number;
  totalUsers: number;
  creditsUsed: number;
  designsByTheme: { theme: string; count: number }[];
  designsOverTime: { date: string; count: number }[];
  topThemes: { name: string; value: number }[];
}

const COLORS = ['#1E3B32', '#C8B88A', '#2A4F42', '#D4C9A8', '#3A6052', '#E5DCC0'];

const Analytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData>({
    totalDesigns: 0,
    totalUsers: 0,
    creditsUsed: 0,
    designsByTheme: [],
    designsOverTime: [],
    topThemes: [],
  });

  useEffect(() => {
    checkAdminAndFetchData();
  }, []);

  const checkAdminAndFetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // Check if user is admin
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roles) {
      navigate("/dashboard");
      return;
    }

    await fetchAnalytics();
  };

  const fetchAnalytics = async () => {
    try {
      // Fetch total designs - this user's designs
      const { count: designCount } = await supabase
        .from("generated_designs")
        .select("*", { count: "exact", head: true });

      // Fetch credit transactions
      const { data: transactions } = await supabase
        .from("credit_transactions")
        .select("amount, transaction_type");

      const creditsUsed = transactions
        ?.filter(t => t.transaction_type === "generation")
        .reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;

      // Fetch designs by theme
      const { data: designs } = await supabase
        .from("generated_designs")
        .select("theme, created_at");

      const themeCount: Record<string, number> = {};
      const dateCount: Record<string, number> = {};

      designs?.forEach(d => {
        themeCount[d.theme] = (themeCount[d.theme] || 0) + 1;
        const date = new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dateCount[date] = (dateCount[date] || 0) + 1;
      });

      const designsByTheme = Object.entries(themeCount)
        .map(([theme, count]) => ({ theme, count }))
        .sort((a, b) => b.count - a.count);

      const topThemes = designsByTheme.slice(0, 6).map(d => ({ name: d.theme, value: d.count }));

      const designsOverTime = Object.entries(dateCount)
        .map(([date, count]) => ({ date, count }))
        .slice(-14);

      setData({
        totalDesigns: designCount || 0,
        totalUsers: 0, // Admin-only metric
        creditsUsed,
        designsByTheme,
        designsOverTime,
        topThemes,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-2 border-primary/10 bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="text-primary hover:bg-primary/10 rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-card">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground tracking-tight">Analytics Dashboard</h1>
              <p className="text-xs text-muted-foreground font-body">Track engagement and performance</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 border-2 border-primary/10 rounded-3xl bg-card shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <ImageIcon className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-body">Total Designs</p>
                <p className="text-3xl font-serif font-bold text-foreground">{data.totalDesigns}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-primary/10 rounded-3xl bg-card shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center">
                <CreditCard className="w-7 h-7 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-body">Credits Used</p>
                <p className="text-3xl font-serif font-bold text-foreground">{data.creditsUsed}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-primary/10 rounded-3xl bg-card shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-body">Top Theme</p>
                <p className="text-xl font-serif font-bold text-foreground truncate">
                  {data.topThemes[0]?.name || "N/A"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-primary/10 rounded-3xl bg-card shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center">
                <Calendar className="w-7 h-7 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-body">This Week</p>
                <p className="text-3xl font-serif font-bold text-foreground">
                  {data.designsOverTime.slice(-7).reduce((sum, d) => sum + d.count, 0)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Designs Over Time */}
          <Card className="p-8 border-2 border-primary/10 rounded-3xl bg-card shadow-card">
            <h3 className="text-xl font-serif font-bold text-foreground mb-6">Designs Over Time</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.designsOverTime}>
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '2px solid hsl(var(--primary) / 0.2)',
                      borderRadius: '12px',
                      color: 'hsl(var(--foreground))'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#1E3B32" 
                    strokeWidth={3}
                    dot={{ fill: '#1E3B32', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Popular Themes Pie Chart */}
          <Card className="p-8 border-2 border-primary/10 rounded-3xl bg-card shadow-card">
            <h3 className="text-xl font-serif font-bold text-foreground mb-6">Popular Themes</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.topThemes}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {data.topThemes.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '2px solid hsl(var(--primary) / 0.2)',
                      borderRadius: '12px',
                      color: 'hsl(var(--foreground))'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Designs by Theme Bar Chart */}
          <Card className="p-8 border-2 border-primary/10 rounded-3xl bg-card shadow-card lg:col-span-2">
            <h3 className="text-xl font-serif font-bold text-foreground mb-6">Designs by Theme</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.designsByTheme.slice(0, 8)}>
                  <XAxis dataKey="theme" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '2px solid hsl(var(--primary) / 0.2)',
                      borderRadius: '12px',
                      color: 'hsl(var(--foreground))'
                    }} 
                  />
                  <Bar dataKey="count" fill="#1E3B32" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
