import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { encode as encodeBase64 } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { checkRateLimit } from '../_shared/rateLimiter.ts';
import { ErrorCodes, createErrorResponse } from '../_shared/errorCodes.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const UNLIMITED_EMAIL = 'test@test.com';

serve(async (req) => {
  const correlationId = crypto.randomUUID();

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify(createErrorResponse(ErrorCodes.AUTH_MISSING, correlationId)),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify(createErrorResponse(ErrorCodes.AUTH_INVALID, correlationId)),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isUnlimitedUser = user.email === UNLIMITED_EMAIL;

    // Skip rate limiting for unlimited test user
    if (!isUnlimitedUser) {
      const rateLimit = checkRateLimit(user.id, 'generate-room-design', {
        maxRequests: 10,
        windowMs: 60 * 60 * 1000
      });
      if (!rateLimit.allowed) {
        return new Response(
          JSON.stringify(createErrorResponse(ErrorCodes.RATE_LIMIT_EXCEEDED, correlationId)),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const requestBody = await req.json();
    const inputSchema = z.object({
      imageUrl: z.string().url().max(2048),
      theme: z.enum(['modern', 'luxury', 'minimalist', 'contemporary', 'rustic', 'industrial']).optional(),
      customPrompt: z.string().max(500).regex(/^[a-zA-Z0-9\s.,!?'-]+$/).optional()
    });
    const validationResult = inputSchema.safeParse(requestBody);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify(createErrorResponse(ErrorCodes.VALIDATION_FAILED, correlationId)),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { imageUrl, theme, customPrompt } = validationResult.data;
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify(createErrorResponse(ErrorCodes.CONFIG_ERROR, correlationId)),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Deduct credit unless unlimited test user
    let newCredits = 999999;
    if (!isUnlimitedUser) {
      const { data: deducted, error: deductError } = await supabaseAdmin
        .rpc('deduct_credit', { p_user_id: user.id });
      if (deductError) {
        return new Response(
          JSON.stringify(createErrorResponse(ErrorCodes.SERVICE_ERROR, correlationId)),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (deducted === -1) {
        return new Response(
          JSON.stringify(createErrorResponse(ErrorCodes.INSUFFICIENT_CREDITS, correlationId)),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      newCredits = deducted;
    }

    const designPrompt = customPrompt || `Redesign this room interior in ${theme} style. Transform the space while maintaining the room's structure and layout. Apply ${theme} design elements, colors, furniture, and decor. Make it look professional and realistic.`;

    // Fetch the source image and convert to base64 for Gemini inline_data
    const imgResp = await fetch(imageUrl);
    if (!imgResp.ok) {
      if (!isUnlimitedUser) await supabaseAdmin.rpc('refund_credit', { p_user_id: user.id });
      return new Response(
        JSON.stringify(createErrorResponse(ErrorCodes.GENERATION_FAILED, correlationId)),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const imgBytes = new Uint8Array(await imgResp.arrayBuffer());
    const imgBase64 = encodeBase64(imgBytes);
    const mimeType = imgResp.headers.get('content-type')?.split(';')[0] || 'image/jpeg';

    console.log(`[${correlationId}] Calling Gemini for user ${user.id}${isUnlimitedUser ? ' (unlimited)' : ''}`);

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: designPrompt },
            { inline_data: { mime_type: mimeType, data: imgBase64 } }
          ]
        }],
        generationConfig: { responseModalities: ["IMAGE", "TEXT"] }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[${correlationId}] Gemini error: ${response.status} ${errText}`);
      if (!isUnlimitedUser) await supabaseAdmin.rpc('refund_credit', { p_user_id: user.id });
      return new Response(
        JSON.stringify(createErrorResponse(ErrorCodes.GENERATION_FAILED, correlationId)),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p: any) => p.inline_data || p.inlineData);
    const inline = imagePart?.inline_data || imagePart?.inlineData;
    const b64 = inline?.data;
    const outMime = inline?.mime_type || inline?.mimeType || 'image/png';

    if (!b64) {
      if (!isUnlimitedUser) await supabaseAdmin.rpc('refund_credit', { p_user_id: user.id });
      console.error(`[${correlationId}] No image in Gemini response`);
      return new Response(
        JSON.stringify(createErrorResponse(ErrorCodes.GENERATION_FAILED, correlationId)),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const generatedImageUrl = `data:${outMime};base64,${b64}`;

    if (!isUnlimitedUser) {
      await supabaseAdmin.from('credit_transactions').insert({
        user_id: user.id,
        amount: -1,
        transaction_type: 'design_generation',
        description: `Generated ${theme || 'custom'} design`
      });
    }

    return new Response(
      JSON.stringify({ generatedImageUrl, creditsRemaining: newCredits }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error(`[${correlationId}] Error:`, error instanceof Error ? error.message : 'Unknown');
    return new Response(
      JSON.stringify(createErrorResponse(ErrorCodes.SERVICE_ERROR, correlationId)),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
