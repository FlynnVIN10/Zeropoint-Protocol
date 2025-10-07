# Zeropoint Protocol - Local Runbook
**Local Development & Deployment Guide**

---

## Prerequisites

- Node.js ≥18.0.0
- npm or pnpm
- SQLite3 (bundled with macOS)

---

## Initial Setup

### 1. Clone and Install

```bash
git clone https://github.com/FlynnVIN10/Zeropoint-Protocol.git
cd Zeropoint-Protocol
npm ci
```

### 2. Environment Configuration

```bash
cp .env.local.example .env.local
```

Edit `.env.local` if needed:
```env
LOCAL_MODE=1
DATABASE_URL="file:./dev.db"
MOCKS_DISABLED=0
NODE_ENV=development
PORT=3000
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations (creates dev.db)
npx prisma migrate dev

# Seed initial data
npm run seed
```

**Expected Output:**
```
🌱 Seeding database...
✅ Created 2 synthients
✅ Created proposal: Adopt CI-only evidence writer
✅ Created approval vote
🎉 Seed complete!
```

---

## Running Locally

### Development Mode

```bash
npm run dev
```

**Access:**
- Dashboard: http://localhost:3000
- Health: http://localhost:3000/api/healthz
- Ready: http://localhost:3000/api/readyz

### Production Mode

```bash
npm run build
npm start
```

**Runs on:** http://localhost:3000

---

## Acceptance Tests

### Health Endpoint
```bash
curl -s http://localhost:3000/api/healthz | jq .
```

**Expected:**
```json
{
  "ok": true,
  "service": "web",
  "now": "2025-10-07T..."
}
```

### Readiness Endpoint
```bash
curl -s http://localhost:3000/api/readyz | jq .
```

**Expected:**
```json
{
  "ready": true,
  "checks": { "db": true },
  "now": "2025-10-07T..."
}
```

### Proposals API
```bash
curl -s http://localhost:3000/api/proposals | jq length
```

**Expected:** `≥1` (from seed)

### Synthients API
```bash
curl -s http://localhost:3000/api/synthients | jq length
```

**Expected:** `≥2` (from seed - OCEAN-Alpha, OCEAN-Beta)

### Version Status
```bash
cat public/status/version.json | jq -r '.phase,.commit,.ciStatus,.buildTime'
```

**Expected:**
```
Dev
local
local
1970-01-01T00:00:00Z
```

---

## UI Workflows

### Create Proposal
1. Open http://localhost:3000
2. Scroll to "Create Proposal" section
3. Enter title and body
4. Click "Submit Proposal"
5. **Verify:** Proposal appears in list below

### Approve/Veto Proposal
1. Find proposal in list
2. Click "Approve" or "Veto" button
3. **Verify:** Status changes to "approved" or "vetoed"
4. **Verify:** Vote count increments

### Start Training
1. Find synthient in list
2. Click "Start Training"
3. **Verify:** Status changes to "training"
4. Wait ~2 seconds
5. **Verify:** Status changes to "ready"
6. **Verify:** Run appears in "Recent Runs" with success status

---

## Database Management

### View Database
```bash
npm run prisma:studio
```

**Opens:** http://localhost:5555 (Prisma Studio)

### Reset Database
```bash
rm -f dev.db dev.db-shm dev.db-wal
npx prisma migrate dev
npm run seed
```

### Inspect Schema
```bash
npx prisma db pull
```

---

## Troubleshooting

### "Prisma Client not generated"
```bash
npx prisma generate
```

### "Database connection failed"
```bash
# Check DATABASE_URL in .env.local
cat .env.local | grep DATABASE_URL

# Verify file exists
ls -la dev.db
```

### Port already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Build fails
```bash
# Clean build artifacts
rm -rf .next

# Rebuild
npm run build
```

---

## Testing

### Manual Testing Checklist

- [ ] Health endpoint returns 200
- [ ] Ready endpoint returns 200 with db:true
- [ ] Proposals API returns array
- [ ] Synthients API returns array
- [ ] Can create proposal via UI
- [ ] Can approve proposal
- [ ] Can veto proposal
- [ ] Can start training
- [ ] Training completes to "ready"
- [ ] DB persists across restarts

### Automated Tests (Future)

```bash
npm test
```

---

## Tinybox Green Migration

### Path Portability

All paths are relative or environment-driven:
```bash
DATABASE_URL=file:./dev.db          # ✅ Portable
PORT=3000                            # ✅ Configurable
NODE_OPTIONS=--max-old-space-size=4096  # ✅ Parametric
```

### Transfer to Tinybox Green

```bash
# On MacBook Pro
git push origin main

# On Tinybox Green
git clone https://github.com/FlynnVIN10/Zeropoint-Protocol.git
cd Zeropoint-Protocol
npm ci
npx prisma generate
npx prisma migrate dev
npm run seed
npm start
```

**Should work identically.**

---

## CI/CD (Build/Test Only)

### Local CI Check

```bash
npm ci
npx prisma generate
npm run typecheck
npm run lint
npm run build
```

**All must pass before merge.**

### GitHub Actions

Workflow: `.github/workflows/ci-local.yml`

**Runs on:** PR + Push to main  
**Steps:** Install, Generate Prisma, Typecheck, Lint, Build  
**No Deploy:** Verified via grep check

---

## Security

### Secrets Management

- ✅ `.env*` files in `.gitignore`
- ✅ No secrets in repository
- ✅ `.env.local.example` as template only

### Database Files

- ✅ `*.db` files in `.gitignore`
- ✅ SQLite database not committed
- ✅ Fresh database created via migrations

---

## Evidence & Status

### Version Status
**Location:** `public/status/version.json`  
**Mode:** Local static (CI will update in future)

### Evidence
**Location:** `public/evidence/verify/local/`  
**Mode:** Local placeholder

---

## Commands Quick Reference

```bash
# Setup
npm ci && cp .env.local.example .env.local && npx prisma migrate dev && npm run seed

# Dev
npm run dev

# Build
npm run build && npm start

# Verify
curl -s http://localhost:3000/api/healthz | jq .
curl -s http://localhost:3000/api/readyz  | jq .
curl -s http://localhost:3000/api/proposals | jq length
curl -s http://localhost:3000/api/synthients | jq length

# DB
npm run prisma:studio

# Clean
rm -rf .next dev.db* node_modules && npm ci
```

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-07  
**Platform:** MacBook Pro (portable to Tinybox Green)  
**Runtime:** Next.js local (no Cloudflare)

