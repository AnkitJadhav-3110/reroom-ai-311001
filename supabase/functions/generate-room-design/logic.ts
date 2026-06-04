// Pure, side-effect-free helpers extracted from index.ts so they can be
// unit-tested without booting Deno.serve or stubbing fetch. Index.ts imports
// from here; tests import from here too.

export interface ProductionGuardInput {
  origin: string | null;
  referer: string | null;
  /** Optional override: when set to "production" the guard is forced on. */
  envFlag: string | null;
}

// List of hostnames considered "production" (published) deployments.
// Preview/dev hosts are NOT included, so the demo test account remains usable
// during development while being blocked on the live site.
const PRODUCTION_HOSTS = new Set<string>([
  "reroom-ai-311001.lovable.app",
]);

export function isProductionRequest(input: ProductionGuardInput): boolean {
  if ((input.envFlag ?? "").toLowerCase() === "production") return true;
  const candidates = [input.origin, input.referer].filter(Boolean) as string[];
  for (const c of candidates) {
    try {
      const host = new URL(c).hostname;
      if (PRODUCTION_HOSTS.has(host)) return true;
    } catch { /* ignore bad URL */ }
  }
  return false;
}

export function buildDesignPrompt(opts: { customPrompt?: string; theme?: string }): string {
  if (opts.customPrompt) return opts.customPrompt;
  return `Redesign this room interior in ${opts.theme} style. Transform the space while maintaining the room's structure and layout. Apply ${opts.theme} design elements, colors, furniture, and decor. Make it look professional and realistic.`;
}

// Reserved for future use; today every request deducts 1 credit (no bypass).
export function shouldBypassCreditDeduction(_email: string | null | undefined): boolean {
  return false;
}
