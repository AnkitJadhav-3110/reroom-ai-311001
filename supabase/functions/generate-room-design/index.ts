import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { checkRateLimit } from '../_shared/rateLimiter.ts';
import { ErrorCodes, createErrorResponse } from '../_shared/errorCodes.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const correlationId = crypto.randomUUID();
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract JWT token to verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify(createErrorResponse(ErrorCodes.AUTH_MISSING, correlationId)),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for server-side operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify the JWT and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error(`[${correlationId}] Auth failed`);
      return new Response(
        JSON.stringify(createErrorResponse(ErrorCodes.AUTH_INVALID, correlationId)),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[${correlationId}] Processing generation for user ${user.id}`);

    // Rate limiting: 10 generations per hour
    const rateLimit = checkRateLimit(user.id, 'generate-room-design', {
      maxRequests: 10,
      windowMs: 60 * 60 * 1000
    });

    if (!rateLimit.allowed) {
      console.warn(`[${correlationId}] Rate limit exceeded for user ${user.id}`);
      return new Response(
        JSON.stringify(createErrorResponse(ErrorCodes.RATE_LIMIT_EXCEEDED, correlationId)),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString()
          } 
        }
      );
    }

    const requestBody = await req.json();
    
    // Validate input with zod
    const inputSchema = z.object({
      imageUrl: z.string().url().max(2048),
      theme: z.enum(['modern', 'luxury', 'minimalist', 'contemporary', 'rustic', 'industrial']).optional(),
      customPrompt: z.string().max(500).regex(/^[a-zA-Z0-9\s.,!?'-]+$/).optional()
    });

    const validationResult = inputSchema.safeParse(requestBody);
    
    if (!validationResult.success) {
      console.error(`[${correlationId}] Validation failed`);
      return new Response(
        JSON.stringify(createErrorResponse(ErrorCodes.VALIDATION_FAILED, correlationId)),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { imageUrl, theme, customPrompt } = validationResult.data;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      console.error(`[${correlationId}] API key not configured`);
      return new Response(
        JSON.stringify(createErrorResponse(ErrorCodes.CONFIG_ERROR, correlationId)),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Atomically deduct credit (prevents race conditions)
    const { data: newCredits, error: deductError } = await supabaseAdmin
      .rpc('deduct_credit', { p_user_id: user.id });

    if (deductError) {
      console.error(`[${correlationId}] Credit deduction failed`);
      return new Response(
        JSON.stringify(createErrorResponse(ErrorCodes.SERVICE_ERROR, correlationId)),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (newCredits === -1) {
      return new Response(
        JSON.stringify(createErrorResponse(ErrorCodes.INSUFFICIENT_CREDITS, correlationId)),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[${correlationId}] Credit deducted, remaining: ${newCredits}`);

    // Create the prompt based on theme or custom prompt
    const designPrompt = customPrompt || `Redesign this room interior in ${theme} style. Transform the space while maintaining the room's structure and layout. Apply ${theme} design elements, colors, furniture, and decor. Make it look professional and realistic.`;

    console.log(`[${correlationId}] Generating design`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: designPrompt
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        modalities: ["image", "text"]
      })
    });

    if (!response.ok) {
      console.error(`[${correlationId}] AI gateway error: ${response.status}`);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify(createErrorResponse(ErrorCodes.RATE_LIMIT_EXCEEDED, correlationId)),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.', code: 'SVC_003', correlationId }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify(createErrorResponse(ErrorCodes.GENERATION_FAILED, correlationId)),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const generatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      // Refund the credit if image generation failed
      await supabaseAdmin.rpc('refund_credit', { p_user_id: user.id });
      
      console.error(`[${correlationId}] No image generated`);
      return new Response(
        JSON.stringify(createErrorResponse(ErrorCodes.GENERATION_FAILED, correlationId)),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Record the transaction
    await supabaseAdmin
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        amount: -1,
        transaction_type: 'design_generation',
        description: `Generated ${theme || 'custom'} design`
      });

    console.log(`[${correlationId}] Generation successful`);

    return new Response(
      JSON.stringify({ 
        generatedImageUrl,
        creditsRemaining: newCredits
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': rateLimit.remaining.toString()
        } 
      }
    );
  } catch (error) {
    console.error(`[${correlationId}] Error:`, error instanceof Error ? error.message : 'Unknown');
    return new Response(
      JSON.stringify(createErrorResponse(ErrorCodes.SERVICE_ERROR, correlationId)),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
