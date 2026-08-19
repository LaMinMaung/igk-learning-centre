#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# rollback.sh — Rollback helper (local / CI use)
# ═══════════════════════════════════════════════════════════════════════════════
# In CI/CD: download the artifact for the target SHA from GitHub Actions
#           and re-run the deploy step on that artifact.
#
# Locally: use git to revert and rebuild.
# ─────────────────────────────────────────────────────────────────────────────
# Usage:
#   ./scripts/rollback.sh <git-sha> <environment>
#   ./scripts/rollback.sh abc1234 production
# ═══════════════════════════════════════════════════════════════════════════════

set -e

SHA="${1:-HEAD~1}"
MODE="${2:-staging}"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║           IGK — Rollback Helper          ║"
echo "╚══════════════════════════════════════════╝"
echo "  Target SHA : $SHA"
echo "  Mode       : $MODE"
echo ""

read -r -p "  Roll back to $SHA on $MODE? [y/N] " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "  Aborted."
  exit 0
fi

echo ""
echo "▶ Checking out $SHA..."
git checkout "$SHA" -- .

echo "▶ Validating environment..."
bash scripts/validate-env.sh "$MODE"

echo "▶ Rebuilding for $MODE..."
cd codebase
npm ci
npx vite build --mode "$MODE"

echo ""
echo "✔ Rollback build complete → codebase/dist/"
echo "  Deploy dist/ to your $MODE server to complete rollback."
echo ""
