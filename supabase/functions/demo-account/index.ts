// Demo account status + admin-only reseed.
// GET  → { exists, email, credits, user_id }  (admin only)
// POST → same payload after topping credits back to target (admin only)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const DEMO_EMAIL = 'demo@reroom.ai';
const TARGET_CREDITS = 99999;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const authHeader = req.headers.get('Authorization') ?? '';
  const jwt = authHeader.replace(/^Bearer\s+/i, '');
  if (!jwt) {
    return json({ error: 'Missing bearer token' }, 401);
  }

  const admin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  // Verify caller
  const { data: userData, error: userErr } = await admin.auth.getUser(jwt);
  if (userErr || !userData.user) {
    return json({ error: 'Invalid session' }, 401);
  }
  const callerId = userData.user.id;

  // Admin gate
  const { data: roleRow } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', callerId)
    .eq('role', 'admin')
    .maybeSingle();
  if (!roleRow) {
    return json({ error: 'Admin role required' }, 403);
  }

  // Locate demo user by email
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listErr) return json({ error: listErr.message }, 500);

  const demo = list.users.find((u) => (u.email ?? '').toLowerCase() === DEMO_EMAIL);
  if (!demo) {
    return json({
      exists: false,
      email: DEMO_EMAIL,
      credits: null,
      user_id: null,
      message: 'Demo account not signed up yet',
    }, 200);
  }

  if (req.method === 'POST') {
    const { error: upErr } = await admin
      .from('profiles')
      .update({
        credits: TARGET_CREDITS,
        subscription_tier: 'pro',
        subscription_status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', demo.id);
    if (upErr) return json({ error: upErr.message }, 500);
  }

  const { data: profile } = await admin
    .from('profiles')
    .select('credits, subscription_tier, subscription_status')
    .eq('id', demo.id)
    .maybeSingle();

  return json({
    exists: true,
    email: DEMO_EMAIL,
    user_id: demo.id,
    credits: profile?.credits ?? null,
    subscription_tier: profile?.subscription_tier ?? null,
    subscription_status: profile?.subscription_status ?? null,
    target_credits: TARGET_CREDITS,
    reseeded: req.method === 'POST',
  }, 200);
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
