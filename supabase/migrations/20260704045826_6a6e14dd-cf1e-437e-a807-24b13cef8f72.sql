CREATE TABLE IF NOT EXISTS public.processed_payments (
  razorpay_payment_id text PRIMARY KEY,
  user_id uuid NOT NULL,
  plan_id uuid,
  credits_awarded integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.processed_payments TO service_role;

ALTER TABLE public.processed_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service role manages processed payments"
  ON public.processed_payments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);