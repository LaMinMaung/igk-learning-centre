#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# build-staging.sh  —  Build for STAGING / TESTING environment
# ═══════════════════════════════════════════════════════════════════════════════
# Reads:   codebase/.env.staging
# Outputs: codebase/dist/  (deploy this folder to tst.app.com)
# ─────────────────────────────────────────────────────────────────────────────
# Usage:  chmod +x scripts/build-staging.sh && ./scripts/build-staging.sh
# ═══════════════════════════════════════════════════════════════════════════════

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   IGK  ·  STAGING / TEST  BUILD      ║"
echo "╚══════════════════════════════════════╝"
echo "  Config : codebase/.env.staging"
echo "  Output : codebase/dist/"
echo "  Deploy : https://tst.app.com"
echo ""

cd "$PROJECT_ROOT/codebase"

# Validate that .env.staging exists
if [[ ! -f ".env.staging" ]]; then
  echo "✗ ERROR: codebase/.env.staging not found."
  echo "  Copy .env.example → .env.staging and fill in your staging values."
  exit 1
fi

echo "▶ Building with --mode staging..."
npx vite build --mode staging

echo ""
echo "✔ Staging build complete → codebase/dist/"
echo "  Upload the dist/ folder to your tst.app.com web server."
echo ""
