# IGK Learning Centre — System Architecture

## Overview

Full-stack web application with three fully isolated environments,
professional CI/CD pipeline, and modular architecture.

**Stack:** React 19 · TypeScript · Vite · Tailwind CSS v4 · PocketBase v0.28.4

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           BROWSER (Client)                              │
│                                                                         │
│   React 19 + TypeScript + Vite                                          │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│   │  Pages   │  │ Components│  │  Hooks   │  │  API Abstraction     │  │
│   │  /lms/*  │  │ ui/      │  │ useAuth  │  │  api/auth.api.ts     │  │
│   │  /dev/*  │  │ lms/     │  │ useToast │  │  api/courses.api.ts  │  │
│   │  /health │  │ chatbot/ │  │          │  │  api/users.api.ts    │  │
│   └────┬─────┘  └──────────┘  └──────────┘  └──────────┬───────────┘  │
│        │                                                 │              │
│   ┌────▼─────────────────────────────────────────────────▼───────────┐  │
│   │               lib/  (core infrastructure)                        │  │
│   │  config.ts   logger.ts   featureFlags.ts   errorHandler.ts       │  │
│   └─────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────┬────────────────────────────────┘
                                         │ PocketBase JS SDK
                    ┌────────────────────▼───────────────────┐
                    │           PocketBase Backend            │
                    │                                         │
                    │  Collections: users · courses · lessons │
                    │  enrollments · quizzes · quiz_attempts  │
                    │  programs · site_content · site_media   │
                    │                                         │
                    │  Auth · REST API · Realtime · Files     │
                    └─────────────────────────────────────────┘
```

---

## Folder Structure

```
project-root/
│
├── .github/
│   └── workflows/
│       ├── staging.yml          ← Deploy to staging on push to `staging`
│       └── production.yml       ← Deploy to prod on push to `main` (with approval)
│
├── codebase/                    ← Vite + React frontend
│   ├── .env.development         ← Dev variables (committed, no secrets)
│   ├── .env.staging             ← Staging variables (committed, no secrets)
│   ├── .env.production          ← Production variables (committed, no secrets)
│   ├── .env.example             ← Template with all variable keys documented
│   │
│   └── src/
│       ├── api/                 ← API abstraction layer
│       │   ├── client.ts        ← Base wrapper (logging + error normalisation)
│       │   ├── auth.api.ts      ← Auth operations
│       │   ├── courses.api.ts   ← Course/lesson CRUD
│       │   ├── users.api.ts     ← User management
│       │   └── index.ts         ← Barrel export
│       │
│       ├── lib/                 ← Core infrastructure
│       │   ├── config.ts        ← Single source of truth for all env values
│       │   ├── logger.ts        ← Environment-aware structured logging
│       │   ├── featureFlags.ts  ← Feature flag system with runtime overrides
│       │   ├── errorHandler.ts  ← Centralised error normalisation
│       │   ├── auth.tsx         ← Auth context provider
│       │   ├── analytics.ts     ← GA4 integration
│       │   └── pocketbase.js    ← PocketBase client singleton
│       │
│       ├── components/
│       │   ├── ui/              ← Reusable primitives
│       │   │   ├── Badge.tsx
│       │   │   └── StatusIndicator.tsx
│       │   ├── lms/             ← LMS-specific components
│       │   │   ├── admin/       ← Admin modals
│       │   │   └── teacher/     ← Teacher modals
│       │   ├── chatbot/
│       │   ├── Analytics.tsx
│       │   ├── EnvironmentBadge.tsx  ← Sticky env banner (non-prod only)
│       │   └── SandboxRoute.tsx      ← Guard: redirects to / in production
│       │
│       ├── pages/
│       │   ├── programs/        ← Program marketing pages
│       │   ├── lms/             ← LMS app (admin/teacher/student/parent)
│       │   ├── dev/             ← Sandbox tools (non-production only)
│       │   │   ├── DevDashboard.tsx   → /dev
│       │   │   ├── SandboxPage.tsx    → /sandbox
│       │   │   ├── ComponentsTest.tsx → /test/components
│       │   │   └── ApiTest.tsx        → /test/api
│       │   ├── HealthCheck.tsx   → /health  (all environments)
│       │   ├── NotFound.tsx      → /* (404)
│       │   └── Index.tsx         → /
│       │
│       └── hooks/
│           ├── use-toast.ts
│           └── useAnalytics.ts
│
├── pb_migrations/               ← Shared schema — applied to ALL environments
├── scripts/
│   ├── start-dev.sh             ← Start PocketBase + Vite (development)
│   ├── build-staging.sh         ← Build for tst.app.com
│   ├── build-production.sh      ← Build for app.com (with safety prompt)
│   ├── setup-pb-staging.sh      ← Apply migrations to staging PocketBase
│   ├── validate-env.sh          ← Pre-deploy env variable validator
│   └── rollback.sh              ← Rollback to previous git SHA
│
├── ARCHITECTURE.md              ← This file
└── ENVIRONMENTS.md              ← Environment setup guide
```

---

## Environment Strategy

### Three Isolated Environments

| Property         | Development               | Staging                      | Production              |
|------------------|---------------------------|------------------------------|-------------------------|
| **Branch**       | `dev/*`, `feature/*`      | `staging`                    | `main`                  |
| **Frontend URL** | `localhost:5173`           | `https://tst.app.com`        | `https://app.com`       |
| **PocketBase**   | `localhost:8090`           | `https://api.tst.app.com`    | `https://api.app.com`   |
| **Database**     | `pb_data_dev/`            | `pb_data_stg/`               | `pb_data_prod/`         |
| **Log level**    | `debug`                   | `info`                       | `error`                 |
| **Sandbox tools**| ✅ Enabled                | ✅ Enabled (QA use)          | ❌ Disabled             |
| **Error tracking**| Off                      | On                           | On                      |
| **Env file**     | `.env.development`        | `.env.staging`               | `.env.production`       |
| **Build command**| `vite`                    | `vite build --mode staging`  | `vite build`            |

### Database Isolation — Non-negotiable Rules

1. **Each environment has its own PocketBase server** with its own data directory
2. **Schema (migrations) is shared** — same `pb_migrations/` applied to all
3. **Data is never copied between environments** — use anonymised seed data for QA
4. **`VITE_POCKETBASE_URL` is different in every `.env.*` file** — verified by `validate-env.sh`

---

## Environment Variables

All variables are prefixed `VITE_` (exposed to browser by Vite at build time).

| Variable | Dev | Staging | Prod | Description |
|---|---|---|---|---|
| `VITE_APP_ENV` | `development` | `staging` | `production` | Environment identifier |
| `VITE_APP_URL` | `localhost:5173` | `tst.app.com` | `app.com` | Public frontend URL |
| `VITE_POCKETBASE_URL` | `localhost:8090` | `api.tst.app.com` | `api.app.com` | **Must differ per env** |
| `VITE_LOG_LEVEL` | `debug` | `info` | `error` | Logging verbosity |
| `VITE_ERROR_TRACKING` | `false` | `true` | `true` | Remote error reporting |
| `VITE_APP_VERSION` | `1.0.0` | CI-injected | CI-injected | Semver |
| `VITE_BUILD_TIMESTAMP` | `local` | CI-injected | CI-injected | ISO timestamp |
| `VITE_FF_SANDBOX_ROUTES` | `true` | `true` | **`false`** | /dev, /sandbox, /test/* |
| `VITE_FF_*` | varies | varies | `false` | Feature flags |

**Secrets** (injected by CI/CD, never committed):
- `STAGING_POCKETBASE_URL` — GitHub Secret, overrides `.env.staging` at build time
- `PRODUCTION_POCKETBASE_URL` — GitHub Secret, overrides `.env.production` at build time

---

## Core Infrastructure

### `lib/config.ts` — Configuration
Single typed `AppConfig` object. Every other module reads from here.
```ts
import { config } from '@/lib/config'
config.isProd         // boolean
config.pocketbaseUrl  // string — env-specific
config.logLevel       // 'debug' | 'info' | 'warn' | 'error' | 'silent'
```

### `lib/logger.ts` — Logging
Environment-aware structured logger. Silences debug/info in production.
```ts
import { logger } from '@/lib/logger'
logger.debug('Loading courses', { page, filter })   // dev only
logger.info('User logged in', { userId })            // dev + staging
logger.warn('Slow response', { ms })                 // all envs
logger.error('Payment failed', err, { userId })      // all envs + remote in prod
logger.api('REQ', 'courses.list', params)            // API request tracing
```

### `lib/featureFlags.ts` — Feature Flags
Driven by `VITE_FF_*` env vars. Overridable at runtime in non-prod via localStorage.
```ts
import { featureFlags, setFlagOverride } from '@/lib/featureFlags'
if (featureFlags.newDashboard) { /* show beta UI */ }
// Browser console override (non-prod only):
setFlagOverride('newDashboard', true)   // persists, triggers reload
clearFlagOverrides()                    // resets all to env defaults
```

### `lib/errorHandler.ts` — Error Handling
Normalises PocketBase errors, JS errors, and unknown throws into `AppError`.
```ts
import { handleApiError, getUserMessage } from '@/lib/errorHandler'
try {
  await coursesApi.create(data)
} catch (e) {
  const err = handleApiError(e, 'createCourse')
  toast.error(getUserMessage(err))
  if (err.isAuthError) navigate('/lms/login')
}
```

### `api/` — API Abstraction Layer
Wraps PocketBase SDK. Every call goes through `apiCall()` for logging + error normalisation.
```ts
import { authApi, coursesApi, usersApi } from '@/api'
const { record } = await authApi.login(email, password)
const list = await coursesApi.list(1, 20, filter)
```
To swap out PocketBase for another backend, only change the `api/*.api.ts` files.

---

## Deployment Workflow

```
Developer workstation
        │
        ├── feature/* branch
        │       │
        │       └── Pull Request → code review
        │
        ├── staging branch  ──────►  GitHub Actions: staging.yml
        │       │                         │
        │       │                    validate → build → migrate → deploy
        │       │                         │
        │       │                    https://tst.app.com
        │       │                    (QA testing, UAT, sign-off)
        │       │
        └── main branch  ────────►  GitHub Actions: production.yml
                                         │
                                    safety-gate → build → migrate → deploy
                                         │
                                    https://app.com (LIVE)
```

### CI/CD Pipeline Details

**Staging pipeline** (`staging.yml` — auto-triggered on push to `staging`):
1. Validate env file has required variables
2. Install dependencies (cached)
3. Inject `VITE_BUILD_TIMESTAMP` and `VITE_APP_VERSION`
4. Override `VITE_POCKETBASE_URL` from GitHub Secret (never from committed file)
5. Build `--mode staging`
6. Apply PocketBase migrations to staging database
7. Deploy `dist/` to staging server

**Production pipeline** (`production.yml` — requires GitHub Environment approval):
1. Safety gate: manual confirmation or branch check
2. Install dependencies
3. Inject build metadata
4. Override PocketBase URL from `PRODUCTION_POCKETBASE_URL` secret
5. Build `--mode production`
6. Apply migrations to production database
7. Deploy — artifact retained 30 days for rollback
8. Tag release with timestamp + short SHA

### Rollback
```bash
# Option A: CLI rollback
./scripts/rollback.sh <previous-sha> production

# Option B: GitHub Actions
# Actions → production.yml → select previous run → Re-run jobs
# (uses the retained dist artifact — no rebuild needed)

# Option C: Git revert
git revert HEAD && git push origin main
# Triggers a fresh pipeline on the reverted code
```

---

## Sandbox & Testing Tools

All sandbox routes are **guarded by `SandboxRoute`** — in production they redirect to `/`.

| Route | Page | Purpose |
|---|---|---|
| `/dev` | `DevDashboard` | Env config, PB ping, feature flag toggles |
| `/sandbox` | `SandboxPage` | Component playground, interactive state |
| `/test/components` | `ComponentsTest` | All UI components with all variant combos |
| `/test/api` | `ApiTest` | Interactive PocketBase API request builder |
| `/health` | `HealthCheck` | System status, PB connectivity, build info |

**Feature flag toggle in browser (non-prod):**
```js
// Open browser console on /dev and toggle any flag:
import('/src/lib/featureFlags.js').then(m => m.setFlagOverride('newDashboard', true))
// Or use the toggle UI on the /dev page
```

---

## Security Model

| Concern | Implementation |
|---|---|
| **No hardcoded secrets** | All URLs/keys in env files or CI secrets |
| **Separate databases** | Different `VITE_POCKETBASE_URL` per env, enforced by `validate-env.sh` |
| **Sandbox isolation** | `VITE_FF_SANDBOX_ROUTES=false` in prod + `SandboxRoute` redirect guard |
| **PocketBase row-level security** | All collections have explicit rules (never empty string in prod) |
| **Auth spoofing prevention** | `createRule` enforces `@request.body.user = @request.auth.id` |
| **Error data leakage** | `logger` suppresses debug/info in prod; raw PB errors never shown to UI |
| **Production approval gate** | GitHub Environment protection rules require reviewer sign-off |
| **Input validation** | `validateRequired()` in `errorHandler.ts` before any API call |

---

## Local Development Setup

```bash
# 1. Clone
git clone https://github.com/your-org/igk-learning-centre.git
cd igk-learning-centre

# 2. Validate dev environment
chmod +x scripts/*.sh
./scripts/validate-env.sh development

# 3. Start everything (PocketBase + Vite)
./scripts/start-dev.sh

# 4. Apply migrations to local database
./pocketbase migrate up --dir ./pb_data_dev --migrationsDir ./pb_migrations

# 5. Open browser
open http://localhost:5173       # Main site
open http://localhost:5173/dev   # Developer dashboard
open http://localhost:8090/_     # PocketBase admin UI
```

---

## Staging Deployment

```bash
# 1. Validate
./scripts/validate-env.sh staging

# 2. Build
./scripts/build-staging.sh

# 3. Apply migrations on staging server
./scripts/setup-pb-staging.sh

# 4. Deploy dist/ to tst.app.com
rsync -avz codebase/dist/ user@staging-server:/var/www/igk-staging/

# OR push to `staging` branch → GitHub Actions handles it automatically
git push origin staging
```

---

## Production Deployment

```bash
# Prerequisites:
# 1. Feature deployed and tested on staging
# 2. QA sign-off received
# 3. GitHub Environment reviewer approvals configured

# Deploy via CI/CD:
git push origin main        # Triggers production.yml (requires approval)

# Or manually:
./scripts/validate-env.sh production
./scripts/build-production.sh
# Then deploy codebase/dist/ to app.com
```

---

## Adding a New Feature

1. Create branch: `git checkout -b feature/my-feature`
2. Add feature flag in `.env.*` files: `VITE_FF_MY_FEATURE=false` (all envs)
3. Register in `lib/featureFlags.ts` `FeatureFlags` interface + `envDefaults`
4. Implement behind flag: `if (featureFlags.myFeature) { ... }`
5. Enable in `.env.development` and `.env.staging` for testing
6. Test on staging with QA
7. Flip flag to `true` in `.env.production` for rollout (or merge to main)
8. After stable, remove flag guard and clean up

---

## Onboarding Checklist

- [ ] Clone repo and run `./scripts/start-dev.sh`
- [ ] Visit `/dev` — confirm environment dashboard loads
- [ ] Visit `/health` — confirm PocketBase shows green
- [ ] Log into LMS at `/lms/login` with `admin@igklearningcentre.org`
- [ ] Review `ENVIRONMENTS.md` for server setup instructions
- [ ] Add yourself as a reviewer on the GitHub `production` environment
- [ ] Set `STAGING_POCKETBASE_URL` and `PRODUCTION_POCKETBASE_URL` in GitHub Secrets
