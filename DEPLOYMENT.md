# IGK Learning Centre — Hosted Deployment Guide

Two live cloud environments, zero localhost dependency.

```
mydomain.com          ← Production  (main branch)
tst.mydomain.com      ← Staging     (staging branch)
```

Throughout this guide, replace `mydomain.com` with your actual domain.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Choose a Hosting Provider](#2-choose-a-hosting-provider)
3. [Provision Your Servers](#3-provision-your-servers)
4. [DNS Configuration](#4-dns-configuration)
5. [Server Setup (Run Once Per Server)](#5-server-setup-run-once-per-server)
6. [Generate & Install Deploy Keys](#6-generate--install-deploy-keys)
7. [Nginx & SSL Configuration](#7-nginx--ssl-configuration)
8. [Configure GitHub Repository](#8-configure-github-repository)
9. [First Manual Deployment](#9-first-manual-deployment)
10. [Automated CI/CD (Day-to-day)](#10-automated-cicd-day-to-day)
11. [Staging → Production Promotion Flow](#11-staging--production-promotion-flow)
12. [Rollback Procedure](#12-rollback-procedure)
13. [Maintenance](#13-maintenance)

---

## 1. Architecture Overview

```
GitHub Repository
│
├── staging branch ──► GitHub Actions (staging.yml)
│                            │
│                     rsync + SSH deploy
│                            │
│                    ┌───────▼────────────────────────────┐
│                    │      STAGING SERVER                 │
│                    │   tst.mydomain.com (nginx → dist/)  │
│                    │   api.tst.mydomain.com (nginx → PB) │
│                    │   PocketBase :8091 → pb_data_stg/   │
│                    └────────────────────────────────────┘
│
└── main branch ────► GitHub Actions (production.yml)
                             │
                      [approval gate]
                             │
                      rsync + SSH deploy
                             │
                    ┌────────▼───────────────────────────┐
                    │     PRODUCTION SERVER               │
                    │  mydomain.com (nginx → dist/)       │
                    │  api.mydomain.com (nginx → PB)      │
                    │  PocketBase :8090 → pb_data_prod/   │
                    └────────────────────────────────────┘
```

### What lives where

| Component | Production server | Staging server |
|---|---|---|
| React app (dist/) | `/var/www/igk-prod/` | `/var/www/igk-staging/` |
| PocketBase binary | `/opt/pocketbase-production/pocketbase` | `/opt/pocketbase-staging/pocketbase` |
| PocketBase data | `/opt/pocketbase-production/pb_data/` | `/opt/pocketbase-staging/pb_data/` |
| PocketBase port | `127.0.0.1:8090` | `127.0.0.1:8091` |
| Systemd service | `pocketbase-production` | `pocketbase-staging` |

---

## 2. Choose a Hosting Provider

You need two VPS servers. Recommended providers (any will work):

| Provider | Min spec for this app | Est. cost |
|---|---|---|
| **Hetzner Cloud** | CX22 (2 vCPU, 4GB RAM) | ~€4/mo each |
| **DigitalOcean** | Basic Droplet (1 vCPU, 1GB) | ~$6/mo each |
| **Vultr** | Regular (1 vCPU, 1GB) | ~$6/mo each |
| **Linode** | Nanode (1 vCPU, 1GB) | ~$5/mo each |

**OS:** Ubuntu 22.04 LTS (all instructions below assume this)

> **Cost tip:** For staging, the smallest available tier is fine.
> Production should have at least 2GB RAM if you expect real traffic.

---

## 3. Provision Your Servers

### Create two VPS instances

1. Sign up with your chosen provider
2. Create two servers, both running **Ubuntu 22.04 LTS**
   - Name them clearly: `igk-production` and `igk-staging`
3. Note the **IP addresses** of both servers
4. Add your personal SSH key during creation (so you can log in as root)

### Verify you can SSH in

```bash
ssh root@<production-server-ip>
ssh root@<staging-server-ip>
```

---

## 4. DNS Configuration

Log into your domain registrar (wherever you bought `mydomain.com`).

Add these DNS records:

| Type | Name | Value | TTL |
|---|---|---|---|
| `A` | `@` (or blank) | Production server IP | 300 |
| `A` | `www` | Production server IP | 300 |
| `A` | `api` | Production server IP | 300 |
| `A` | `tst` | Staging server IP | 300 |
| `A` | `api.tst` | Staging server IP | 300 |

> **DNS propagation takes 5 minutes to 48 hours.** Use https://dnschecker.org
> to verify your records are live before running certbot.

---

## 5. Server Setup (Run Once Per Server)

SSH into each server as root and run the provisioning script from the repo.

### Production server

```bash
ssh root@<production-server-ip>

curl -fsSL https://raw.githubusercontent.com/YOUR-ORG/igk/main/scripts/server-setup.sh \
  | bash -s -- production mydomain.com
```

### Staging server

```bash
ssh root@<staging-server-ip>

curl -fsSL https://raw.githubusercontent.com/YOUR-ORG/igk/main/scripts/server-setup.sh \
  | bash -s -- staging tst.mydomain.com
```

The script installs nginx, certbot, creates the `deploy` user, downloads
PocketBase, and registers the systemd service. It takes about 2 minutes.

---

## 6. Generate & Install Deploy Keys

GitHub Actions needs SSH access to both servers. Use **separate key pairs** per environment.

### Generate keys (on your local machine)

```bash
# Production deploy key
ssh-keygen -t ed25519 -C "igk-github-actions-production" \
  -f ~/.ssh/igk_deploy_prod -N ""

# Staging deploy key
ssh-keygen -t ed25519 -C "igk-github-actions-staging" \
  -f ~/.ssh/igk_deploy_staging -N ""
```

### Install public keys on servers

```bash
# On production server — paste the PUBLIC key
ssh root@<production-server-ip>
echo "$(cat ~/.ssh/igk_deploy_prod.pub)" >> /home/deploy/.ssh/authorized_keys

# On staging server — paste the PUBLIC key
ssh root@<staging-server-ip>
echo "$(cat ~/.ssh/igk_deploy_staging.pub)" >> /home/deploy/.ssh/authorized_keys
```

### Add private keys to GitHub Secrets

Go to your GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**

| Secret name | Value |
|---|---|
| `PROD_HOST` | Production server IP address |
| `PROD_USER` | `deploy` |
| `PROD_SSH_KEY` | Contents of `~/.ssh/igk_deploy_prod` (private key) |
| `PROD_PB_URL` | `https://api.mydomain.com` |
| `STAGING_HOST` | Staging server IP address |
| `STAGING_USER` | `deploy` |
| `STAGING_SSH_KEY` | Contents of `~/.ssh/igk_deploy_staging` (private key) |
| `STAGING_PB_URL` | `https://api.tst.mydomain.com` |

> **Never commit private keys.** They only live in GitHub Secrets and your local machine.

---

## 7. Nginx & SSL Configuration

### Install nginx config on production server

```bash
ssh root@<production-server-ip>

# Copy from repo (after your first git clone on the server, or paste manually)
cp /path/to/nginx/production.conf /etc/nginx/sites-available/production

# Replace mydomain.com with your real domain
sed -i 's/mydomain.com/YOUR-ACTUAL-DOMAIN.COM/g' /etc/nginx/sites-available/production

# Enable the site
ln -s /etc/nginx/sites-available/production /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test config
nginx -t

# Issue SSL certificates (DNS must be live first!)
certbot --nginx \
  -d mydomain.com \
  -d www.mydomain.com \
  -d api.mydomain.com \
  --non-interactive \
  --agree-tos \
  -m admin@mydomain.com

# Reload nginx
systemctl reload nginx
```

### Install nginx config on staging server

```bash
ssh root@<staging-server-ip>

cp /path/to/nginx/staging.conf /etc/nginx/sites-available/staging
sed -i 's/mydomain.com/YOUR-ACTUAL-DOMAIN.COM/g' /etc/nginx/sites-available/staging
ln -s /etc/nginx/sites-available/staging /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t

certbot --nginx \
  -d tst.mydomain.com \
  -d api.tst.mydomain.com \
  --non-interactive \
  --agree-tos \
  -m admin@mydomain.com

systemctl reload nginx
```

### Verify SSL auto-renewal

```bash
certbot renew --dry-run   # Should succeed on both servers
```

---

## 8. Configure GitHub Repository

### Branch protection rules

Go to **Settings → Branches → Add rule**

**For `main` (production):**
- Branch name pattern: `main`
- ✅ Require a pull request before merging
- ✅ Require approvals (1 or more)
- ✅ Require status checks to pass (select: `validate`, `build`)
- ✅ Restrict who can push to matching branches
- ✅ Do not allow bypassing the above settings

**For `staging`:**
- Branch name pattern: `staging`
- ✅ Require a pull request before merging
- ✅ Require status checks to pass

### GitHub Environment: production (approval gate)

Go to **Settings → Environments → New environment → production**

- ✅ Required reviewers — add yourself and any team members who can approve production deploys
- ✅ Deployment branches — restrict to `main` only

This pauses every production deployment until a reviewer clicks **Approve** in the Actions UI.

### Workflow permissions

Go to **Settings → Actions → General → Workflow permissions**

- Select: **Read and write permissions** (needed for the promote workflow to create PRs)

---

## 9. First Manual Deployment

Before automated deployments work, do one manual deploy to seed the databases and verify everything is connected.

### First staging deploy

```bash
# On your machine
git checkout staging

# Update env files with your real domain
sed -i 's/app.com/mydomain.com/g' codebase/.env.staging

# Build
cd codebase && npx vite build --mode staging

# Copy to staging server
rsync -avz dist/ deploy@<staging-server-ip>:/var/www/igk-staging/

# Sync migrations
rsync -avz pb_migrations/ deploy@<staging-server-ip>:/opt/pocketbase-staging/pb_migrations/

# Apply migrations on staging
ssh deploy@<staging-server-ip> \
  "/opt/pocketbase-staging/pocketbase migrate up \
    --dir /opt/pocketbase-staging/pb_data \
    --migrationsDir /opt/pocketbase-staging/pb_migrations"

# Restart PocketBase
ssh deploy@<staging-server-ip> "sudo systemctl restart pocketbase-staging"
```

Open https://tst.mydomain.com — you should see the site.
Open https://api.tst.mydomain.com/api/health — should return `{"code":200}`.

### First production deploy (same steps, different server)

```bash
git checkout main

sed -i 's/app.com/mydomain.com/g' codebase/.env.production

cd codebase && npx vite build --mode production

rsync -avz dist/ deploy@<prod-server-ip>:/var/www/igk-prod/
rsync -avz pb_migrations/ deploy@<prod-server-ip>:/opt/pocketbase-production/pb_migrations/

ssh deploy@<prod-server-ip> \
  "/opt/pocketbase-production/pocketbase migrate up \
    --dir /opt/pocketbase-production/pb_data \
    --migrationsDir /opt/pocketbase-production/pb_migrations"

ssh deploy@<prod-server-ip> "sudo systemctl restart pocketbase-production"
```

Open https://mydomain.com — site is live.

---

## 10. Automated CI/CD (Day-to-day)

After the first manual deploy, all subsequent deployments happen automatically.

### Feature development workflow

```bash
# Start a new feature
git checkout staging
git pull origin staging
git checkout -b feature/my-new-feature

# ... develop ...

git push origin feature/my-new-feature
# Open PR: feature/my-new-feature → staging
# Get review, merge
```

### What happens on merge to `staging`

`staging.yml` triggers automatically:

```
validate → build (staging mode) → rsync dist/ → sync migrations → migrate → restart PB
                                                                                   │
                                                             tst.mydomain.com updated ✅
```

Full pipeline takes ~3-4 minutes. Monitor in the **Actions** tab.

### What happens on merge to `main`

`production.yml` triggers automatically, then **pauses** at the approval gate:

```
validate → build (production mode) → [WAITING FOR APPROVAL] → rsync → migrate → restart PB
                                            │
                               Reviewer gets an email notification.
                               They click "Review deployments" in GitHub Actions.
                               They click "Approve and deploy".
                                            │
                                    mydomain.com updated ✅
```

---

## 11. Staging → Production Promotion Flow

This is the standard release process after QA sign-off.

### Step 1 — QA on staging

- Test all features on https://tst.mydomain.com
- Check the environment badge shows "STAGING"
- Test the LMS login at https://tst.mydomain.com/lms/login
- Check API health at https://api.tst.mydomain.com/api/health

### Step 2 — Trigger promotion

Go to **GitHub → Actions → Promote Staging → Production → Run workflow**

Enter your release notes and click **Run workflow**.

This creates a pull request: `staging` → `main` with a pre-filled checklist.

### Step 3 — Review and merge the PR

Review the PR. Confirm the checklist:
- QA testing done on staging
- No console errors
- Migrations tested
- Reviewed by team lead

Merge the PR.

### Step 4 — Approve the production gate

The production workflow triggers and pauses at the approval gate.

You get an email: *"Your review is requested for igk / Deploy → Production"*

Click the link → **Review deployments** → **Approve and deploy**

### Step 5 — Monitor the deployment

Watch the Actions run complete:
- `deploy` job: rsync, migrations, PocketBase restart
- Check https://mydomain.com is working
- Check https://api.mydomain.com/api/health

Done. The release is live.

---

## 12. Rollback Procedure

### Option A — Instant rollback (recommended)

Every successful production build is stored as a GitHub Actions artifact for 90 days.

1. Go to **Actions → Deploy → Production** in GitHub
2. Find the last **successful** run before the broken one
3. Note its **SHA** (shown in the run summary)
4. Go to **Actions → Run workflow** on `production.yml`, passing the previous SHA
   — or use the rollback script:

```bash
./scripts/rollback.sh <previous-git-sha> production
```

### Option B — Git revert

```bash
git checkout main
git revert HEAD --no-edit
git push origin main
# production.yml triggers, approval gate, deploys the reverted code
```

### Database rollback

If a migration was applied that needs reverting, create a **new corrective migration**
(never edit applied ones) and deploy it through the normal flow.

---

## 13. Maintenance

### Update PocketBase on a server

```bash
ssh root@<server-ip>

PB_VERSION="0.28.5"   # new version
ARCH=$(dpkg --print-architecture)
curl -fsSL "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_${ARCH}.zip" \
  -o /tmp/pb.zip
unzip -o /tmp/pb.zip pocketbase -d /opt/pocketbase-production
chmod +x /opt/pocketbase-production/pocketbase
systemctl restart pocketbase-production
```

### Check PocketBase logs

```bash
# Production
journalctl -u pocketbase-production -f

# Staging
journalctl -u pocketbase-staging -f
```

### Renew SSL certificates

Certbot auto-renews via a system timer. Check it with:

```bash
systemctl status certbot.timer
certbot renew --dry-run
```

### Check nginx status

```bash
systemctl status nginx
nginx -t            # Test config before reload
systemctl reload nginx
```

### Monitor disk space (PocketBase data grows)

```bash
df -h
du -sh /opt/pocketbase-production/pb_data/
```

---

## Quick Reference

### GitHub Secrets required

| Secret | Used in | Value |
|---|---|---|
| `PROD_HOST` | production.yml | Production server IP |
| `PROD_USER` | production.yml | `deploy` |
| `PROD_SSH_KEY` | production.yml | Private key contents |
| `PROD_PB_URL` | production.yml | `https://api.mydomain.com` |
| `STAGING_HOST` | staging.yml | Staging server IP |
| `STAGING_USER` | staging.yml | `deploy` |
| `STAGING_SSH_KEY` | staging.yml | Private key contents |
| `STAGING_PB_URL` | staging.yml | `https://api.tst.mydomain.com` |

### Important URLs after setup

| URL | What it is |
|---|---|
| `https://mydomain.com` | Production site |
| `https://api.mydomain.com/api/health` | Production PocketBase health |
| `https://mydomain.com/health` | App health check page |
| `https://tst.mydomain.com` | Staging site |
| `https://api.tst.mydomain.com/api/health` | Staging PocketBase health |
| `https://tst.mydomain.com/dev` | Developer dashboard (staging only) |
| `https://tst.mydomain.com/test/api` | API explorer (staging only) |
| `http://<prod-ip>:8090/_` (block with UFW) | PocketBase admin — access via SSH tunnel only |

### Access PocketBase admin UI securely (SSH tunnel)

The PocketBase admin (`/_`) is not exposed directly via nginx — access it via SSH tunnel:

```bash
# Production PocketBase admin
ssh -L 9090:127.0.0.1:8090 deploy@<prod-server-ip> -N &
# Now open: http://localhost:9090/_

# Staging PocketBase admin
ssh -L 9091:127.0.0.1:8091 deploy@<staging-server-ip> -N &
# Now open: http://localhost:9091/_
```
