// Persistent, cross-instance rate limiter backed by public.rate_limits
// via the SECURITY DEFINER RPC `check_and_increment_rate_limit`.
// The prior in-memory Map did not survive isolate boundaries or cold
// starts and therefore did not enforce limits.
//
// Requires service-role credentials in the environment (already available
// to every edge function).

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
    if (error || !data) {
      // Fail-closed: never let a backend outage remove the throttle.
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
