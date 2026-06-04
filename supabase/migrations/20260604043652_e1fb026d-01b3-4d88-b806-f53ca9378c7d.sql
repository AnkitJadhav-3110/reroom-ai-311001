
-- 1) Recreate test account (previous attempt left no row in auth.users)
DO $$
DECLARE v_uid uuid;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE email='test@test.com';
  IF v_uid IS NULL THEN
    v_uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token,
      email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_uid, 'authenticated', 'authenticated',
      'test@test.com', crypt('1234567890', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Test Account"}'::jsonb,
      false, '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_uid,
      jsonb_build_object('sub', v_uid::text, 'email','test@test.com','email_verified', true),
      'email', v_uid::text, now(), now(), now());
  ELSE
    UPDATE auth.users
      SET encrypted_password = crypt('1234567890', gen_salt('bf')),
          email_confirmed_at = COALESCE(email_confirmed_at, now())
      WHERE id = v_uid;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, credits, subscription_tier, subscription_status)
  VALUES (v_uid, 'test@test.com', 'Test Account', 999999999, 'free', 'active')
  ON CONFLICT (id) DO UPDATE SET credits = 999999999, subscription_status = 'active';
END $$;

-- 2) Generation audit log (no API key data stored)
CREATE TABLE IF NOT EXISTS public.generation_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mode text NOT NULL CHECK (mode IN ('theme','prompt')),
  theme text,
  credit_cost integer NOT NULL DEFAULT 1,
  status text NOT NULL CHECK (status IN ('success','failed','rate_limited','insufficient_credits','validation_failed','blocked')),
  correlation_id text,
  error_code text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.generation_audit_log TO authenticated;
GRANT ALL ON public.generation_audit_log TO service_role;

ALTER TABLE public.generation_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own audit rows"
  ON public.generation_audit_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all audit rows"
  ON public.generation_audit_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_gen_audit_user_created ON public.generation_audit_log (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gen_audit_status ON public.generation_audit_log (status, created_at DESC);
