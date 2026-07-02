import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { encode as encodeBase64 } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { checkRateLimit } from '../_shared/rateLimiter.ts';
import { ErrorCodes, createErrorResponse } from '../_shared/errorCodes.ts';
import { buildDesignPrompt } from './logic.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// SSRF defence: only allow image URLs that resolve to Supabase Storage
// (the app's only legitimate source). Add extra hosts here if new
// upload providers are wired in.
const ALLOWED_IMAGE_HOSTS = ['supabase.co', 'supabase.in'];
function isAllowedImageUrl(u: string): boolean {
  try {
    const url = new URL(u);
    if (url.protocol !== 'https:') return false;
    const host = url.hostname.toLowerCase();
    return ALLOWED_IMAGE_HOSTS.some((d) => host === d || host.endsWith('.' + d));
  } catch {
    return false;
  }
}

serve(async (req) => {
  const correlationId = crypto.randomUUID();
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  // KEY ROTATION SUPPORT: read the secret fresh on every request. Updating
  // GEMINI_API_KEY in Supabase secrets takes effect on the next invocation
  // — no code redeploy required. Never log or return this value.
  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

  // Always-create admin client; we use it both for auth + audit even on early returns.
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const audit = async (
    user_id: string | null,
    mode: 'theme' | 'prompt',
    status: string,
    extras: { theme?: string; credit_cost?: number; error_code?: string } = {},
  ) => {
    if (!user_id) return;
    try {
      await supabaseAdmin.from('generation_audit_log').insert({
        user_id, mode, status,
        theme: extras.theme ?? null,
        credit_cost: extras.credit_cost ?? 0,
        correlation_id: correlationId,
        error_code: extras.error_code ?? null,
      });
    } catch (_) { /* never let audit failures break the request */ }
  };

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify(createErrorResponse(ErrorCodes.AUTH_MISSING, correlationId)),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify(createErrorResponse(ErrorCodes.AUTH_INVALID, correlationId)),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Rate limiting for every caller — 10 generations/hour. The former
    // "test account" bypass has been removed along with the seeded
    // credentials; no user is allowed to skip throttling.
    const rl = await checkRateLimit(user.id, 'generate-room-design', {
      maxRequests: 10,
      windowMs: 60 * 60 * 1000,
    });
    if (!rl.allowed) {
      await audit(user.id, 'theme', 'rate_limited', { error_code: ErrorCodes.RATE_LIMIT_EXCEEDED.code });
      return new Response(JSON.stringify(createErrorResponse(ErrorCodes.RATE_LIMIT_EXCEEDED, correlationId)),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const requestBody = await req.json();
    const inputSchema = z.object({
      imageUrl: z.string().url().max(2048),
      theme: z.enum(['modern','luxury','minimalist','contemporary','rustic','industrial']).optional(),
      customPrompt: z.string().max(500).regex(/^[a-zA-Z0-9\s.,!?'-]+$/).optional(),
    });
    const parsed = inputSchema.safeParse(requestBody);
    if (!parsed.success) {
      await audit(user.id, 'theme', 'validation_failed', { error_code: ErrorCodes.VALIDATION_FAILED.code });
      return new Response(JSON.stringify(createErrorResponse(ErrorCodes.VALIDATION_FAILED, correlationId)),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const { imageUrl, theme, customPrompt } = parsed.data;
    const mode: 'theme' | 'prompt' = customPrompt ? 'prompt' : 'theme';

    // SSRF guard: only accept Supabase Storage URLs. Without this, an
    // authenticated caller could point the fetch at internal metadata
    // endpoints or arbitrary hosts.
    if (!isAllowedImageUrl(imageUrl)) {
      await audit(user.id, mode, 'validation_failed', { theme, error_code: 'IMAGE_URL_NOT_ALLOWED' });
      return new Response(JSON.stringify(createErrorResponse(ErrorCodes.VALIDATION_FAILED, correlationId)),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!GEMINI_API_KEY) {
      await audit(user.id, mode, 'failed', { theme, error_code: ErrorCodes.CONFIG_ERROR.code });
      return new Response(JSON.stringify(createErrorResponse(ErrorCodes.CONFIG_ERROR, correlationId)),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 1 credit per generation (test account included; it's seeded with ~1B credits).
    const { data: deducted, error: deductError } = await supabaseAdmin.rpc('deduct_credit', { p_user_id: user.id });
    if (deductError) {
      await audit(user.id, mode, 'failed', { theme, error_code: ErrorCodes.SERVICE_ERROR.code });
      return new Response(JSON.stringify(createErrorResponse(ErrorCodes.SERVICE_ERROR, correlationId)),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (deducted === -1) {
      await audit(user.id, mode, 'insufficient_credits', { theme, error_code: ErrorCodes.INSUFFICIENT_CREDITS.code });
      return new Response(JSON.stringify(createErrorResponse(ErrorCodes.INSUFFICIENT_CREDITS, correlationId)),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const newCredits = deducted;
    const designPrompt = buildDesignPrompt({ customPrompt, theme });

    const imgResp = await fetch(imageUrl);
    if (!imgResp.ok) {
      await supabaseAdmin.rpc('refund_credit', { p_user_id: user.id });
      await audit(user.id, mode, 'failed', { theme, credit_cost: 0, error_code: 'IMAGE_FETCH_FAILED' });
      return new Response(JSON.stringify(createErrorResponse(ErrorCodes.GENERATION_FAILED, correlationId)),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const imgBytes = new Uint8Array(await imgResp.arrayBuffer());
    const imgBase64 = encodeBase64(imgBytes);
    const mimeType = imgResp.headers.get('content-type')?.split(';')[0] || 'image/jpeg';

    console.log(`[${correlationId}] Calling Gemini for user ${user.id} mode=${mode}`);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
        body: JSON.stringify({
          contents: [{ parts: [
            { text: designPrompt },
            { inline_data: { mime_type: mimeType, data: imgBase64 } },
          ]}],
          generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      const safeErr = errText.replaceAll(GEMINI_API_KEY, '[REDACTED]');
      console.error(`[${correlationId}] Gemini error: ${response.status} ${safeErr}`);
      await supabaseAdmin.rpc('refund_credit', { p_user_id: user.id });
      await audit(user.id, mode, 'failed', { theme, credit_cost: 0, error_code: `GEMINI_${response.status}` });
      return new Response(JSON.stringify(createErrorResponse(ErrorCodes.GENERATION_FAILED, correlationId)),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p: any) => p.inline_data || p.inlineData);
    const inline = imagePart?.inline_data || imagePart?.inlineData;
    const b64 = inline?.data;
    const outMime = inline?.mime_type || inline?.mimeType || 'image/png';
    if (!b64) {
      await supabaseAdmin.rpc('refund_credit', { p_user_id: user.id });
      await audit(user.id, mode, 'failed', { theme, credit_cost: 0, error_code: 'GEMINI_NO_IMAGE' });
      return new Response(JSON.stringify(createErrorResponse(ErrorCodes.GENERATION_FAILED, correlationId)),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const generatedImageUrl = `data:${outMime};base64,${b64}`;

    await supabaseAdmin.from('credit_transactions').insert({
      user_id: user.id, amount: -1, transaction_type: 'design_generation',
      description: `Generated ${theme || 'custom'} design${isTestAccount ? ' (test account)' : ''}`,
    });
    await audit(user.id, mode, 'success', { theme, credit_cost: 1 });

    return new Response(
      JSON.stringify({ generatedImageUrl, creditsRemaining: newCredits }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error(`[${correlationId}] Error:`, error instanceof Error ? error.message : 'Unknown');
    return new Response(JSON.stringify(createErrorResponse(ErrorCodes.SERVICE_ERROR, correlationId)),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
