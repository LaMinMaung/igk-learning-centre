#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# validate-env.sh — Pre-deployment environment validator
# Checks that all required VITE_* variables are defined for the target mode.
# ─────────────────────────────────────────────────────────────────────────────
# Usage:
#   ./scripts/validate-env.sh development
#   ./scripts/validate-env.sh staging
#   ./scripts/validate-env.sh production
# ═══════════════════════════════════════════════════════════════════════════════

set -e

MODE="${1:-development}"
ENV_FILE="codebase/.env.${MODE}"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║       IGK — Environment Validator        ║"
echo "╚══════════════════════════════════════════╝"
echo "  Mode     : $MODE"
echo "  Env file : $ENV_FILE"
echo ""

# ─── Check env file exists ───────────────────────────────────────────────────
if [[ ! -f "$ENV_FILE" ]]; then
  echo "✗ FAIL: $ENV_FILE not found."
  echo "  Create it from .env.example: cp codebase/.env.example $ENV_FILE"
  exit 1
fi
echo "  ✔ $ENV_FILE found"

# ─── Required variables ──────────────────────────────────────────────────────
REQUIRED=(
  VITE_APP_ENV
  VITE_APP_URL
  VITE_APP_DOMAIN
  VITE_POCKETBASE_URL
  VITE_LOG_LEVEL
  VITE_APP_NAME
)

PROD_REQUIRED=(
  VITE_ERROR_TRACKING
)

if [[ "$MODE" == "production" ]]; then
  REQUIRED+=("${PROD_REQUIRED[@]}")
fi

FAILED=0
for var in "${REQUIRED[@]}"; do
  val=$(grep "^${var}=" "$ENV_FILE" | cut -d'=' -f2-)
  if [[ -z "$val" ]]; then
    echo "  ✗ MISSING: $var"
    FAILED=1
  else
    echo "  ✔ $var = $val"
  fi
done

# ─── Sandbox safety check (production must have FF_SANDBOX_ROUTES=false) ─────
if [[ "$MODE" == "production" ]]; then
  sandbox=$(grep "^VITE_FF_SANDBOX_ROUTES=" "$ENV_FILE" | cut -d'=' -f2-)
  if [[ "$sandbox" == "true" ]]; then
    echo "  ✗ SECURITY: VITE_FF_SANDBOX_ROUTES must be 'false' in production!"
    FAILED=1
  else
    echo "  ✔ Sandbox routes disabled for production"
  fi
fi

# ─── PocketBase URL must not be localhost in staging/production ───────────────
if [[ "$MODE" != "development" ]]; then
  pburl=$(grep "^VITE_POCKETBASE_URL=" "$ENV_FILE" | cut -d'=' -f2-)
  if [[ "$pburl" == *"localhost"* || "$pburl" == *"127.0.0.1"* ]]; then
    echo "  ✗ DANGER: VITE_POCKETBASE_URL points to localhost in $MODE!"
    echo "    This would hit your local dev database from $MODE."
    FAILED=1
  else
    echo "  ✔ PocketBase URL is not localhost"
  fi
fi

# ─── Result ──────────────────────────────────────────────────────────────────
echo ""
if [[ $FAILED -eq 1 ]]; then
  echo "✗ Validation FAILED. Fix the issues above before deploying."
  exit 1
else
  echo "✔ All checks passed for mode: $MODE"
fi
echo ""
