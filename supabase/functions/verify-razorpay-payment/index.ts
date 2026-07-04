import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import { encode } from "https://deno.land/std@0.168.0/encoding/hex.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Fail fast when Razorpay isn't configured — the previous fallback
    // to 'placeholder_secret' let attackers forge valid HMAC signatures.
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error("Razorpay credentials missing");
      return new Response(JSON.stringify({ error: "Payment service is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = await req.json();

    // Verify signature
    const message = `${razorpay_order_id}|${razorpay_payment_id}`;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(RAZORPAY_KEY_SECRET);
    const messageData = encoder.encode(message);
    
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    const expectedSignature = new TextDecoder().decode(encode(new Uint8Array(signature)));

    if (expectedSignature !== razorpay_signature) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Anti plan-substitution: the HMAC only covers order_id|payment_id, so
    // the client-supplied `planId` is not trustworthy. Fetch the order
    // authoritatively from Razorpay and compare against `notes.plan_id`
    // that we stamped when the order was created.
    const orderResp = await fetch(
      `https://api.razorpay.com/v1/orders/${encodeURIComponent(razorpay_order_id)}`,
      {
        headers: {
          Authorization: `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`,
        },
      },
    );
    if (!orderResp.ok) {
      console.error("Failed to fetch Razorpay order for verification", orderResp.status);
      return new Response(JSON.stringify({ error: "Unable to verify order" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const rzpOrder = await orderResp.json();
    const authoritativePlanId: string | undefined = rzpOrder?.notes?.plan_id;
    const authoritativeUserId: string | undefined = rzpOrder?.notes?.user_id;
    if (!authoritativePlanId || authoritativePlanId !== planId || authoritativeUserId !== user.id) {
      console.warn("Plan/user mismatch during payment verification", {
        client_plan: planId,
        order_plan: authoritativePlanId,
        client_user: user.id,
        order_user: authoritativeUserId,
      });
      return new Response(JSON.stringify({ error: "Plan mismatch" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get plan details using the authoritative planId from the order.
    const { data: plan, error: planError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", authoritativePlanId)
      .single();

    if (planError || !plan) {
      return new Response(JSON.stringify({ error: "Plan not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Idempotency guard: reject replay of the same Razorpay payment.
    const { error: dedupeError } = await supabase
      .from("processed_payments")
      .insert({
        razorpay_payment_id,
        user_id: user.id,
        plan_id: authoritativePlanId,
        credits_awarded: plan.credits_per_month,
      });
    if (dedupeError) {
      // Unique violation => payment already processed.
      if ((dedupeError as { code?: string }).code === "23505") {
        return new Response(
          JSON.stringify({ error: "Payment already processed" }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      console.error("processed_payments insert failed", dedupeError);
      return new Response(JSON.stringify({ error: "Unable to record payment" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create or update subscription
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const { data: existingSub } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingSub) {
      await supabase
        .from("user_subscriptions")
        .update({
          plan_id: planId,
          status: "active",
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          razorpay_subscription_id: razorpay_payment_id,
        })
        .eq("user_id", user.id);
    } else {
      await supabase.from("user_subscriptions").insert({
        user_id: user.id,
        plan_id: planId,
        status: "active",
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        razorpay_subscription_id: razorpay_payment_id,
      });
    }

    // Add credits to user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single();

    const currentCredits = profile?.credits || 0;
    const newCredits = currentCredits + plan.credits_per_month;

    await supabase
      .from("profiles")
      .update({
        credits: newCredits,
        subscription_tier: plan.slug,
        subscription_status: "active",
      })
      .eq("id", user.id);

    // Record credit transaction
    await supabase.from("credit_transactions").insert({
      user_id: user.id,
      amount: plan.credits_per_month,
      transaction_type: "subscription",
      description: `${plan.name} subscription - ${plan.credits_per_month} credits`,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment verified and subscription activated",
        credits: newCredits,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    console.error("Payment verification error details:", error instanceof Error ? error.message : error);
    return new Response(JSON.stringify({ error: "An internal error occurred. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
