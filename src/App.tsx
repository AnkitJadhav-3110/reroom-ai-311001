// App entry point - triggers rebuild
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import SharedDesign from "./pages/SharedDesign";
import Subscription from "./pages/Subscription";
import Marketplace from "./pages/Marketplace";
import Affiliate from "./pages/Affiliate";
import Blog from "./pages/Blog";
import Analytics from "./pages/Analytics";
import AdminAuditLog from "./pages/AdminAuditLog";
import NotFound from "./pages/NotFound";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/shared/:shareId" element={<SharedDesign />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/affiliate" element={<Affiliate />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/admin/audit-log" element={<AdminAuditLog />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <VercelAnalytics />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
