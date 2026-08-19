#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# start-dev.sh  —  Start DEVELOPMENT environment
# ═══════════════════════════════════════════════════════════════════════════════
# Starts:
#   • PocketBase on port 8090  (uses ./pb_data_dev/ — isolated dev database)
#   • Vite dev server in development mode (loads .env.development)
# ─────────────────────────────────────────────────────────────────────────────
# Usage:  chmod +x scripts/start-dev.sh && ./scripts/start-dev.sh
# ═══════════════════════════════════════════════════════════════════════════════

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║    IGK  ·  DEVELOPMENT  ENVIRONMENT  ║"
echo "╚══════════════════════════════════════╝"
echo "  PocketBase : http://127.0.0.1:8090"
echo "  App        : http://localhost:5173"
echo "  Database   : ./pb_data_dev  (dev-only)"
echo ""

# Start PocketBase with the dev-specific data directory in background
if command -v pocketbase &>/dev/null; then
  echo "▶ Starting PocketBase (dev)..."
  pocketbase serve \
    --dir "$PROJECT_ROOT/pb_data_dev" \
    --http "127.0.0.1:8090" &
  PB_PID=$!
  echo "  PocketBase PID: $PB_PID"
else
  echo "⚠  pocketbase binary not found in PATH."
  echo "   Download from https://pocketbase.io/docs/ and place next to this project."
  echo "   Continuing without PocketBase..."
fi

# Start Vite dev server in development mode
echo ""
echo "▶ Starting Vite (development mode)..."
cd "$PROJECT_ROOT/codebase"
npx vite --mode development

# Cleanup PocketBase on exit
if [[ -n "$PB_PID" ]]; then
  kill "$PB_PID" 2>/dev/null || true
fi
