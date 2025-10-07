# Zeropoint Protocol
**Local-First Dual-Consensus Platform**

---

## Overview

Zeropoint Protocol is a governance and training platform for Synthient AI agents, running **fully local** on macOS with zero cloud dependencies.

**Runtime:** Next.js (localhost:3000)  
**Database:** SQLite (Prisma ORM)  
**Platform:** MacBook Pro (portable to Tinybox Green)  
**Governance:** Dual-consensus (Human + Synthient)

---

## Quick Start

### Prerequisites
- Node.js ≥18.0.0
- npm ≥10.0.0
- macOS (or Linux/Tinybox Green)

### Installation

```bash
# Clone repository
git clone https://github.com/FlynnVIN10/Zeropoint-Protocol.git
cd Zeropoint-Protocol

# Install dependencies
npm ci

# Configure environment
cp .env.local.example .env.local

# Setup database
npx prisma migrate dev
npm run seed

# Start development server
npm run dev
```

**Access:** http://localhost:3000

---

## Local Smoke Tests

### Health Endpoint
```bash
curl -si http://localhost:3000/api/healthz | grep -Ei 'HTTP/1.1 200|content-type: application/json|cache-control: no-store|x-content-type-options: nosniff|content-disposition: inline'
```

**Expected:** All headers present, HTTP/1.1 200 OK

### Readiness Endpoint
```bash
curl -si http://localhost:3000/api/readyz | grep -Ei 'HTTP/1.1 200|content-type: application/json|cache-control: no-store|x-content-type-options: nosniff|content-disposition: inline'
```

**Expected:** All headers present, `ready: true`, `checks.db: true`

### Version Status
```bash
cat public/status/version.json | jq -r '.phase,.commit,.ciStatus,.buildTime'
```

**Expected:** `Dev`, `local`, `local`, timestamp

---

## Features

### Governance & Proposals
- Create proposals for platform changes
- Approve/veto voting system
- Dual-consensus enforcement
- Evidence trail for all decisions

### Synthient Training
- Register Synthient agents
- Start training sessions
- Monitor training progress
- View training metrics and runs

### Real-time Dashboard
- Live status updates (1.5s polling)
- Health monitoring
- Proposal queue
- Synthient management

---

## Project Structure

```
zeropoint-protocol/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (healthz, readyz, synthients, proposals)
│   └── page.tsx           # Dashboard UI
├── prisma/                # Database schema & migrations
├── lib/                   # Shared utilities (db.ts)
├── public/                # Static assets & evidence
│   ├── status/            # version.json
│   └── evidence/          # Compliance & verification
├── docs/                  # Documentation
│   ├── INDEX.md          # Documentation index
│   ├── RUNBOOK_LOCAL.md  # Operations guide
│   ├── ARCHITECTURE.md   # System architecture
│   └── VERIFICATION_GATE.md  # Quality gates
├── scripts/               # Automation (seed.mjs)
└── .github/workflows/     # CI (ci-local.yml only)
```

---

## Documentation

**Start here:**
- [`docs/RUNBOOK_LOCAL.md`](docs/RUNBOOK_LOCAL.md) - Complete operations guide
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) - System architecture
- [`docs/VERIFICATION_GATE.md`](docs/VERIFICATION_GATE.md) - Quality gates
- [`SECURITY.md`](SECURITY.md) - Security policy

**Index:** [`docs/INDEX.md`](docs/INDEX.md)

---

## Development

### Commands

```bash
# Development server
npm run dev

# Build for production
npm run build
npm start

# Database management
npm run prisma:studio     # GUI for database
npm run prisma:migrate    # Run migrations
npm run seed              # Seed sample data

# Quality checks
npm run typecheck         # TypeScript validation
npm run lint              # ESLint
npm test                  # Tests (when implemented)
```

### Database

**Provider:** SQLite (file-based)  
**ORM:** Prisma  
**File:** `dev.db` (gitignored)

**Models:**
- Synthient (AI agents)
- TrainingRun (training sessions)
- Proposal (governance proposals)
- Vote (approval/veto decisions)

---

## CI/CD

**Workflow:** `.github/workflows/ci-local.yml`

**Scope:** Build/test/lint/typecheck **only** - **NO DEPLOY**

**Required Checks:**
- Install dependencies
- Generate Prisma Client
- Type check
- Lint
- Build
- Verify no deploy commands

**Per CTO directive:** CI is localhost verification only. No cloud deployment.

---

## Governance

**Model:** Dual-consensus (Human + Synthient)

**Process:**
1. Proposal created via UI or API
2. CTO/SCRA reviews
3. Approve or veto vote recorded
4. Evidence filed in `/public/evidence/compliance/`
5. Decision implemented

**All material changes require dual-consensus approval.**

---

## Security

- ✅ No secrets in repository (`.env*` gitignored)
- ✅ Local-only runtime (not exposed to network by default)
- ✅ SQLite file permissions (standard Unix)
- ✅ Prisma ORM (prevents SQL injection)
- ✅ Security headers on API responses
- ✅ CI secret scanning

**See:** [`SECURITY.md`](SECURITY.md)

---

## Evidence & Compliance

**Canonical Paths:**
- Status: `/public/status/version.json`
- Provenance: `/public/evidence/verify/<shortSHA>/`
- Compliance: `/public/evidence/compliance/YYYY-MM-DD/`

**Per CTO directive:** All evidence must be repo-anchored and machine-checkable.

---

## Platform Status

**Runtime:** ✅ Local Next.js  
**Database:** ✅ SQLite operational  
**CI/CD:** ✅ Build/test only  
**Cloud:** ✅ Zero dependencies  
**Version:** 1.0.1  
**Status:** ✅ OPERATIONAL (localhost:3000)

---

## Migration History

**Previous:** Cloudflare Pages + Workers  
**Current:** Local Next.js + SQLite  
**Date:** 2025-10-07  
**Commits:** ab4a81aa (migration), f1180f02 (completion)

**All Cloudflare assets archived** in `archive/2025-10/cloudflare/`

---

## Contributing

**Requirements:**
- Pull requests to `main` only
- At least 1 approval (CTO or SCRA)
- CI checks must pass (`ci-local.yml`)
- Dual-consensus for material changes
- Evidence filed in `/public/evidence/compliance/`

**See:** `docs/CONTRIBUTING.md` (if exists)

---

## License

See [`license/`](license/) directory for full legal framework.

---

## Contact

**CTO:** Per GitHub issues tagged `@CTO`  
**SCRA:** Automated validator (reports to CTO)  
**Dev Team:** Via pull requests

---

## Links

- **Repository:** https://github.com/FlynnVIN10/Zeropoint-Protocol
- **Documentation:** [`docs/INDEX.md`](docs/INDEX.md)
- **Runbook:** [`docs/RUNBOOK_LOCAL.md`](docs/RUNBOOK_LOCAL.md)
- **Verification Gate:** [`docs/VERIFICATION_GATE.md`](docs/VERIFICATION_GATE.md)

---

**Version:** 1.0.1  
**Runtime:** Local macOS  
**Status:** Operational  
**Updated:** 2025-10-07
