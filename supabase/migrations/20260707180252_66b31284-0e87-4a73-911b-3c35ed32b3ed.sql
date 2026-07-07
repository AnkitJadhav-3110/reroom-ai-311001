-- Revoke column-level access to the sensitive 'prompt' field on marketplace_themes.
-- Access to prompt content is only allowed via the SECURITY DEFINER RPC public.get_theme_prompt(),
-- which enforces creator/purchase/free-approved gating.
REVOKE SELECT (prompt) ON public.marketplace_themes FROM anon, authenticated, PUBLIC;

-- Explicitly grant SELECT on all non-prompt columns so listing continues to work.
GRANT SELECT (
  id, creator_id, name, description, preview_image_url, price,
  is_free, is_approved, download_count, created_at, updated_at
) ON public.marketplace_themes TO anon, authenticated;

-- Creators still need to read their own prompt via RPC; service_role retains full access.
GRANT ALL ON public.marketplace_themes TO service_role;