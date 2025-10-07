# Architecture - Zeropoint Protocol

**Version:** 1.0.1  
**Runtime:** Local Next.js + SQLite  
**Updated:** 2025-10-07

---

## Overview

Zeropoint Protocol is a **local-first** governance and training platform for Synthient AI agents. The architecture is designed for:

1. **Single Runtime** - Next.js App Router with SQLite (Prisma ORM)
2. **Zero Cloud Dependencies** - Fully operational on localhost:3000
3. **Dual-Consensus Governance** - Human + Synthient approval for material changes
4. **Evidence-Based Compliance** - All claims machine-checkable and repo-anchored

---

## Current Tree (v1.0.1 - Pre-Normalization)

```
/
├─ app/                    # Next.js App Router (partial migration)
│  ├─ api/                # API routes
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx
│
├─ archive/               # Cloud artifacts (Cloudflare migration leftovers)
│  └─ 2025-10/
│     ├─ cloudflare/      # wrangler.toml, functions/, infra/, workflows/
│     └─ workflows/       # Legacy CI workflows
│
├─ components/            # React components (to move → src/components)
├─ lib/                   # Mixed utils (to split → src/lib + src/server)
├─ services/              # Server logic (to move → src/server/services)
├─ providers/             # AI provider clients (to move → src/server/services)
├─ prisma/                # Database schema ✓
│  └─ schema.prisma
│
├─ public/                # Static assets + evidence
│  ├─ status/             # Runtime metadata
│  ├─ evidence/           # Compliance + verification (needs canonicalization)
│  └─ assets/
│
├─ scripts/               # Build/ops scripts (needs cleanup)
├─ docs/                  # Documentation ✓
├─ tests/                 # Test files (incomplete)
│
├─ .github/workflows/     # CI (ci-local.yml only) ✓
│
├─ functions/             # ❌ DELETE - Legacy Cloudflare
├─ infra/                 # ❌ DELETE - Legacy Cloudflare
├─ _headers               # ❌ DELETE - Cloudflare Pages config
├─ _routes.json           # ❌ DELETE - Cloudflare Pages config
│
├─ package.json
├─ next.config.js
├─ tsconfig.json
├─ .gitignore
└─ README.md
```

### Issues Identified

1. **Cloud Remnants** - `functions/`, `infra/`, `_headers`, `_routes.json` still present
2. **Flat Structure** - `components/`, `lib/`, `services/` at root instead of under `src/`
3. **Mixed Concerns** - `lib/` contains both client and server code
4. **Duplicate APIs** - Some endpoints may have legacy versions
5. **Evidence Scatter** - Evidence files in multiple locations without canonical structure
6. **No Middleware** - Headers not enforced in dev
7. **Weak TypeScript** - Not using strictest settings
8. **No Coverage Gates** - CI doesn't enforce test coverage

---

## Target Tree (Post-Normalization)

```
/
├─ app/                              # Next.js App Router (UI + API routes)
│  ├─ api/
│  │  ├─ healthz/route.ts           # Health check
│  │  ├─ readyz/route.ts            # Readiness check
│  │  ├─ status/route.ts            # Proxy to /public/status/version.json
│  │  ├─ synthients/
│  │  │  ├─ route.ts                # List/create Synthients
│  │  │  └─ [id]/train/route.ts     # Start training
│  │  └─ proposals/
│  │     ├─ route.ts                # List/create proposals
│  │     └─ [id]/vote/route.ts      # Approve/veto
│  ├─ (ui)/                         # Shared route groups
│  ├─ layout.tsx
│  ├─ page.tsx
│  └─ globals.css
│
├─ src/
│  ├─ server/                       # Server-only code (not bundled to client)
│  │  ├─ db/
│  │  │  ├─ index.ts                # Prisma client export
│  │  │  └─ seed.ts                 # Seed script
│  │  ├─ services/                  # Business logic
│  │  │  ├─ synthients.ts
│  │  │  ├─ proposals.ts
│  │  │  └─ training.ts
│  │  ├─ checks/                    # Health/ready checks
│  │  │  ├─ health.ts
│  │  │  └─ readiness.ts
│  │  └─ headers.ts                 # Security headers config
│  │
│  ├─ lib/                          # Shared utilities (client-safe)
│  │  ├─ utils.ts
│  │  └─ constants.ts
│  │
│  ├─ config/                       # Typed configuration
│  │  ├─ index.ts                   # Config loader with zod validation
│  │  └─ env.ts                     # Environment variable schema
│  │
│  └─ components/                   # React components
│     ├─ ui/                        # Reusable UI components
│     └─ features/                  # Feature-specific components
│
├─ prisma/
│  └─ schema.prisma                 # Database schema
│
├─ public/
│  ├─ status/
│  │  └─ version.json               # ✓ Single source of runtime truth
│  │
│  ├─ evidence/
│  │  ├─ compliance/YYYY-MM-DD/     # Daily compliance packs
│  │  │  ├─ branch-protection.json
│  │  │  ├─ smoke.md
│  │  │  ├─ workflows-grep.txt
│  │  │  ├─ npm-audit.json
│  │  │  ├─ scra-verification.md
│  │  │  └─ dev-team-report.md
│  │  │
│  │  └─ verify/<shortSHA>/         # Per-commit verification bundles
│  │     ├─ metadata.json
│  │     ├─ lighthouse/local/
│  │     └─ probes/
│  │
│  └─ assets/                       # Images, static files
│
├─ tests/
│  ├─ unit/                         # Unit tests (Jest/Vitest)
│  ├─ integration/                  # API integration tests
│  └─ e2e/                          # End-to-end tests (Playwright)
│
├─ scripts/
│  ├─ smoke-local.sh                # Curls + jq → smoke.md
│  ├─ branch-protection-dump.ts     # Fetch & store branch-protection.json
│  ├─ verify-version.ts             # Assert version.json ciStatus === "green"
│  └─ evidence-pack.ts              # Assemble evidence into canonical paths
│
├─ docs/
│  ├─ INDEX.md                      # Documentation index
│  ├─ GOVERNANCE.md                 # Dual-consensus, gates
│  ├─ ARCHITECTURE.md               # This file
│  ├─ RUNBOOK_LOCAL.md              # Local operations
│  ├─ VERIFICATION_GATE.md          # Quality gates
│  └─ SECURITY.md                   # Security policy
│
├─ .github/
│  └─ workflows/
│     └─ ci-local.yml               # Build, lint, typecheck, test, coverage
│
├─ middleware.ts                    # Next.js middleware (headers, CSP)
├─ .nvmrc
├─ .npmrc
├─ package.json
├─ next.config.ts
├─ tsconfig.json
├─ eslint.config.mjs
├─ .prettierignore
├─ .gitignore
└─ README.md
```

---

## Boundaries & Responsibilities

### `/app` - Next.js App Router
- **Purpose:** UI pages and API routes
- **Rules:**
  - API routes in `app/api/*/route.ts`
  - UI pages in `app/(ui)/` or root
  - Minimal logic - delegate to `src/server/services`
  - Client-safe imports only from `src/lib` and `src/components`

### `/src/server` - Server-Only Code
- **Purpose:** Business logic, database access, external integrations
- **Rules:**
  - NEVER imported by client components
  - Uses `server-only` package to enforce
  - Database access ONLY through `src/server/db`
  - All side effects (DB writes, API calls) go here

### `/src/lib` - Shared Utilities
- **Purpose:** Client-safe pure functions
- **Rules:**
  - No Node.js APIs
  - No database access
  - No environment variables (use `src/config`)
  - Must work in browser

### `/src/config` - Configuration
- **Purpose:** Centralized, validated configuration
- **Rules:**
  - Zod schema validation
  - Environment variable parsing
  - Type-safe exports
  - No defaults that enable network egress

### `/src/components` - React Components
- **Purpose:** Reusable UI components
- **Rules:**
  - Client or server components explicitly marked
  - Props validated with TypeScript
  - No direct database access
  - Use server actions for mutations

### `/public` - Static Assets & Evidence
- **Purpose:** Files served as-is
- **Rules:**
  - `/public/status/version.json` - Runtime metadata (CI-written)
  - `/public/evidence/compliance/` - Daily compliance packs
  - `/public/evidence/verify/` - Per-commit verification
  - No secrets, no PII

### `/tests` - Test Files
- **Purpose:** Automated testing
- **Rules:**
  - Unit tests in `tests/unit/`
  - Integration tests in `tests/integration/`
  - E2E tests in `tests/e2e/`
  - Coverage threshold enforced in CI

### `/scripts` - Build & Operations
- **Purpose:** Automation scripts
- **Rules:**
  - Idempotent where possible
  - Output to `/public/evidence/` only
  - No secrets in scripts
  - Documented in `docs/RUNBOOK_LOCAL.md`

---

## Data Flow

### Health Check Request
```
GET /api/healthz
  → app/api/healthz/route.ts
    → src/server/checks/health.ts
      → src/server/db/index.ts (DB check)
    ← { ok: true, service: "web" }
  ← 200 OK + headers
```

### Synthient Training Request
```
POST /api/synthients/[id]/train
  → app/api/synthients/[id]/train/route.ts
    → src/server/services/training.ts
      → src/server/db/index.ts (Prisma)
        → UPDATE synthients, INSERT trainingRuns
    ← { started: true, runId: "..." }
  ← 201 Created + headers
```

### Proposal Vote
```
POST /api/proposals/[id]/vote
  → app/api/proposals/[id]/vote/route.ts
    → src/server/services/proposals.ts
      → src/server/db/index.ts (Prisma)
        → INSERT votes, UPDATE proposals
    ← { voteId: "...", status: "approved" }
  ← 201 Created + headers
```

---

## Security Boundaries

### Headers (Enforced via Middleware)
```typescript
// middleware.ts
Content-Security-Policy: default-src 'self'
Referrer-Policy: no-referrer
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Cache-Control: no-store (for API routes)
```

### Environment Variables
- **Never** hardcode secrets
- All env vars validated via `src/config/env.ts` (Zod schema)
- CI fails if required vars missing
- `.env.local` gitignored, `.env.local.example` provided

### Database Access
- **Only** through `src/server/db/index.ts`
- Prisma ORM (prevents SQL injection)
- Row-level security via Prisma queries
- No raw SQL without explicit review

### API Routes
- All inputs validated (Zod or TypeScript)
- Rate limiting planned (future)
- CORS restricted to same-origin
- No eval, no new Function

---

## Evidence & Compliance

### Status File (Single Source of Truth)
**Path:** `/public/status/version.json`

**Schema:**
```json
{
  "phase": "v1.0.1",
  "commit": "<shortSHA>",
  "ciStatus": "green",
  "buildTime": "<ISO8601>"
}
```

**Written by:** CI on successful merge  
**Read by:** `/api/status` endpoint, monitoring scripts

### Compliance Packs
**Path:** `/public/evidence/compliance/YYYY-MM-DD/`

**Required Files:**
- `branch-protection.json` - GitHub API dump
- `smoke.md` - Localhost test outputs
- `workflows-grep.txt` - Proof of single workflow
- `npm-audit.json` - Security audit results
- `scra-verification.md` - SCRA review
- `dev-team-report.md` - Dev team summary

### Verification Bundles
**Path:** `/public/evidence/verify/<shortSHA>/`

**Contents:**
- `metadata.json` - Commit, date, tool versions
- `lighthouse/local/*.html` - Lighthouse reports
- `probes/*.md` - Curl outputs with headers

---

## CI/CD Pipeline

### Workflow: `ci-local.yml`
**Triggers:** PR to main, push to main  
**Jobs:** `ci-local` (renamed from `build-test`)

**Steps:**
1. `npm ci` - Install dependencies
2. `npx prisma generate` - Generate Prisma Client
3. `npm run lint` - ESLint (with security plugin)
4. `npm run typecheck` - TypeScript strict mode
5. `npm run test -- --coverage` - Jest/Vitest with coverage threshold
6. `npm run build` - Next.js production build
7. `node scripts/verify-version.ts` - Assert `ciStatus === "green"`

**Artifacts:**
- Coverage report (uploaded)
- `smoke.md` (if generated)

**Gates:**
- All steps must pass
- Coverage >= baseline (defined in `package.json`)
- No TypeScript errors
- No ESLint errors

---

## TypeScript Configuration

### Strict Mode (tsconfig.json)
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true
  }
}
```

### Path Aliases
```json
{
  "paths": {
    "@/*": ["./*"],
    "@/server/*": ["./src/server/*"],
    "@/lib/*": ["./src/lib/*"],
    "@/components/*": ["./src/components/*"]
  }
}
```

---

## ESLint Configuration

### Security Rules
```javascript
{
  "extends": [
    "next/core-web-vitals",
    "plugin:security/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "no-eval": "error",
    "no-new-func": "error",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

---

## Deletion Criteria

### Safe to Delete
1. **Cloud Infrastructure**
   - `functions/**` - Cloudflare Functions
   - `infra/**` - Worker configurations
   - `_headers`, `_routes.json` - Cloudflare Pages config
   - `wrangler.toml` (already archived)

2. **Duplicate Code**
   - Legacy API endpoints (if duplicated in App Router)
   - Unused helper functions
   - Example/template files not referenced in docs

3. **Mock Data** (outside `tests/`)
   - In-memory stores
   - Fake data generators
   - Stub implementations

4. **Obsolete Scripts**
   - Deploy scripts (cloud-specific)
   - Legacy build scripts
   - Unused automation

5. **Legacy Workflows**
   - Already archived in `archive/2025-10/workflows/`

---

## Migration Strategy

### Phase 1: Preparation (This Document)
- ✅ Document current state
- ✅ Define target structure
- ✅ Identify deletions

### Phase 2: Structure Application
- Create `src/` directory structure
- Move code to appropriate locations
- Delete cloud remnants

### Phase 3: API Consolidation
- Audit all API endpoints
- Remove duplicates
- Ensure single source per endpoint

### Phase 4: Config Hardening
- Create `src/config/` with Zod validation
- Add `middleware.ts` for headers
- Tighten TypeScript/ESLint

### Phase 5: Evidence Canonicalization
- Implement `scripts/*.ts`
- Regenerate evidence in canonical paths
- Remove scattered evidence files

### Phase 6: CI Gates
- Rename job to `ci-local`
- Add coverage threshold
- Add version verification step

### Phase 7: Verification
- Run full test suite
- Generate verification bundle
- Update GOVERNANCE.md

### Phase 8: Documentation Sync
- Update README.md
- Update RUNBOOK_LOCAL.md
- Update VERIFICATION_GATE.md

---

## Acceptance Criteria

### Endpoints
- ✅ `curl /api/healthz` → 200 OK, `{ok:true}`
- ✅ `curl /api/readyz` → 200 OK, `{ready:true}`
- ✅ Headers include: `application/json`, `no-store`, `nosniff`, `inline`

### Status File
- ✅ `jq -e '.ciStatus=="green"' public/status/version.json`
- ✅ Commit SHA matches `git rev-parse --short HEAD`

### Tree Hygiene
- ✅ No cloud artifacts: `git ls-files | grep -E '(_headers|wrangler|functions/)' → empty`
- ✅ All imports resolve
- ✅ No unused files (detected by linter)

### CI
- ✅ Job named `ci-local`
- ✅ Coverage threshold enforced
- ✅ All gates passing

### Evidence
- ✅ Compliance pack exists for current date
- ✅ Verification bundle exists for current commit
- ✅ All required files present

---

## Rationale

### Why `/src`?
- **Separation of Concerns** - Clear boundary between App Router and business logic
- **Import Safety** - `src/server` enforces server-only code
- **Scalability** - Easier to navigate as codebase grows

### Why Single Runtime?
- **Simplicity** - No cloud configuration, no deploy complexity
- **Reproducibility** - Same setup on any machine
- **Security** - Smaller attack surface, no cloud misconfigurations

### Why Evidence Canonicalization?
- **Auditability** - One place to find all compliance artifacts
- **Automation** - Scripts can reliably write to known paths
- **Truth-to-Repo** - Evidence matches repository state

### Why Strict TypeScript?
- **Safety** - Catch errors at compile time
- **Maintainability** - Self-documenting code
- **Refactoring** - Confidence when making changes

---

## Next Steps

Per CTO directive: Proceed with T2-T8 to normalize repository structure.

---

**Document Version:** 1.0  
**Author:** Dev Team  
**Approved:** CTO  
**Date:** 2025-10-07
