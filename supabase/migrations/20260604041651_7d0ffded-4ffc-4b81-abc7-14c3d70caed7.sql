
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'test@test.com' LIMIT 1;
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, full_name, credits, subscription_tier, subscription_status)
    VALUES (v_user_id, 'test@test.com', 'Test Demo', 999999999, 'free', 'active')
    ON CONFLICT (id) DO UPDATE
      SET credits = 999999999,
          updated_at = now();
  END IF;
END $$;
