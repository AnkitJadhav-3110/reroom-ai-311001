-- 1. Remove hardcoded test account
DELETE FROM auth.users WHERE email = 'test@test.com';

-- 2. Persistent rate limiter
CREATE TABLE IF NOT EXISTS public.rate_limits (
  bucket_key    text NOT NULL,
  window_start  timestamptz NOT NULL,
  hits          integer NOT NULL DEFAULT 0,
  PRIMARY KEY (bucket_key, window_start)
);
GRANT ALL ON public.rate_limits TO service_role;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.check_and_increment_rate_limit(
  p_bucket_key text,
  p_window_seconds integer,
  p_max_requests integer
) RETURNS TABLE (allowed boolean, remaining integer, reset_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start timestamptz;
  v_hits integer;
BEGIN
  v_window_start := to_timestamp(
    (extract(epoch FROM now())::bigint / p_window_seconds) * p_window_seconds
  );

  INSERT INTO public.rate_limits(bucket_key, window_start, hits)
  VALUES (p_bucket_key, v_window_start, 1)
  ON CONFLICT (bucket_key, window_start)
    DO UPDATE SET hits = public.rate_limits.hits + 1
  RETURNING hits INTO v_hits;

  DELETE FROM public.rate_limits
   WHERE window_start < now() - interval '1 day'
     AND bucket_key = p_bucket_key;

  RETURN QUERY SELECT
    (v_hits <= p_max_requests),
    GREATEST(p_max_requests - v_hits, 0),
    v_window_start + (p_window_seconds || ' seconds')::interval;
END;
$$;
REVOKE ALL ON FUNCTION public.check_and_increment_rate_limit(text, integer, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_increment_rate_limit(text, integer, integer)
  TO service_role;

-- 3. has_role -> SECURITY INVOKER (works because user_roles SELECT policy allows self-read)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Revoke execute from anon/authenticated on all other public SECURITY DEFINER functions
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT n.nspname, p.proname,
           pg_get_function_identity_arguments(p.oid) AS args
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
       AND p.prosecdef = true
       AND p.proname <> 'has_role'
  LOOP
    EXECUTE format(
      'REVOKE ALL ON FUNCTION %I.%I(%s) FROM PUBLIC, anon, authenticated;',
      r.nspname, r.proname, r.args
    );
    EXECUTE format(
      'GRANT EXECUTE ON FUNCTION %I.%I(%s) TO service_role;',
      r.nspname, r.proname, r.args
    );
  END LOOP;
END $$;

-- 4. analytics_events: replace redundant INSERT policy
DROP POLICY IF EXISTS "Users can insert own events" ON public.analytics_events;
CREATE POLICY "Authenticated users insert own events"
  ON public.analytics_events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 5. marketplace_themes: hide prompt column via column-level revoke
REVOKE SELECT ON public.marketplace_themes FROM anon, authenticated;
GRANT SELECT (id, creator_id, name, description, preview_image_url, price,
              is_free, is_approved, download_count, created_at, updated_at)
  ON public.marketplace_themes TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_theme_prompt(p_theme_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prompt text;
  v_creator uuid;
  v_is_free boolean;
  v_is_approved boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'auth required';
  END IF;

  SELECT prompt, creator_id, is_free, is_approved
    INTO v_prompt, v_creator, v_is_free, v_is_approved
    FROM public.marketplace_themes
   WHERE id = p_theme_id;

  IF NOT FOUND THEN RETURN NULL; END IF;
  IF v_creator = auth.uid() THEN RETURN v_prompt; END IF;
  IF v_is_free AND v_is_approved THEN RETURN v_prompt; END IF;
  IF EXISTS (
    SELECT 1 FROM public.user_purchased_themes
     WHERE user_id = auth.uid() AND theme_id = p_theme_id
  ) THEN
    RETURN v_prompt;
  END IF;

  RAISE EXCEPTION 'not authorized to view this prompt';
END;
$$;
REVOKE ALL ON FUNCTION public.get_theme_prompt(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_theme_prompt(uuid) TO authenticated;

-- 6. Drop unused newsletter_subscriptions table
DROP TABLE IF EXISTS public.newsletter_subscriptions CASCADE;

-- 7. profiles: drop unused Stripe id columns
DROP POLICY IF EXISTS "Users can update safe profile fields" ON public.profiles;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS stripe_customer_id;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS stripe_subscription_id;
CREATE POLICY "Users can update safe profile fields"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND credits              = (SELECT p.credits              FROM profiles p WHERE p.id = auth.uid())
    AND subscription_tier    IS NOT DISTINCT FROM (SELECT p.subscription_tier    FROM profiles p WHERE p.id = auth.uid())
    AND subscription_status  IS NOT DISTINCT FROM (SELECT p.subscription_status  FROM profiles p WHERE p.id = auth.uid())
  );

-- 8. user_subscriptions: hide razorpay ids from client
REVOKE SELECT ON public.user_subscriptions FROM anon, authenticated;
GRANT SELECT (id, user_id, plan_id, status,
              current_period_start, current_period_end,
              created_at, updated_at)
  ON public.user_subscriptions TO authenticated;