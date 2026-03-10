-- 1. Fix user_subscriptions UPDATE policy: lock sensitive fields
DROP POLICY IF EXISTS "Users can update own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can update own subscription" ON public.user_subscriptions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND status IS NOT DISTINCT FROM (SELECT us.status FROM public.user_subscriptions us WHERE us.id = user_subscriptions.id)
    AND plan_id IS NOT DISTINCT FROM (SELECT us.plan_id FROM public.user_subscriptions us WHERE us.id = user_subscriptions.id)
    AND current_period_start IS NOT DISTINCT FROM (SELECT us.current_period_start FROM public.user_subscriptions us WHERE us.id = user_subscriptions.id)
    AND current_period_end IS NOT DISTINCT FROM (SELECT us.current_period_end FROM public.user_subscriptions us WHERE us.id = user_subscriptions.id)
    AND razorpay_subscription_id IS NOT DISTINCT FROM (SELECT us.razorpay_subscription_id FROM public.user_subscriptions us WHERE us.id = user_subscriptions.id)
    AND razorpay_customer_id IS NOT DISTINCT FROM (SELECT us.razorpay_customer_id FROM public.user_subscriptions us WHERE us.id = user_subscriptions.id)
  );

-- 2. Add internal auth guards to credit RPCs (defense-in-depth)
CREATE OR REPLACE FUNCTION public.deduct_credit(p_user_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE new_credits integer;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  UPDATE profiles
    SET credits = credits - 1, updated_at = now()
  WHERE id = p_user_id AND credits > 0
  RETURNING credits INTO new_credits;
  RETURN COALESCE(new_credits, -1);
END;
$$;

CREATE OR REPLACE FUNCTION public.refund_credit(p_user_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE new_credits integer;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  UPDATE profiles
    SET credits = credits + 1, updated_at = now()
  WHERE id = p_user_id
  RETURNING credits INTO new_credits;
  RETURN COALESCE(new_credits, -1);
END;
$$;

-- 3. Add admin-only SELECT policy on generated_designs for analytics
CREATE POLICY "Admins can view all designs" ON public.generated_designs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. Add admin-only SELECT policy on credit_transactions for analytics
CREATE POLICY "Admins can view all transactions" ON public.credit_transactions
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));