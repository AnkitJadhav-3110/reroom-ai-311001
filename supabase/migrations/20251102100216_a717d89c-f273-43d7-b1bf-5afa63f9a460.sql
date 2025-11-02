-- Recreate the view with SECURITY INVOKER to ensure proper permission checks
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
  created_at,
  is_favorite
FROM public.generated_designs
WHERE public_share_id IS NOT NULL;