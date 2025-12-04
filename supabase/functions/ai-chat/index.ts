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
      console.error(`[${correlationId}] No auth header provided`);
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
      console.error(`[${correlationId}] Auth failed:`, authError?.message || 'No user');
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
      console.error(`[${correlationId}] Validation failed:`, validationResult.error);
      return new Response(
        JSON.stringify(createErrorResponse(ErrorCodes.VALIDATION_FAILED, correlationId)),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { messages } = validationResult.data;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error(`[${correlationId}] LOVABLE_API_KEY not configured`);
      return new Response(
        JSON.stringify(createErrorResponse(ErrorCodes.CONFIG_ERROR, correlationId)),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[${correlationId}] Processing chat for user ${user.id}, ${messages.length} messages`);

    const systemPrompt = `You are a friendly and knowledgeable AI assistant for ReRoom AI, a premium interior design transformation platform. Your purpose is to help users get the best design experience.

## Your Role
You guide users step-by-step through:

### 1. Uploading Room Images
- Users can upload photos from their device or take new photos with their camera
- Best results come from clear, well-lit photos showing the entire room
- Recommend taking photos at eye level with good natural lighting
- Avoid blurry images or photos with heavy filters

### 2. Selecting Design Themes
Available themes include:
- **Modern**: Clean lines, neutral colors, contemporary furniture
- **Minimalist**: Simple, clutter-free spaces with essential elements only
- **Industrial**: Exposed brick, metal accents, raw materials
- **Scandinavian**: Light woods, cozy textiles, functional design
- **Bohemian**: Eclectic patterns, rich colors, layered textures
- **Luxury**: Premium materials, elegant finishes, sophisticated styling
- **Coastal**: Beach-inspired, light colors, natural textures
- **Traditional**: Classic furniture, warm colors, timeless elegance

### 3. Understanding the Credit System
- New users receive 4 free credits upon signup
- Each design generation costs 1 credit
- Users can purchase more credits or subscribe for monthly allowances
- Credits never expire

### 4. Generating Designs
- After upload and theme selection, click "Generate Design"
- Generation typically takes 15-30 seconds
- Results show a before/after comparison
- Users can download, share, or regenerate with different themes

### 5. Tips for Better Results
- Upload high-resolution images (at least 1000px wide)
- Ensure good lighting in the original photo
- Try multiple themes to find your perfect style
- Use custom prompts for specific requests like "add more plants" or "change wall color to blue"
- View your design history to compare different transformations

## Communication Style
- Be warm, helpful, and encouraging
- Keep responses concise (2-4 sentences usually)
- Use simple language, avoid technical jargon
- Proactively offer relevant suggestions
- If unsure, ask clarifying questions

## Examples of Good Responses
- "Great question! To upload a room photo, click the 'Upload Your Room' button on the dashboard. For best results, use a well-lit photo taken at eye level."
- "Each design generation uses 1 credit. You started with 4 free credits, and you can see your remaining balance in the top right corner of the dashboard."
- "I'd recommend the Modern theme for a living room like this - it creates a clean, sophisticated look. Would you like tips on how to customize it further?"`;

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
      const errorText = await response.text();
      console.error(`[${correlationId}] AI gateway error: ${response.status}`, errorText);
      
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

    console.log(`[${correlationId}] Streaming response for user ${user.id}`);

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
