-- Allow authenticated users to create referrals (for referral tracking)
CREATE POLICY "Authenticated users can create referrals"
ON referrals FOR INSERT
WITH CHECK (auth.uid() = referred_user_id);