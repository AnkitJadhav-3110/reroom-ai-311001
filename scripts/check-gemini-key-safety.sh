#!/usr/bin/env bash
# Automated guard: ensures the Gemini API key is only ever read from server
# environment secrets and is never hardcoded, exposed to client code, or logged.
#
# Run locally or in CI:    bash scripts/check-gemini-key-safety.sh
# Exit code 0 = clean, 1 = violation found.

set -u
fail=0
red()   { printf "\033[31m%s\033[0m\n" "$*"; }
green() { printf "\033[32m%s\033[0m\n" "$*"; }

echo "→ 1/4  Scanning for hardcoded Gemini API key literals (AIza...)"
# Allowlist: this script itself and lockfiles. Anything else with an AIza key fails.
hits=$(grep -RInE 'AIza[0-9A-Za-z_-]{30,}' \
        --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist \
        --exclude='check-gemini-key-safety.sh' \
        --exclude='*.lock' --exclude='bun.lockb' --exclude='package-lock.json' \
        . 2>/dev/null || true)
if [ -n "$hits" ]; then
  red "  ✗ Hardcoded API key found:"; echo "$hits"; fail=1
else green "  ✓ No hardcoded keys"; fi

echo "→ 2/4  Ensuring GEMINI_API_KEY is not referenced from client code (src/)"
client_hits=$(grep -RIn 'GEMINI_API_KEY' src/ 2>/dev/null || true)
if [ -n "$client_hits" ]; then
  red "  ✗ Client code references GEMINI_API_KEY:"; echo "$client_hits"; fail=1
else green "  ✓ Client code is clean"; fi

echo "→ 3/4  Ensuring edge functions read the key only via Deno.env.get"
for f in $(grep -RIl 'GEMINI_API_KEY' supabase/functions 2>/dev/null); do
  if ! grep -qE "Deno\.env\.get\(['\"]GEMINI_API_KEY['\"]\)" "$f"; then
    red "  ✗ $f references GEMINI_API_KEY without Deno.env.get"; fail=1
  fi
done
[ $fail -eq 0 ] && green "  ✓ Edge functions read key from env only"

echo "→ 4/4  Ensuring the key is never console.log'd or returned in a response"
log_hits=$(grep -RInE 'console\.(log|error|warn|info)\([^)]*GEMINI_API_KEY' supabase/functions 2>/dev/null || true)
ret_hits=$(grep -RInE 'JSON\.stringify\([^)]*GEMINI_API_KEY' supabase/functions 2>/dev/null || true)
if [ -n "$log_hits$ret_hits" ]; then
  red "  ✗ Key may be logged or returned:"; echo "$log_hits"; echo "$ret_hits"; fail=1
else green "  ✓ Key is never logged or returned"; fi

echo
if [ $fail -eq 0 ]; then green "✅ All Gemini key safety checks passed."; exit 0
else red "❌ Gemini key safety checks FAILED."; exit 1; fi
