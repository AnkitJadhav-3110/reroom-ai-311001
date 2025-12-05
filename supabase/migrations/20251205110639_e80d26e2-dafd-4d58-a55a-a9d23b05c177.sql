-- Fix analytics_events table to prevent unauthenticated flooding
-- Drop the existing permissive INSERT policy
DROP POLICY IF EXISTS "Users can insert own events" ON public.analytics_events;

-- Create a new policy that requires authentication
CREATE POLICY "Users can insert own events" ON public.analytics_events
FOR INSERT WITH CHECK (auth.uid() = user_id AND user_id IS NOT NULL);