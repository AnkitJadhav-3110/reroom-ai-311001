
-- Migration: 20251029074007
-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  credits INTEGER NOT NULL DEFAULT 4,
  subscription_tier TEXT CHECK (subscription_tier IN ('free', 'basic', 'pro', 'premium')),
  subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'expired')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create generated_designs table to store user's AI-generated designs
CREATE TABLE public.generated_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_image_url TEXT NOT NULL,
  generated_image_url TEXT NOT NULL,
  theme TEXT NOT NULL,
  custom_prompt TEXT,
  public_share_id TEXT UNIQUE,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create credit_transactions table for tracking credit usage
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'refund', 'signup_bonus')),
  description TEXT,
  design_id UUID REFERENCES public.generated_designs(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Generated designs policies
CREATE POLICY "Users can view their own designs"
  ON public.generated_designs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own designs"
  ON public.generated_designs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own designs"
  ON public.generated_designs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own designs"
  ON public.generated_designs FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Public designs are viewable by anyone"
  ON public.generated_designs FOR SELECT
  USING (public_share_id IS NOT NULL);

-- Credit transactions policies
CREATE POLICY "Users can view their own transactions"
  ON public.credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON public.credit_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, credits, subscription_tier, subscription_status)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    4,
    'free',
    'active'
  );
  
  -- Record signup bonus transaction
  INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description)
  VALUES (NEW.id, 4, 'signup_bonus', 'Welcome bonus: 4 free credits');
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for room images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('room-images', 'room-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for room images
CREATE POLICY "Users can upload their own room images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'room-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own room images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'room-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Public room images are viewable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'room-images');

CREATE POLICY "Users can delete their own room images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'room-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Migration: 20251029074424
-- Create RPC function to get user credits
CREATE OR REPLACE FUNCTION public.get_user_credits(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_credits INTEGER;
BEGIN
  SELECT credits INTO user_credits
  FROM public.profiles
  WHERE user_id = p_user_id
  LIMIT 1;
  
  RETURN COALESCE(user_credits, 0);
END;
$$;

-- Migration: 20251029074500
-- Fix the search_path for get_user_credits function
DROP FUNCTION IF EXISTS public.get_user_credits(UUID);

CREATE OR REPLACE FUNCTION public.get_user_credits(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_credits INTEGER;
BEGIN
  SELECT credits INTO user_credits
  FROM public.profiles
  WHERE user_id = p_user_id
  LIMIT 1;
  
  RETURN COALESCE(user_credits, 0);
END;
$$;

-- Migration: 20251031050505
-- Make room-images storage bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'room-images';

-- Create RLS policies for room-images storage bucket
-- Policy 1: Users can insert their own images (path must start with their user_id)
CREATE POLICY "Users can upload their own images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'room-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Users can view their own images
CREATE POLICY "Users can view their own images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'room-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Users can update their own images
CREATE POLICY "Users can update their own images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'room-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Users can delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'room-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Migration: 20251101055344
-- Remove public SELECT policy on storage bucket
DROP POLICY IF EXISTS "Public room images are viewable" ON storage.objects;

-- The existing user-specific policies remain:
-- "Users can insert their own room images"
-- "Users can view their own room images" 
-- "Users can update their own room images"
-- "Users can delete their own room images";

-- Migration: 20251101055705
-- Fix 1: Update get_user_credits function with proper search_path
CREATE OR REPLACE FUNCTION public.get_user_credits(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $function$
DECLARE
  user_credits INTEGER;
BEGIN
  SELECT credits INTO user_credits
  FROM public.profiles
  WHERE user_id = p_user_id
  LIMIT 1;
  
  RETURN COALESCE(user_credits, 0);
END;
$function$;

-- Fix 2: Create feedback table with proper RLS
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on feedback table
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for feedback
CREATE POLICY "Users can insert their own feedback"
ON public.feedback
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback"
ON public.feedback
FOR SELECT
USING (auth.uid() = user_id);

-- Fix 3: Create view for public shared designs (excludes user_id)
CREATE OR REPLACE VIEW public.public_shared_designs AS
SELECT 
  id,
  original_image_url,
  generated_image_url,
  theme,
  custom_prompt,
  public_share_id,
  is_favorite,
  created_at
FROM public.generated_designs
WHERE public_share_id IS NOT NULL;

-- Grant SELECT on the view to authenticated and anonymous users
GRANT SELECT ON public.public_shared_designs TO authenticated, anon;

-- Migration: 20251101060042
-- Fix search_path for handle_new_user function to prevent search path manipulation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, credits, subscription_tier, subscription_status)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    4,
    'free',
    'active'
  );
  
  -- Record signup bonus transaction
  INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description)
  VALUES (NEW.id, 4, 'signup_bonus', 'Welcome bonus: 4 free credits');
  
  RETURN NEW;
END;
$function$;

-- Migration: 20251101060128
-- Fix security_invoker for public_shared_designs view to prevent privilege escalation
DROP VIEW IF EXISTS public.public_shared_designs;

CREATE VIEW public.public_shared_designs 
WITH (security_invoker = true) AS
SELECT 
  id,
  original_image_url,
  generated_image_url,
  theme,
  custom_prompt,
  public_share_id,
  is_favorite,
  created_at
FROM public.generated_designs
WHERE public_share_id IS NOT NULL;

-- Grant SELECT to authenticated and anonymous users
GRANT SELECT ON public.public_shared_designs TO authenticated, anon;

-- Fix search_path for update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public', 'pg_temp'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;
