#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# setup-pb-staging.sh  —  Apply migrations to STAGING PocketBase
# ═══════════════════════════════════════════════════════════════════════════════
# Runs all pb_migrations/ against the staging PocketBase instance.
# Staging uses its own data directory and is NOT connected to production.
# ─────────────────────────────────────────────────────────────────────────────
# Usage:  chmod +x scripts/setup-pb-staging.sh && ./scripts/setup-pb-staging.sh
# ═══════════════════════════════════════════════════════════════════════════════

set -e

echo ""
echo "╔══════════════════════════════════════╗"
echo "║  IGK  ·  STAGING POCKETBASE SETUP    ║"
echo "╚══════════════════════════════════════╝"
echo "  Data dir : ./pb_data_staging  (isolated)"
echo "  Port     : 8091"
echo ""

if ! command -v pocketbase &>/dev/null; then
  echo "✗ pocketbase binary not found. Download from https://pocketbase.io/docs/"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "▶ Running migrations on staging database..."
pocketbase migrate up \
  --dir "$PROJECT_ROOT/pb_data_staging" \
  --migrationsDir "$PROJECT_ROOT/pb_migrations"

echo ""
echo "✔ Staging PocketBase migrations applied."
echo "  Start staging PocketBase with:"
echo "    pocketbase serve --dir ./pb_data_staging --http 0.0.0.0:8091"
echo ""
