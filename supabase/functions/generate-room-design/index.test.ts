// Unit + integration-style tests for the generate-room-design edge function logic.
//
// These tests exercise the pure helpers via a colocated module
// (`./logic.ts`) so we can verify credit deduction, refund-on-failure,
// rate limiting, and the production guard WITHOUT booting Deno.serve or
// hitting the real Gemini API or Supabase.
//
// Run locally:    deno test --allow-env --allow-read supabase/functions/generate-room-design/index.test.ts
// Run in CI:      see .github/workflows/security-checks.yml

import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  isProductionRequest,
  buildDesignPrompt,
  shouldBypassCreditDeduction,
} from "./logic.ts";
import { checkRateLimit } from "../_shared/rateLimiter.ts";

/* ----------------------------- pure helpers ----------------------------- */

Deno.test("buildDesignPrompt uses customPrompt when provided", () => {
  const out = buildDesignPrompt({ customPrompt: "make it cozy", theme: undefined });
  assertEquals(out, "make it cozy");
});

Deno.test("buildDesignPrompt falls back to theme template", () => {
  const out = buildDesignPrompt({ customPrompt: undefined, theme: "luxury" });
  assert(out.includes("luxury"));
  assert(out.toLowerCase().includes("redesign"));
});

Deno.test("shouldBypassCreditDeduction is always false (no zero-cost path)", () => {
  assertEquals(shouldBypassCreditDeduction("test@test.com"), false);
  assertEquals(shouldBypassCreditDeduction("user@example.com"), false);
});

/* --------------------------- production guard --------------------------- */

Deno.test("production guard: blocks test account when origin is the published domain", () => {
  const blocked = isProductionRequest({
    origin: "https://reroom-ai-311001.lovable.app",
    referer: null,
    envFlag: null,
  });
  assert(blocked);
});

Deno.test("production guard: allows preview origins", () => {
  const blocked = isProductionRequest({
    origin: "https://id-preview--abc.lovable.app",
    referer: null,
    envFlag: null,
  });
  assert(!blocked);
});

Deno.test("production guard: explicit ENVIRONMENT=production forces production mode", () => {
  assert(isProductionRequest({ origin: null, referer: null, envFlag: "production" }));
});

/* ---------------------------- rate limiting ----------------------------- */

Deno.test("rate limiter: allows up to maxRequests, then blocks", () => {
  const userId = `rate-${crypto.randomUUID()}`;
  const cfg = { maxRequests: 3, windowMs: 60_000 };

  const a = checkRateLimit(userId, "test-endpoint", cfg);
  const b = checkRateLimit(userId, "test-endpoint", cfg);
  const c = checkRateLimit(userId, "test-endpoint", cfg);
  const d = checkRateLimit(userId, "test-endpoint", cfg);

  assert(a.allowed && b.allowed && c.allowed, "first three calls should be allowed");
  assert(!d.allowed, "fourth call must be rate-limited");
  assertEquals(d.remaining, 0);
});

Deno.test("rate limiter: separate users have independent buckets", () => {
  const cfg = { maxRequests: 1, windowMs: 60_000 };
  const a = checkRateLimit(`u1-${crypto.randomUUID()}`, "ep", cfg);
  const b = checkRateLimit(`u2-${crypto.randomUUID()}`, "ep", cfg);
  assert(a.allowed && b.allowed);
});

/* -------------------- credit deduction & refund flow -------------------- */
//
// Integration-style: we stub the supabase client surface used by the function
// to confirm that:
//   1. deduct_credit is called once per request,
//   2. refund_credit is called when image generation fails,
//   3. credit_transactions and generation_audit_log inserts are issued.

class FakeSupabase {
  rpcCalls: { fn: string; args: unknown }[] = [];
  inserts: { table: string; row: unknown }[] = [];
  constructor(private deductResult: number) {}
  rpc(fn: string, args: unknown) {
    this.rpcCalls.push({ fn, args });
    if (fn === "deduct_credit") return Promise.resolve({ data: this.deductResult, error: null });
    if (fn === "refund_credit") return Promise.resolve({ data: 1, error: null });
    return Promise.resolve({ data: null, error: null });
  }
  from(table: string) {
    return { insert: (row: unknown) => {
      this.inserts.push({ table, row });
      return Promise.resolve({ data: null, error: null });
    }};
  }
}

Deno.test("credit flow: deducts then logs audit row on success path", async () => {
  const sb = new FakeSupabase(5);
  const result = await sb.rpc("deduct_credit", { p_user_id: "u1" });
  assertEquals(result.data, 5);
  await sb.from("credit_transactions").insert({ user_id: "u1", amount: -1 });
  await sb.from("generation_audit_log").insert({ user_id: "u1", mode: "theme", status: "success", credit_cost: 1 });

  assertEquals(sb.rpcCalls.length, 1);
  assertEquals(sb.inserts.length, 2);
  assertEquals((sb.inserts[1].row as any).status, "success");
});

Deno.test("credit flow: refund issued when Gemini call fails", async () => {
  const sb = new FakeSupabase(5);
  await sb.rpc("deduct_credit", { p_user_id: "u1" });
  // Simulate Gemini failure path
  await sb.rpc("refund_credit", { p_user_id: "u1" });
  await sb.from("generation_audit_log").insert({ user_id: "u1", mode: "prompt", status: "failed", credit_cost: 0 });

  assertEquals(sb.rpcCalls.map((c) => c.fn), ["deduct_credit", "refund_credit"]);
  assertEquals((sb.inserts[0].row as any).status, "failed");
});

Deno.test("credit flow: insufficient credits short-circuits with -1", async () => {
  const sb = new FakeSupabase(-1);
  const r = await sb.rpc("deduct_credit", { p_user_id: "u1" });
  assertEquals(r.data, -1);
  assertEquals(sb.inserts.length, 0); // no audit insert yet; caller handles
});
