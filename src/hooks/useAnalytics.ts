import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

type EventType =
  | "page_view"
  | "design_generated"
  | "design_shared"
  | "subscription_started"
  | "theme_purchased"
  | "referral_click"
  | "signup"
  | "login";

interface EventData {
  [key: string]: string | number | boolean | null;
}

export const useAnalytics = () => {
  const trackEvent = useCallback(
    async (eventType: EventType, eventData?: EventData) => {
      try {
        const { data: session } = await supabase.auth.getSession();
        const userId = session.session?.user?.id || null;

        await supabase.from("analytics_events").insert({
          user_id: userId,
          event_type: eventType,
          event_data: eventData || {},
          page_url: window.location.href,
        });
      } catch (error) {
        console.error("Analytics error:", error);
      }
    },
    []
  );

  const trackPageView = useCallback(
    (pageName: string) => {
      trackEvent("page_view", { page: pageName });
    },
    [trackEvent]
  );

  const trackDesignGenerated = useCallback(
    (theme: string) => {
      trackEvent("design_generated", { theme });
    },
    [trackEvent]
  );

  const trackDesignShared = useCallback(
    (designId: string, platform: string) => {
      trackEvent("design_shared", { designId, platform });
    },
    [trackEvent]
  );

  const trackSubscription = useCallback(
    (planName: string, planPrice: number) => {
      trackEvent("subscription_started", { planName, planPrice });
    },
    [trackEvent]
  );

  return {
    trackEvent,
    trackPageView,
    trackDesignGenerated,
    trackDesignShared,
    trackSubscription,
  };
};
