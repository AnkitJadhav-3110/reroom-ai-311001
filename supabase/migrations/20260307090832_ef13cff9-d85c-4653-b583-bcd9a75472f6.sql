
-- Fix affiliate self-approval: restrict INSERT to is_approved = false
DROP POLICY IF EXISTS "Users can create affiliate profile" ON public.affiliate_profiles;

CREATE POLICY "Users can create affiliate profile"
ON public.affiliate_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id AND is_approved = false);
