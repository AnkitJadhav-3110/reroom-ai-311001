-- Fix critical security issues: Remove public access from sensitive tables

-- Revoke all public access from profiles table
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.profiles FROM authenticated;

-- Revoke all public access from credit_transactions table
REVOKE ALL ON public.credit_transactions FROM anon;
REVOKE ALL ON public.credit_transactions FROM authenticated;

-- Grant proper access back to authenticated users (via RLS policies already in place)
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT ON public.credit_transactions TO authenticated;

-- Add comment to document the security fix
COMMENT ON TABLE public.profiles IS 'Contains sensitive user data including emails and payment info. Access controlled via RLS policies only.';
COMMENT ON TABLE public.credit_transactions IS 'Contains user purchase history. Access controlled via RLS policies only.';