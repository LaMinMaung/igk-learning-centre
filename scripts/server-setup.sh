#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# server-setup.sh — One-time server provisioning script
# ─────────────────────────────────────────────────────────────────────────────
# Run this on a fresh Ubuntu 22.04 LTS server as root (or with sudo).
# Run ONCE on production, ONCE on staging (separate servers).
#
# Usage (as root on the server):
#   curl -fsSL https://raw.githubusercontent.com/your-org/igk/main/scripts/server-setup.sh | \
#     bash -s -- production mydomain.com
#
#   curl -fsSL ... | bash -s -- staging tst.mydomain.com
#
# Or copy the script and run:
#   chmod +x server-setup.sh
#   sudo ./server-setup.sh production mydomain.com
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

ENV="${1:-production}"           # production | staging
DOMAIN="${2:-mydomain.com}"      # your actual domain
PB_VERSION="0.28.4"
PB_PORT=$( [ "$ENV" = "production" ] && echo "8090" || echo "8091" )
WEB_ROOT="/var/www/igk-${ENV}"
PB_DIR="/opt/pocketbase-${ENV}"
DEPLOY_USER="deploy"

echo ""
echo "╔═════════════════════════════════════════════════╗"
echo "║     IGK Learning Centre — Server Setup          ║"
echo "╚═════════════════════════════════════════════════╝"
echo "  Environment : $ENV"
echo "  Domain      : $DOMAIN"
echo "  PocketBase  : port $PB_PORT"
echo "  Web root    : $WEB_ROOT"
echo ""

# ─── 1. System update ─────────────────────────────────────────────────────────
echo "▶ Updating system packages..."
apt-get update -qq && apt-get upgrade -y -qq

# ─── 2. Install packages ──────────────────────────────────────────────────────
echo "▶ Installing nginx, certbot, curl, unzip, rsync..."
apt-get install -y -qq nginx certbot python3-certbot-nginx curl unzip rsync ufw

# ─── 3. Firewall ─────────────────────────────────────────────────────────────
echo "▶ Configuring UFW firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

# ─── 4. Create deploy user ────────────────────────────────────────────────────
echo "▶ Creating deploy user..."
if ! id "$DEPLOY_USER" &>/dev/null; then
  useradd -m -s /bin/bash "$DEPLOY_USER"
fi
mkdir -p "/home/${DEPLOY_USER}/.ssh"
chmod 700 "/home/${DEPLOY_USER}/.ssh"
touch "/home/${DEPLOY_USER}/.ssh/authorized_keys"
chmod 600 "/home/${DEPLOY_USER}/.ssh/authorized_keys"
chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "/home/${DEPLOY_USER}/.ssh"

echo ""
echo "  ⚠  IMPORTANT: Add the GitHub Actions deploy public key to:"
echo "     /home/${DEPLOY_USER}/.ssh/authorized_keys"
echo "  (See DEPLOYMENT.md — Step 5 for key generation instructions)"
echo ""

# ─── 5. Create web root ──────────────────────────────────────────────────────
echo "▶ Creating web root: $WEB_ROOT"
mkdir -p "$WEB_ROOT"
chown -R "${DEPLOY_USER}:www-data" "$WEB_ROOT"
chmod -R 750 "$WEB_ROOT"
# Allow deploy user to write, nginx (www-data) to read
usermod -aG www-data "$DEPLOY_USER"

# ─── 6. Download PocketBase ──────────────────────────────────────────────────
echo "▶ Installing PocketBase v${PB_VERSION}..."
mkdir -p "$PB_DIR/pb_data"
mkdir -p "$PB_DIR/pb_migrations"

ARCH=$(dpkg --print-architecture)
if [[ "$ARCH" == "amd64" ]]; then PB_ARCH="amd64"; else PB_ARCH="arm64"; fi
PB_URL="https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_${PB_ARCH}.zip"

curl -fsSL "$PB_URL" -o /tmp/pocketbase.zip
unzip -o /tmp/pocketbase.zip pocketbase -d "$PB_DIR"
chmod +x "${PB_DIR}/pocketbase"
rm /tmp/pocketbase.zip

# Give deploy user access to pb_migrations (for rsync)
chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "$PB_DIR/pb_migrations"
chown root:root "$PB_DIR/pocketbase"   # binary owned by root
chown -R root:root "$PB_DIR/pb_data"  # data owned by root for safety
chmod 700 "$PB_DIR/pb_data"

# ─── 7. Create systemd service ───────────────────────────────────────────────
echo "▶ Creating systemd service: pocketbase-${ENV}.service"
cat > "/etc/systemd/system/pocketbase-${ENV}.service" <<EOF
[Unit]
Description=PocketBase (${ENV})
Documentation=https://pocketbase.io/docs/
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=${PB_DIR}
ExecStart=${PB_DIR}/pocketbase serve \\
    --dir ${PB_DIR}/pb_data \\
    --migrationsDir ${PB_DIR}/pb_migrations \\
    --http 127.0.0.1:${PB_PORT}
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=pocketbase-${ENV}

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable "pocketbase-${ENV}"
systemctl start  "pocketbase-${ENV}"

echo "  ✔ PocketBase service started on 127.0.0.1:${PB_PORT}"

# ─── 8. Allow deploy user to reload nginx & restart PocketBase ───────────────
echo "▶ Configuring sudoers for deploy user..."
cat > "/etc/sudoers.d/deploy-${ENV}" <<EOF
# Allow deploy user to restart PocketBase and reload nginx (no password)
${DEPLOY_USER} ALL=(ALL) NOPASSWD: /bin/systemctl restart pocketbase-${ENV}
${DEPLOY_USER} ALL=(ALL) NOPASSWD: /bin/systemctl reload nginx
EOF
chmod 440 "/etc/sudoers.d/deploy-${ENV}"

# ─── 9. Configure nginx ──────────────────────────────────────────────────────
echo "▶ Configuring nginx..."
rm -f /etc/nginx/sites-enabled/default

echo "  ⚠  Copy nginx/${ENV}.conf from the repo to /etc/nginx/sites-available/${ENV}"
echo "  ⚠  Then run: ln -s /etc/nginx/sites-available/${ENV} /etc/nginx/sites-enabled/"
echo "  ⚠  Then run: certbot --nginx -d ${DOMAIN} -d api.${DOMAIN}"

# ─── 10. Migrate PocketBase ──────────────────────────────────────────────────
echo ""
echo "▶ NOTE: Run migrations after your first deployment:"
echo "    ${PB_DIR}/pocketbase migrate up --dir ${PB_DIR}/pb_data --migrationsDir ${PB_DIR}/pb_migrations"

# ─── Done ────────────────────────────────────────────────────────────────────
echo ""
echo "╔═════════════════════════════════════════════════╗"
echo "║              Setup Complete!                    ║"
echo "╚═════════════════════════════════════════════════╝"
echo ""
echo "  Next steps:"
echo "  1. Add deploy SSH public key to /home/${DEPLOY_USER}/.ssh/authorized_keys"
echo "  2. Point DNS: A record ${DOMAIN} → $(curl -s ifconfig.me)"
echo "  3. Copy nginx/${ENV}.conf → /etc/nginx/sites-available/${ENV}"
echo "  4. ln -s /etc/nginx/sites-available/${ENV} /etc/nginx/sites-enabled/"
echo "  5. certbot --nginx -d ${DOMAIN} -d api.${DOMAIN}"
echo "  6. Run first deployment via GitHub Actions"
echo ""
