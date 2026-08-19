#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# pb-reset-superuser.sh — Reset the PocketBase superuser password on a server
# ─────────────────────────────────────────────────────────────────────────────
# The PocketBase superuser (who can access /_) had its password set via
# setRandomPassword() in the migration — so it is currently unknown.
# Run this script to set a known password, then log in and change it again.
#
# Usage:
#   chmod +x scripts/pb-reset-superuser.sh
#   ./scripts/pb-reset-superuser.sh production
#   ./scripts/pb-reset-superuser.sh staging
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

ENV="${1:-production}"

if [[ "$ENV" == "production" ]]; then
  PB_DIR="/opt/pocketbase-production"
  PB_DATA="${PB_DIR}/pb_data"
  SVC="pocketbase-production"
elif [[ "$ENV" == "staging" ]]; then
  PB_DIR="/opt/pocketbase-staging"
  PB_DATA="${PB_DIR}/pb_data"
  SVC="pocketbase-staging"
else
  echo "Usage: $0 [production|staging]"
  exit 1
fi

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║     PocketBase Superuser — Password Reset        ║"
echo "╚══════════════════════════════════════════════════╝"
echo "  Environment : $ENV"
echo "  PocketBase  : $PB_DIR"
echo ""
echo "  This sets a new password for the PocketBase superuser"
echo "  (the account that accesses the /_ admin panel)."
echo "  It does NOT affect LMS user accounts."
echo ""

read -r -p "  Server IP or hostname: " SERVER
read -r -p "  New superuser email  : " SU_EMAIL
read -r -s -p "  New superuser password (hidden): " SU_PASS
echo ""

# Validate password length
if [[ ${#SU_PASS} -lt 10 ]]; then
  echo "  ✗ Password must be at least 10 characters."
  exit 1
fi

echo ""
echo "  Connecting to ${SERVER}..."
echo ""

ssh deploy@"${SERVER}" bash -s <<REMOTE
  set -euo pipefail

  echo "  Stopping ${SVC}..."
  sudo systemctl stop ${SVC}

  echo "  Running superuser upsert..."
  ${PB_DIR}/pocketbase superuser upsert "${SU_EMAIL}" "${SU_PASS}" \
    --dir "${PB_DATA}"

  echo "  Starting ${SVC}..."
  sudo systemctl start ${SVC}

  echo "  Done."
REMOTE

echo ""
echo "  ✔ Superuser password updated."
echo "  Access the admin panel via SSH tunnel:"
echo "    ./scripts/pb-admin-access.sh ${ENV}"
echo "  Then log in with: ${SU_EMAIL}"
echo ""
