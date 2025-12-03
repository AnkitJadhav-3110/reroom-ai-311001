import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  price_monthly: number;
  credits_per_month: number;
  features: string[] | null;
  is_active: boolean | null;
}

interface UserSubscription {
  id: string;
  plan_id: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  plan?: SubscriptionPlan;
}

export const useSubscription = (userId?: string) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("is_active", true)
      .order("price_monthly", { ascending: true });

    if (error) {
      console.error("Error fetching plans:", error);
      return;
    }

    // Parse features JSON - ensure features are strings
    const parsedPlans = data?.map((plan) => ({
      ...plan,
      features: Array.isArray(plan.features) 
        ? plan.features.filter((f): f is string => typeof f === "string")
        : [],
    })) as SubscriptionPlan[];

    setPlans(parsedPlans || []);
  }, []);

  const fetchUserSubscription = useCallback(async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("user_subscriptions")
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      console.error("Error fetching subscription:", error);
      return;
    }

    if (data) {
      setUserSubscription({
        ...data,
        plan: data.plan ? {
          ...data.plan,
          features: Array.isArray(data.plan.features) 
            ? data.plan.features.filter((f): f is string => typeof f === "string")
            : [],
        } : undefined,
      });
    }
  }, [userId]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchPlans(), fetchUserSubscription()]);
      setLoading(false);
    };
    init();
  }, [fetchPlans, fetchUserSubscription]);

  const isSubscribed = !!userSubscription && userSubscription.status === "active";
  const currentPlan = userSubscription?.plan;

  return {
    plans,
    userSubscription,
    isSubscribed,
    currentPlan,
    loading,
    refetch: () => Promise.all([fetchPlans(), fetchUserSubscription()]),
  };
};
