# IGK Learning Centre — Environment Guide

Three fully isolated environments with separate frontends, backends,
and databases. No data ever crosses the environment boundary.

---

## Environment Overview

| Environment | Frontend URL        | PocketBase URL           | Database        | Branch        |
|-------------|---------------------|--------------------------|-----------------|---------------|
| Production  | https://app.com     | https://api.app.com      | `pb_data_prod/` | `main`        |
| Staging     | https://tst.app.com | https://api.tst.app.com  | `pb_data_stg/`  | `staging`     |
| Development | http://localhost:5173| http://127.0.0.1:8090   | `pb_data_dev/`  | `dev/*`       |

> Replace `app.com` with your real domain everywhere before deploying.

---

## Environment Variables

Each environment reads from its own `.env` file — loaded automatically by Vite
based on the `--mode` flag passed at build or dev time.

| File | Loaded when |
|---|---|
| `codebase/.env.development` | `vite --mode development` (default for `vite`) |
| `codebase/.env.staging`     | `vite build --mode staging` |
| `codebase/.env.production`  | `vite build` or `vite build --mode production` |
| `codebase/.env.example`     | Template only — copy to create the above |

**Key variables** (defined in each file):

```
VITE_APP_ENV          development | staging | production
VITE_APP_URL          Public URL of this deployment
VITE_APP_DOMAIN       Subdomain/domain for this environment
VITE_POCKETBASE_URL   PocketBase API URL — DIFFERENT per environment
VITE_APP_NAME         Display name
VITE_APP_TAGLINE      Tagline
```

**Secret values** belong in `*.env.*.local` files (git-ignored):

```bash
# Example: codebase/.env.production.local  ← git-ignored
VITE_SOME_REAL_SECRET=my-secret-value
```

---

## Running Each Environment

### Development (local)

```bash
# Option 1 — automated (starts PocketBase + Vite)
chmod +x scripts/start-dev.sh
./scripts/start-dev.sh

# Option 2 — manual
# Terminal 1: PocketBase
./pocketbase serve --dir ./pb_data_dev --http 127.0.0.1:8090

# Terminal 2: Vite
cd codebase
npx vite --mode development
```

Open: http://localhost:5173

---

### Staging build

```bash
chmod +x scripts/build-staging.sh
./scripts/build-staging.sh
# → outputs codebase/dist/  →  upload to tst.app.com
```

Or manually:

```bash
cd codebase
npx vite build --mode staging
```

---

### Production build

```bash
chmod +x scripts/build-production.sh
./scripts/build-production.sh
# → outputs codebase/dist/  →  upload to app.com
```

Or manually:

```bash
cd codebase
npx vite build --mode production
# or simply:
npx vite build
```

---

## Database Isolation

Each environment runs its own PocketBase server with its own data directory.
**They share the same schema (migrations) but NEVER the same data.**

```
project-root/
├── pb_migrations/        ← Shared schema — applied to ALL environments
├── pb_data_dev/          ← Development database (local only, git-ignored)
├── pb_data_stg/          ← Staging database (on staging server)
└── pb_data_prod/         ← Production database (on production server)
```

### Applying migrations to each environment

**Development** (local PocketBase):
```bash
./pocketbase migrate up --dir ./pb_data_dev --migrationsDir ./pb_migrations
```

**Staging** (run on your staging server):
```bash
chmod +x scripts/setup-pb-staging.sh
./scripts/setup-pb-staging.sh
# or manually:
./pocketbase migrate up --dir ./pb_data_stg --migrationsDir ./pb_migrations
```

**Production** (run on your production server):
```bash
./pocketbase migrate up --dir ./pb_data_prod --migrationsDir ./pb_migrations
```

### Staging PocketBase start command (on staging server)
```bash
./pocketbase serve \
  --dir ./pb_data_stg \
  --http 0.0.0.0:8091
```

Then reverse-proxy `api.tst.app.com` → `127.0.0.1:8091` via nginx/Caddy.

### Production PocketBase start command (on production server)
```bash
./pocketbase serve \
  --dir ./pb_data_prod \
  --http 0.0.0.0:8090
```

Then reverse-proxy `api.app.com` → `127.0.0.1:8090` via nginx/Caddy.

---

## Environment Badge

A visual banner is automatically rendered in the browser when running in
**development** (amber) or **staging** (blue). It shows the active environment
name and the PocketBase URL being used. It renders **nothing** in production.

This makes it immediately obvious which environment you are working in and
which database you are connected to.

---

## Subdomain DNS Setup

Add these DNS records for your domain registrar:

| Record | Name  | Value                    | Purpose              |
|--------|-------|--------------------------|----------------------|
| A      | @     | `<production server IP>` | app.com              |
| A      | tst   | `<staging server IP>`    | tst.app.com          |
| A      | api   | `<production server IP>` | api.app.com (PB)     |
| A      | api.tst | `<staging server IP>` | api.tst.app.com (PB) |

---

## Nginx Reverse Proxy (example — staging server)

```nginx
# tst.app.com — Staging frontend (static files)
server {
    listen 443 ssl;
    server_name tst.app.com;
    root /var/www/igk-staging/dist;
    index index.html;
    try_files $uri $uri/ /index.html;
}

# api.tst.app.com — Staging PocketBase
server {
    listen 443 ssl;
    server_name api.tst.app.com;
    location / {
        proxy_pass         http://127.0.0.1:8091;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
    }
}
```

---

## Promoting Code Between Environments

```
dev/* branch  →  staging branch  →  main branch
    ↓                  ↓                 ↓
  Local test     Staging server    Production server
  (pb_data_dev)  (pb_data_stg)    (pb_data_prod)
```

**Promoting data is intentionally not supported.**
Schema changes (migrations) are promoted automatically when you run
`pocketbase migrate up` on each server.

---

## Safety Rules

1. **Never point `VITE_POCKETBASE_URL` in `.env.staging` at the production database.**
2. **Never run `pocketbase migrate up` on production without testing on staging first.**
3. **Never copy `pb_data_prod/` to other environments.** Use anonymised seed data for testing.
4. Real secrets (API keys, etc.) go in `.env.*.local` files — these are git-ignored.
5. The `.env.development`, `.env.staging`, `.env.production` files are committed — they contain no secrets, only URLs.
