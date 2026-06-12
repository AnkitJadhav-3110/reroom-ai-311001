// End-to-end test for the deployed generate-room-design edge function.
//
// What this verifies against a REAL deployed function:
//   1. Theme-mode generation deducts exactly 1 credit and returns an image.
//   2. Prompt-mode generation deducts exactly 1 credit and returns an image.
//   3. A failing generation (unreachable imageUrl) refunds the credit so the
//      user's balance is unchanged.
//   4. Rate limiting blocks non-test users after maxRequests in the window.
//
// Required env (loaded from project .env automatically):
//   VITE_SUPABASE_URL
//   VITE_SUPABASE_PUBLISHABLE_KEY
//   E2E_USER_EMAIL          - a regular (non-test) account with >= 5 credits
//   E2E_USER_PASSWORD
//   E2E_SAMPLE_IMAGE_URL    - a small publicly reachable room photo (jpg/png/webp)
//
// Run:
//   deno test --allow-net --allow-env --allow-read \
//     supabase/functions/generate-room-design/e2e.test.ts
//
// Skipped automatically when the required env vars are missing (e.g. in CI).

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL");
const SUPABASE_ANON = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY");
const EMAIL = Deno.env.get("E2E_USER_EMAIL");
const PASSWORD = Deno.env.get("E2E_USER_PASSWORD");
const IMAGE_URL = Deno.env.get("E2E_SAMPLE_IMAGE_URL");

const ready = !!(SUPABASE_URL && SUPABASE_ANON && EMAIL && PASSWORD && IMAGE_URL);
const ignore = !ready;
if (!ready) {
  console.warn(
    "[e2e] Skipping: set E2E_USER_EMAIL / E2E_USER_PASSWORD / E2E_SAMPLE_IMAGE_URL in .env to run.",
  );
}

async function signedInClient() {
  const c = createClient(SUPABASE_URL!, SUPABASE_ANON!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await c.auth.signInWithPassword({ email: EMAIL!, password: PASSWORD! });
  if (error) throw error;
  return c;
}

async function getCredits(c: ReturnType<typeof createClient>, userId: string) {
  const { data, error } = await c.from("profiles").select("credits").eq("id", userId).single();
  if (error) throw error;
  return data!.credits as number;
}

async function invoke(c: ReturnType<typeof createClient>, body: unknown) {
  return await c.functions.invoke("generate-room-design", { body });
}

Deno.test({
  name: "e2e: theme generation deducts exactly 1 credit and returns an image",
  ignore,
  fn: async () => {
    const c = await signedInClient();
    const { data: { user } } = await c.auth.getUser();
    const before = await getCredits(c, user!.id);

    const { data, error } = await invoke(c, { imageUrl: IMAGE_URL, theme: "modern" });
    assertEquals(error, null, `unexpected error: ${error?.message}`);
    assert((data as any)?.generatedImageUrl?.startsWith("data:image/"));

    const after = await getCredits(c, user!.id);
    assertEquals(after, before - 1, "exactly 1 credit should be deducted");
  },
});

Deno.test({
  name: "e2e: prompt generation deducts exactly 1 credit and returns an image",
  ignore,
  fn: async () => {
    const c = await signedInClient();
    const { data: { user } } = await c.auth.getUser();
    const before = await getCredits(c, user!.id);

    const { data, error } = await invoke(c, {
      imageUrl: IMAGE_URL,
      customPrompt: "Warm minimalist living room with oak floors and linen sofa",
    });
    assertEquals(error, null, `unexpected error: ${error?.message}`);
    assert((data as any)?.generatedImageUrl?.startsWith("data:image/"));

    const after = await getCredits(c, user!.id);
    assertEquals(after, before - 1, "exactly 1 credit should be deducted");
  },
});

Deno.test({
  name: "e2e: failure refunds the deducted credit (balance unchanged)",
  ignore,
  fn: async () => {
    const c = await signedInClient();
    const { data: { user } } = await c.auth.getUser();
    const before = await getCredits(c, user!.id);

    // Unreachable URL → edge function fails image fetch and calls refund_credit.
    const { error } = await invoke(c, {
      imageUrl: "https://invalid.example.invalid/missing.jpg",
      theme: "modern",
    });
    assert(error, "expected the function to return an error");

    const after = await getCredits(c, user!.id);
    assertEquals(after, before, "credit must be refunded on failure");
  },
});

Deno.test({
  name: "e2e: rate limiting blocks non-test users after 10 requests/hour",
  ignore,
  fn: async () => {
    const c = await signedInClient();
    let got429 = false;
    // Cheap calls: use a deliberately-bad imageUrl so we don't burn Gemini quota,
    // but each call still goes through the rate-limit gate first.
    for (let i = 0; i < 12; i++) {
      const { error } = await invoke(c, {
        imageUrl: "https://invalid.example.invalid/x.jpg",
        theme: "modern",
      });
      if (error && /429|rate/i.test(error.message)) { got429 = true; break; }
    }
    assert(got429, "expected at least one rate-limited (429) response within 12 calls");
  },
});
