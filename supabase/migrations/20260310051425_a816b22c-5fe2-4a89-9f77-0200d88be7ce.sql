
-- 1. REVOKE public execute on credit functions to prevent RPC abuse
REVOKE EXECUTE ON FUNCTION public.refund_credit(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.deduct_credit(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_credits(uuid) FROM PUBLIC;

-- 2. Drop the user_subscriptions INSERT policy (edge function uses service role, no client INSERT needed)
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.user_subscriptions;

-- 3. Replace profiles UPDATE policy with one that restricts sensitive fields
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update safe profile fields" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND credits = (SELECT p.credits FROM public.profiles p WHERE p.id = auth.uid())
    AND subscription_tier IS NOT DISTINCT FROM (SELECT p.subscription_tier FROM public.profiles p WHERE p.id = auth.uid())
    AND subscription_status IS NOT DISTINCT FROM (SELECT p.subscription_status FROM public.profiles p WHERE p.id = auth.uid())
    AND stripe_customer_id IS NOT DISTINCT FROM (SELECT p.stripe_customer_id FROM public.profiles p WHERE p.id = auth.uid())
    AND stripe_subscription_id IS NOT DISTINCT FROM (SELECT p.stripe_subscription_id FROM public.profiles p WHERE p.id = auth.uid())
  );

-- 4. Fix newsletter INSERT policy (WITH CHECK true -> restrict to valid email format)
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscriptions;
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscriptions
  FOR INSERT TO public
  WITH CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
