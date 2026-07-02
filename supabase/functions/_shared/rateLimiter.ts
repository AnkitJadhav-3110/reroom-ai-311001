// Persistent, cross-instance rate limiter backed by the public.rate_limits
// table via the SECURITY DEFINER RPC `check_and_increment_rate_limit`.
// The in-memory Map implementation is intentionally removed: it did not work
// across Deno isolates or cold starts.
//
// Callers must pass a Supabase client authenticated with the service role
// (edge functions already use SUPABASE_SERVICE_ROLE_KEY).

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

let _client: SupabaseClient | null = null;
function admin(): SupabaseClient {
  if (_client) return _client;
  _client = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  return _client;
}

export async function checkRateLimit(
  userId: string,
  endpoint: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const bucketKey = `${endpoint}:${userId}`;
  const windowSeconds = Math.max(1, Math.floor(config.windowMs / 1000));

  try {
    const { data, error } = await admin().rpc('check_and_increment_rate_limit', {
      p_bucket_key: bucketKey,
      p_window_seconds: windowSeconds,
      p_max_requests: config.maxRequests,
    });
    if (error || !data || (Array.isArray(data) && data.length === 0)) {
      // Fail-closed on backend error to prevent flooding.
      return { allowed: false, remaining: 0, resetTime: Date.now() + config.windowMs };
    }
    const row = Array.isArray(data) ? data[0] : data;
    return {
      allowed: !!row.allowed,
      remaining: Number(row.remaining ?? 0),
      resetTime: new Date(row.reset_at).getTime(),
    };
  } catch (_) {
    return { allowed: false, remaining: 0, resetTime: Date.now() + config.windowMs };
  }
}
