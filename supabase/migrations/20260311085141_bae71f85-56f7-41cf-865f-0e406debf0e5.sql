-- Fix ALL RLS policies: change from RESTRICTIVE to PERMISSIVE
-- This is critical because RESTRICTIVE-only policies block all access

-- ========== profiles ==========
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO public USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT TO public WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update safe profile fields" ON public.profiles;
CREATE POLICY "Users can update safe profile fields" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    (auth.uid() = id)
    AND (credits = (SELECT p.credits FROM profiles p WHERE p.id = auth.uid()))
    AND (NOT (subscription_tier IS DISTINCT FROM (SELECT p.subscription_tier FROM profiles p WHERE p.id = auth.uid())))
    AND (NOT (subscription_status IS DISTINCT FROM (SELECT p.subscription_status FROM profiles p WHERE p.id = auth.uid())))
    AND (NOT (stripe_customer_id IS DISTINCT FROM (SELECT p.stripe_customer_id FROM profiles p WHERE p.id = auth.uid())))
    AND (NOT (stripe_subscription_id IS DISTINCT FROM (SELECT p.stripe_subscription_id FROM profiles p WHERE p.id = auth.uid())))
  );

-- ========== generated_designs ==========
DROP POLICY IF EXISTS "Users can view their own designs" ON public.generated_designs;
CREATE POLICY "Users can view their own designs" ON public.generated_designs
  FOR SELECT TO public USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public designs are viewable by anyone" ON public.generated_designs;
CREATE POLICY "Public designs are viewable by anyone" ON public.generated_designs
  FOR SELECT TO public USING (public_share_id IS NOT NULL);

DROP POLICY IF EXISTS "Admins can view all designs" ON public.generated_designs;
CREATE POLICY "Admins can view all designs" ON public.generated_designs
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can insert their own designs" ON public.generated_designs;
CREATE POLICY "Users can insert their own designs" ON public.generated_designs
  FOR INSERT TO public WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own designs" ON public.generated_designs;
CREATE POLICY "Users can update their own designs" ON public.generated_designs
  FOR UPDATE TO public USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own designs" ON public.generated_designs;
CREATE POLICY "Users can delete their own designs" ON public.generated_designs
  FOR DELETE TO public USING (auth.uid() = user_id);

-- ========== credit_transactions ==========
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.credit_transactions;
CREATE POLICY "Users can view their own transactions" ON public.credit_transactions
  FOR SELECT TO public USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all transactions" ON public.credit_transactions;
CREATE POLICY "Admins can view all transactions" ON public.credit_transactions
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- ========== subscription_plans ==========
DROP POLICY IF EXISTS "Anyone can view active plans" ON public.subscription_plans;
CREATE POLICY "Anyone can view active plans" ON public.subscription_plans
  FOR SELECT TO public USING (is_active = true);

-- ========== user_subscriptions ==========
DROP POLICY IF EXISTS "Users can view own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can view own subscription" ON public.user_subscriptions
  FOR SELECT TO public USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can update own subscription" ON public.user_subscriptions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    (auth.uid() = user_id)
    AND (NOT (status IS DISTINCT FROM (SELECT us.status FROM user_subscriptions us WHERE us.id = user_subscriptions.id)))
    AND (NOT (plan_id IS DISTINCT FROM (SELECT us.plan_id FROM user_subscriptions us WHERE us.id = user_subscriptions.id)))
    AND (NOT (current_period_start IS DISTINCT FROM (SELECT us.current_period_start FROM user_subscriptions us WHERE us.id = user_subscriptions.id)))
    AND (NOT (current_period_end IS DISTINCT FROM (SELECT us.current_period_end FROM user_subscriptions us WHERE us.id = user_subscriptions.id)))
    AND (NOT (razorpay_subscription_id IS DISTINCT FROM (SELECT us.razorpay_subscription_id FROM user_subscriptions us WHERE us.id = user_subscriptions.id)))
    AND (NOT (razorpay_customer_id IS DISTINCT FROM (SELECT us.razorpay_customer_id FROM user_subscriptions us WHERE us.id = user_subscriptions.id)))
  );

-- ========== blog_posts ==========
DROP POLICY IF EXISTS "Anyone can view published posts" ON public.blog_posts;
CREATE POLICY "Anyone can view published posts" ON public.blog_posts
  FOR SELECT TO public USING (is_published = true);

-- ========== marketplace_themes ==========
DROP POLICY IF EXISTS "Anyone can view approved themes" ON public.marketplace_themes;
CREATE POLICY "Anyone can view approved themes" ON public.marketplace_themes
  FOR SELECT TO public USING ((is_approved = true) OR (creator_id = auth.uid()));

DROP POLICY IF EXISTS "Users can create themes" ON public.marketplace_themes;
CREATE POLICY "Users can create themes" ON public.marketplace_themes
  FOR INSERT TO public WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Creators can update own themes" ON public.marketplace_themes;
CREATE POLICY "Creators can update own themes" ON public.marketplace_themes
  FOR UPDATE TO public
  USING (auth.uid() = creator_id)
  WITH CHECK (
    (auth.uid() = creator_id)
    AND (NOT (is_approved IS DISTINCT FROM (SELECT mt.is_approved FROM marketplace_themes mt WHERE mt.id = marketplace_themes.id)))
  );

-- ========== user_purchased_themes ==========
DROP POLICY IF EXISTS "Users can view own purchases" ON public.user_purchased_themes;
CREATE POLICY "Users can view own purchases" ON public.user_purchased_themes
  FOR SELECT TO public USING (auth.uid() = user_id);

-- ========== feedback ==========
DROP POLICY IF EXISTS "Users can view their own feedback" ON public.feedback;
CREATE POLICY "Users can view their own feedback" ON public.feedback
  FOR SELECT TO public USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own feedback" ON public.feedback;
CREATE POLICY "Users can insert their own feedback" ON public.feedback
  FOR INSERT TO public WITH CHECK (auth.uid() = user_id);

-- ========== analytics_events ==========
DROP POLICY IF EXISTS "Users can view own events" ON public.analytics_events;
CREATE POLICY "Users can view own events" ON public.analytics_events
  FOR SELECT TO public USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own events" ON public.analytics_events;
CREATE POLICY "Users can insert own events" ON public.analytics_events
  FOR INSERT TO public WITH CHECK ((auth.uid() = user_id) AND (user_id IS NOT NULL));

-- ========== user_roles ==========
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO public USING (auth.uid() = user_id);

-- ========== affiliate_profiles ==========
DROP POLICY IF EXISTS "Users can view own affiliate profile" ON public.affiliate_profiles;
CREATE POLICY "Users can view own affiliate profile" ON public.affiliate_profiles
  FOR SELECT TO public USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create affiliate profile" ON public.affiliate_profiles;
CREATE POLICY "Users can create affiliate profile" ON public.affiliate_profiles
  FOR INSERT TO public WITH CHECK ((auth.uid() = user_id) AND (is_approved = false));

DROP POLICY IF EXISTS "Users can update own affiliate profile" ON public.affiliate_profiles;
CREATE POLICY "Users can update own affiliate profile" ON public.affiliate_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    (auth.uid() = user_id)
    AND (NOT (is_approved IS DISTINCT FROM (SELECT ap.is_approved FROM affiliate_profiles ap WHERE ap.id = affiliate_profiles.id)))
    AND (NOT (commission_rate IS DISTINCT FROM (SELECT ap.commission_rate FROM affiliate_profiles ap WHERE ap.id = affiliate_profiles.id)))
    AND (NOT (total_earnings IS DISTINCT FROM (SELECT ap.total_earnings FROM affiliate_profiles ap WHERE ap.id = affiliate_profiles.id)))
    AND (NOT (pending_earnings IS DISTINCT FROM (SELECT ap.pending_earnings FROM affiliate_profiles ap WHERE ap.id = affiliate_profiles.id)))
  );

-- ========== referrals ==========
DROP POLICY IF EXISTS "Affiliates can view own referrals" ON public.referrals;
CREATE POLICY "Affiliates can view own referrals" ON public.referrals
  FOR SELECT TO public USING (EXISTS (
    SELECT 1 FROM affiliate_profiles WHERE affiliate_profiles.id = referrals.affiliate_id AND affiliate_profiles.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Authenticated users can create referrals" ON public.referrals;
CREATE POLICY "Authenticated users can create referrals" ON public.referrals
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = referred_user_id
    AND NOT EXISTS (
      SELECT 1 FROM affiliate_profiles WHERE id = affiliate_id AND user_id = auth.uid()
    )
  );

-- ========== commission_earnings ==========
DROP POLICY IF EXISTS "Affiliates can view own earnings" ON public.commission_earnings;
CREATE POLICY "Affiliates can view own earnings" ON public.commission_earnings
  FOR SELECT TO public USING (EXISTS (
    SELECT 1 FROM affiliate_profiles WHERE affiliate_profiles.id = commission_earnings.affiliate_id AND affiliate_profiles.user_id = auth.uid()
  ));

-- ========== newsletter_subscriptions ==========
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscriptions;
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscriptions
  FOR INSERT TO public WITH CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text);

DROP POLICY IF EXISTS "Users can manage own subscription" ON public.newsletter_subscriptions;
CREATE POLICY "Users can manage own subscription" ON public.newsletter_subscriptions
  FOR UPDATE TO public
  USING (email = ((SELECT users.email FROM auth.users WHERE users.id = auth.uid()))::text);