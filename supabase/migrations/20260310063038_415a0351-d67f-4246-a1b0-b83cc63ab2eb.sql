
-- 1. Fix PAYMENT_BYPASS: Remove direct INSERT on user_purchased_themes, only service-role should insert
DROP POLICY IF EXISTS "Users can insert own purchases" ON public.user_purchased_themes;

-- 2. Fix MISSING_RLS_PROTECTION: public_shared_designs is a VIEW, so RLS doesn't apply directly.
-- It uses security_invoker, so it inherits RLS from generated_designs base table which already has proper policies.
-- No action needed - marking as acknowledged.

-- 3. Fix SELF_REFERRAL_FRAUD: Prevent self-referrals
DROP POLICY IF EXISTS "Authenticated users can create referrals" ON public.referrals;
CREATE POLICY "Authenticated users can create referrals" ON public.referrals
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = referred_user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.affiliate_profiles
      WHERE id = affiliate_id AND user_id = auth.uid()
    )
  );
