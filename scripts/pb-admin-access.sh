#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# pb-admin-access.sh — Open SSH tunnel to PocketBase admin panel
# ─────────────────────────────────────────────────────────────────────────────
# PocketBase's admin UI (/_) is NOT exposed publicly via nginx for security.
# This script opens a secure SSH tunnel so you can access it from your browser.
#
# Usage:
#   chmod +x scripts/pb-admin-access.sh
#   ./scripts/pb-admin-access.sh production
#   ./scripts/pb-admin-access.sh staging
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

ENV="${1:-production}"

# ─── Resolve server config ───────────────────────────────────────────────────
if [[ "$ENV" == "production" ]]; then
  echo ""
  read -r -p "  Production server IP or hostname: " SERVER
  LOCAL_PORT=9090
  REMOTE_PORT=8090
elif [[ "$ENV" == "staging" ]]; then
  echo ""
  read -r -p "  Staging server IP or hostname: " SERVER
  LOCAL_PORT=9091
  REMOTE_PORT=8091
else
  echo "Usage: $0 [production|staging]"
  exit 1
fi

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║       PocketBase Admin — Secure SSH Tunnel       ║"
echo "╚══════════════════════════════════════════════════╝"
echo "  Environment : $ENV"
echo "  Server      : $SERVER"
echo "  Tunnel      : localhost:${LOCAL_PORT} → ${SERVER}:${REMOTE_PORT}"
echo ""
echo "  Opening tunnel... (Ctrl+C to close when done)"
echo ""
echo "  ▶ Open this URL in your browser:"
echo "    http://localhost:${LOCAL_PORT}/_"
echo ""

# Attempt to open browser automatically (macOS / Linux with xdg-open)
sleep 2
if command -v open &>/dev/null; then
  open "http://localhost:${LOCAL_PORT}/_" 2>/dev/null || true
elif command -v xdg-open &>/dev/null; then
  xdg-open "http://localhost:${LOCAL_PORT}/_" 2>/dev/null || true
fi

# Open the tunnel (blocking — Ctrl+C to exit)
ssh -N -L "${LOCAL_PORT}:127.0.0.1:${REMOTE_PORT}" deploy@"${SERVER}"
