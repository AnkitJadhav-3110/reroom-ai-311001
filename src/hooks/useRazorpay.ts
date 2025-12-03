import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayOptions {
  planId: string;
  onSuccess: (credits: number) => void;
  onError?: (error: string) => void;
}

export const useRazorpay = () => {
  const loadRazorpayScript = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  const initiatePayment = useCallback(
    async ({ planId, onSuccess, onError }: RazorpayOptions) => {
      try {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          throw new Error("Failed to load Razorpay SDK");
        }

        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          throw new Error("Please sign in to continue");
        }

        // Create order
        const { data: orderData, error: orderError } = await supabase.functions.invoke(
          "create-razorpay-order",
          {
            body: { planId },
          }
        );

        if (orderError || !orderData) {
          throw new Error(orderError?.message || "Failed to create order");
        }

        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "ReRoom AI",
          description: `${orderData.plan.name} Subscription`,
          order_id: orderData.orderId,
          handler: async (response: any) => {
            try {
              // Verify payment
              const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
                "verify-razorpay-payment",
                {
                  body: {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    planId,
                  },
                }
              );

              if (verifyError || !verifyData?.success) {
                throw new Error(verifyError?.message || "Payment verification failed");
              }

              toast.success("Payment successful! Credits added to your account.");
              onSuccess(verifyData.credits);
            } catch (err: any) {
              toast.error(err.message);
              onError?.(err.message);
            }
          },
          prefill: {
            email: sessionData.session.user.email,
          },
          theme: {
            color: "#2D5A4A",
          },
          modal: {
            ondismiss: () => {
              toast.info("Payment cancelled");
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } catch (err: any) {
        toast.error(err.message);
        onError?.(err.message);
      }
    },
    [loadRazorpayScript]
  );

  return { initiatePayment };
};
