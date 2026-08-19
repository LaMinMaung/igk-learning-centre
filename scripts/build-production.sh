#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# build-production.sh  —  Build for PRODUCTION environment
# ═══════════════════════════════════════════════════════════════════════════════
# Reads:   codebase/.env.production
# Outputs: codebase/dist/  (deploy this folder to app.com)
# ─────────────────────────────────────────────────────────────────────────────
# Usage:  chmod +x scripts/build-production.sh && ./scripts/build-production.sh
# ═══════════════════════════════════════════════════════════════════════════════

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║      IGK  ·  PRODUCTION  BUILD       ║"
echo "╚══════════════════════════════════════╝"
echo "  Config : codebase/.env.production"
echo "  Output : codebase/dist/"
echo "  Deploy : https://app.com"
echo ""

# Safety prompt
read -r -p "  ⚠  You are building for PRODUCTION. Continue? [y/N] " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "  Aborted."
  exit 0
fi
echo ""

cd "$PROJECT_ROOT/codebase"

# Validate that .env.production exists
if [[ ! -f ".env.production" ]]; then
  echo "✗ ERROR: codebase/.env.production not found."
  echo "  Copy .env.example → .env.production and fill in your production values."
  exit 1
fi

echo "▶ Building with --mode production..."
npx vite build --mode production

echo ""
echo "✔ Production build complete → codebase/dist/"
echo "  Upload the dist/ folder to your app.com web server."
echo ""
