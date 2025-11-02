import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { checkRateLimit } from '../_shared/rateLimiter.ts';
import { ErrorCodes, createErrorResponse } from '../_shared/errorCodes.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  const correlationId = crypto.randomUUID();
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
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
      console.error(`[${correlationId}] Auth failed`);
      return new Response(
        JSON.stringify(createErrorResponse(ErrorCodes.AUTH_INVALID, correlationId)),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting: 50 chat requests per hour
    const rateLimit = checkRateLimit(user.id, 'ai-chat', {
      maxRequests: 50,
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

    // Validate input
    const messageSchema = z.object({
      messages: z.array(z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string().max(2000)
      })).max(50)
    });

    const requestBody = await req.json();
    const validationResult = messageSchema.safeParse(requestBody);
    
    if (!validationResult.success) {
      console.error(`[${correlationId}] Validation failed`);
      return new Response(
        JSON.stringify(createErrorResponse(ErrorCodes.VALIDATION_FAILED, correlationId)),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { messages } = validationResult.data;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error(`[${correlationId}] API key not configured`);
      return new Response(
        JSON.stringify(createErrorResponse(ErrorCodes.CONFIG_ERROR, correlationId)),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[${correlationId}] Processing chat for user ${user.id}, ${messages.length} messages`);

    const systemPrompt = `You are a helpful AI assistant for ReRoom AI, an interior design transformation app. Your role is to guide users through:

1. **Uploading Images**: Help users understand they can upload room photos to transform
2. **Theme Selection**: Explain the available design themes (Modern, Minimalist, Industrial, etc.)
3. **Credit System**: Clarify that each generation costs 1 credit
4. **Improving Results**: Suggest tips like:
   - Upload clear, well-lit photos
   - Choose themes that match their vision
   - Use custom prompts for specific details
   - Try different angles of the same room

Keep responses friendly, concise (2-3 sentences), and actionable. Use emojis sparingly. Focus on helping users get the best design transformations.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      console.error(`[${correlationId}] AI gateway error: ${response.status}`);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify(createErrorResponse(ErrorCodes.RATE_LIMIT_EXCEEDED, correlationId)),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please contact support.", code: 'SVC_003', correlationId }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify(createErrorResponse(ErrorCodes.SERVICE_ERROR, correlationId)),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "text/event-stream",
        'X-RateLimit-Remaining': rateLimit.remaining.toString()
      },
    });
  } catch (error) {
    console.error(`[${correlationId}] Chat error:`, error instanceof Error ? error.message : 'Unknown');
    return new Response(
      JSON.stringify(createErrorResponse(ErrorCodes.SERVICE_ERROR, correlationId)),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});