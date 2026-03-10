-- 1. Fix affiliate_profiles UPDATE: lock sensitive fields
DROP POLICY IF EXISTS "Users can update own affiliate profile" ON public.affiliate_profiles;
CREATE POLICY "Users can update own affiliate profile" ON public.affiliate_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND is_approved IS NOT DISTINCT FROM (SELECT ap.is_approved FROM public.affiliate_profiles ap WHERE ap.id = affiliate_profiles.id)
    AND commission_rate IS NOT DISTINCT FROM (SELECT ap.commission_rate FROM public.affiliate_profiles ap WHERE ap.id = affiliate_profiles.id)
    AND total_earnings IS NOT DISTINCT FROM (SELECT ap.total_earnings FROM public.affiliate_profiles ap WHERE ap.id = affiliate_profiles.id)
    AND pending_earnings IS NOT DISTINCT FROM (SELECT ap.pending_earnings FROM public.affiliate_profiles ap WHERE ap.id = affiliate_profiles.id)
  );

-- 2. Remove user-facing INSERT on credit_transactions (only service role should insert)
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.credit_transactions;