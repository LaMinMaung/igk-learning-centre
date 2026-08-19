# IGK Learning Centre — GitHub Repository & Admin Setup

Two parts:
1. [GitHub Repository Setup](#part-1-github-repository-setup) — push code, branches, secrets, environments
2. [PocketBase Admin Setup](#part-2-pocketbase-admin-setup) — access panel, reset passwords, secure accounts

---

# Part 1: GitHub Repository Setup

## Step 1 — Create the GitHub repository

1. Go to **https://github.com/new**
2. Fill in:
   - **Repository name:** `igk-learning-centre` (or any name you prefer)
   - **Visibility:** Private ← important, your code contains credentials
   - **Initialize repository:** leave all checkboxes OFF (you already have files)
3. Click **Create repository**
4. GitHub shows you a page with your repo URL. Copy it — you'll need it next.
   It looks like: `https://github.com/YOUR-USERNAME/igk-learning-centre.git`

---

## Step 2 — Push your code to GitHub

Run these commands in the folder where you have your project files on your local machine.

```bash
cd /path/to/igk-learning-centre    # where your project files are

# Initialize git (if not already done)
git init

# Stage all files
git add .

# First commit
git commit -m "feat: initial IGK Learning Centre application"

# Rename default branch to main
git branch -M main

# Add your GitHub repository as the remote
git remote add origin https://github.com/YOUR-USERNAME/igk-learning-centre.git

# Push to GitHub
git push -u origin main
```

Refresh your GitHub repository page — all files should appear there now.

---

## Step 3 — Create the staging branch

```bash
# Create staging branch from main
git checkout -b staging

# Push it to GitHub
git push -u origin staging
```

You now have two branches:
- `main` → deploys to **mydomain.com** (production)
- `staging` → deploys to **tst.mydomain.com** (staging)

---

## Step 4 — Branch protection rules

### Protect `main`

Go to your repo → **Settings → Branches → Add branch protection rule**

- **Branch name pattern:** `main`
- Check these boxes:
  - ✅ Require a pull request before merging
  - ✅ Require approvals — set to **1**
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require status checks to pass before merging
    - Search for and add: `validate`, `build`
  - ✅ Require branches to be up to date before merging
  - ✅ Do not allow bypassing the above settings
- Click **Create**

### Protect `staging`

Add another rule:

- **Branch name pattern:** `staging`
- Check these boxes:
  - ✅ Require a pull request before merging
  - ✅ Require status checks to pass before merging
    - Search for and add: `validate`, `build`
- Click **Create**

> After these rules are active, nobody can push directly to `main` or `staging`.
> All changes go through pull requests.

---

## Step 5 — Create the production Environment (approval gate)

This is the gate that pauses every production deployment until a human approves it.

Go to **Settings → Environments → New environment**

- **Name:** `production`
- Click **Configure environment**
- Under **Deployment protection rules:**
  - ✅ Required reviewers
  - Add your GitHub username (and any teammates who can approve releases)
- Under **Deployment branches:**
  - Select **Selected branches**
  - Click **Add deployment branch rule** → type `main`
- Click **Save protection rules**

> Every time `production.yml` runs, GitHub will email you and pause the deploy.
> You click **Review deployments → Approve and deploy** to release.

Also create the staging environment (no approval required):

- **Name:** `staging`
- No required reviewers
- Deployment branches → `staging`
- Save

---

## Step 6 — Add all GitHub Secrets

Go to **Settings → Secrets and variables → Actions → New repository secret**

Add each of these one at a time:

### Production secrets

| Secret name | What to put in it |
|---|---|
| `PROD_HOST` | Your production server's IP address (e.g. `123.45.67.89`) |
| `PROD_USER` | `deploy` |
| `PROD_SSH_KEY` | The entire contents of `~/.ssh/igk_deploy_prod` (private key, starts with `-----BEGIN OPENSSH PRIVATE KEY-----`) |
| `PROD_PB_URL` | `https://api.mydomain.com` (your real domain) |

### Staging secrets

| Secret name | What to put in it |
|---|---|
| `STAGING_HOST` | Your staging server's IP address |
| `STAGING_USER` | `deploy` |
| `STAGING_SSH_KEY` | The entire contents of `~/.ssh/igk_deploy_staging` (private key) |
| `STAGING_PB_URL` | `https://api.tst.mydomain.com` (your real domain) |

> **To copy a private key:** `cat ~/.ssh/igk_deploy_prod | pbcopy` (macOS)
> or `cat ~/.ssh/igk_deploy_prod | xclip -selection clipboard` (Linux)

---

## Step 7 — Set workflow permissions

Go to **Settings → Actions → General**

Scroll to **Workflow permissions** at the bottom:

- Select: **Read and write permissions**
- ✅ Allow GitHub Actions to create and approve pull requests
- Click **Save**

This allows the `promote.yml` workflow to create pull requests automatically.

---

## Step 8 — Test the pipeline end to end

### Test staging pipeline

```bash
git checkout staging

# Make a small change to trigger the pipeline
echo "# test" >> README.md
git add README.md
git commit -m "ci: test staging pipeline"
git push origin staging
```

Go to **Actions** tab in GitHub — you should see `Deploy → Staging` running.
It will validate → build → deploy → show a green checkmark.

Open https://tst.mydomain.com — your site should be live.

### Test production approval gate

```bash
git checkout main
git merge staging
git push origin main
```

Go to **Actions** — `Deploy → Production` starts, then **pauses** at the approval gate.
You get an email. Click **Review deployments → Approve and deploy**.
Open https://mydomain.com — your site goes live.

---

## Step 9 — Verify the promote workflow

For future releases, you won't merge manually. Instead:

1. Go to **Actions → Promote Staging → Production → Run workflow**
2. Fill in release notes, click **Run workflow**
3. A PR is automatically created: `staging` → `main`
4. Review and merge the PR
5. Approve the production gate
6. Done

---

# Part 2: PocketBase Admin Setup

## Understanding the two admin accounts

Your project has **two completely separate types of admin**:

```
┌─────────────────────────────────────────────────────────┐
│  PocketBase Superuser  (/_  admin panel)                │
│  ─────────────────────────────────────────────────────  │
│  Email   : info@igklearningcentre.com                   │
│  Password: UNKNOWN (set by setRandomPassword())         │
│  Access  : Database schema, migrations, all records     │
│  Used by : Developer / system administrator only        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  LMS Admin User  (in users collection)                  │
│  ─────────────────────────────────────────────────────  │
│  Email   : academic@igklc.com                           │
│  Password: sayakyaw12348765  ← CHANGE THIS IN PROD      │
│  Access  : LMS admin dashboard at /lms/admin/dashboard  │
│  Used by : School administrator                         │
│                                                         │
│  Demo admin (for testing only — disable in prod):       │
│  Email   : demo@igklc.com                               │
│  Password: Demo@IGK2024      ← DISABLE IN PROD          │
└─────────────────────────────────────────────────────────┘
```

> ⚠️ **Security warning:** The LMS admin passwords are committed to the git
> repository. Change them on production immediately after first deployment.

---

## Reset the PocketBase superuser password

The superuser password is currently unknown (it was randomly generated).
You must reset it before you can access the `/_` admin panel.

Run this from your local machine (after first deployment):

```bash
chmod +x scripts/pb-reset-superuser.sh
./scripts/pb-reset-superuser.sh production
```

The script will ask for:
- Your server IP
- A new email for the superuser (keep `info@igklearningcentre.com` or change it)
- A strong new password (not stored anywhere — only you know it)

It SSHs into the server, stops PocketBase, runs the reset command, and restarts it.

---

## Access the PocketBase admin panel

The `/_` panel is **not publicly accessible** via your domain (blocked by nginx for security).
You access it through a secure SSH tunnel:

```bash
chmod +x scripts/pb-admin-access.sh
./scripts/pb-admin-access.sh production
```

The script asks for your server IP, opens the tunnel, and automatically opens
`http://localhost:9090/_` in your browser.

Log in with the superuser email and the password you just set.

For staging:
```bash
./scripts/pb-admin-access.sh staging
# Opens http://localhost:9091/_
```

---

## Change the LMS admin password (do this on production day 1)

Once you have the PocketBase admin panel open via SSH tunnel:

1. Click **Collections** in the left sidebar
2. Click **users**
3. Find the row with email `academic@igklc.com`
4. Click the **pencil icon** (Edit)
5. Set a new strong password in the **New password** field
6. Click **Save**
7. Log in at `https://mydomain.com/lms/login` to verify it works

---

## Disable or remove the demo admin account on production

The `demo@igklc.com` account exists for testing. Remove it from production:

1. Open PocketBase admin panel (SSH tunnel)
2. Collections → users
3. Find `demo@igklc.com`
4. Click the **trash icon** → Confirm deletion

Or create a migration that removes it (add to `pb_migrations/` and deploy):

```js
migrate((app) => {
  try {
    const demo = app.findAuthRecordByEmail("users", "demo@igklc.com")
    app.delete(demo)
  } catch { /* already removed */ }
}, (app) => {
  // intentionally no rollback — don't restore demo account
})
```

---

## Production admin account checklist

Run through this checklist after your first production deployment:

- [ ] PocketBase superuser password reset via `./scripts/pb-reset-superuser.sh production`
- [ ] Able to log into `/_` via `./scripts/pb-admin-access.sh production`
- [ ] LMS admin password changed (via `/_` panel → users → academic@igklc.com)
- [ ] Demo admin account `demo@igklc.com` deleted from production
- [ ] Verified LMS login works at `https://mydomain.com/lms/login`
- [ ] SSH tunnel closed after use (`Ctrl+C` in the terminal running `pb-admin-access.sh`)
- [ ] New admin password stored securely (password manager, not in any file)

---

## Summary: What runs where

| Account | URL | Used for |
|---|---|---|
| PocketBase superuser | SSH tunnel → `localhost:9090/_` | Database admin (developer only) |
| LMS admin | `https://mydomain.com/lms/login` | School administration |
| LMS teacher | `https://mydomain.com/lms/login` | Teachers |
| LMS student | `https://mydomain.com/lms/login` | Students |
| LMS parent | `https://mydomain.com/lms/login` | Parents |
