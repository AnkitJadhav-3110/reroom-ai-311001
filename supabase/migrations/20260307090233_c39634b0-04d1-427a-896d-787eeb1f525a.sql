
-- Fix 1: Prevent creators from self-approving marketplace themes
DROP POLICY IF EXISTS "Creators can update own themes" ON public.marketplace_themes;

CREATE POLICY "Creators can update own themes"
ON public.marketplace_themes FOR UPDATE
USING (auth.uid() = creator_id)
WITH CHECK (
  auth.uid() = creator_id
  AND is_approved IS NOT DISTINCT FROM (SELECT mt.is_approved FROM public.marketplace_themes mt WHERE mt.id = marketplace_themes.id)
);

-- Fix 2: Atomic credit deduction RPC to prevent race condition
CREATE OR REPLACE FUNCTION public.deduct_credit(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE new_credits integer;
BEGIN
  UPDATE profiles
    SET credits = credits - 1, updated_at = now()
  WHERE id = p_user_id AND credits > 0
  RETURNING credits INTO new_credits;
  RETURN COALESCE(new_credits, -1);
END;
$$;

-- Fix 3: Atomic credit refund RPC
CREATE OR REPLACE FUNCTION public.refund_credit(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE new_credits integer;
BEGIN
  UPDATE profiles
    SET credits = credits + 1, updated_at = now()
  WHERE id = p_user_id
  RETURNING credits INTO new_credits;
  RETURN COALESCE(new_credits, -1);
END;
$$;
