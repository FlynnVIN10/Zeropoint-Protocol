# Comprehensive Repository Audit
**Per CEO/CTO Directive: Systematic file-by-file analysis**

**Date:** 2025-10-07  
**Scope:** 778 files  
**Action:** Analyze, categorize, and handle each file per CTO normalization directive

---

## Audit Summary

**Total Files:** 778 (excluding node_modules, .git, .next)

### By Category

1. **KEEP (Production)** - Core runtime files
2. **ARCHIVE** - Historical artifacts, old reports
3. **DELETE** - Dead code, duplicates, mocks
4. **REFACTOR** - Needs service layer migration
5. **REVIEW** - Uncertain, needs deeper analysis

---

## Directory-by-Directory Analysis

### ✅ `/app` - Next.js App Router (KEEP + REFACTOR)

**Status:** Partially normalized

**Findings:**
- 48 API route files
- Many legacy endpoints (ai/ethics, quantum/compute, ml/pipeline, wondercraft, etc.)
- Only 6 routes refactored to use service layer
- 42 routes still have direct DB access or mocks

**Actions:**
1. **KEEP (6):** healthz, readyz, synthients, proposals (already refactored)
2. **DELETE (30+):** Mock/stub routes per SCRA audit findings
   - `ai/ethics/` - Mock ethical oversight
   - `ai/models/` - Mock model registry
   - `ai/reasoning/` - Mock reasoning engine
   - `ml/pipeline/` - Mock ML pipeline
   - `quantum/compute/` - Mock quantum jobs
   - `audit/log/` - In-memory audit (not persistent)
   - `events/**` - Event logging (in-memory)
   - `enterprise/**` - Enterprise features (not in scope)
   - `network/instances/` - Network instances (static)
   - `router/**` - Legacy router (superseded)
   - `security/monitoring/` - Mock monitoring
   - `training/metrics/` - Mock metrics
   - `training/status/` - Mock training status
   - `wondercraft/**` - Mock wondercraft integration
   - `tinygrad/**` - Mock tinygrad integration
   - `petals/**` - Mock petals integration (keep consensus, delete others)
   - `providers/**` - Mock provider endpoints

3. **REFACTOR (3):** Legitimate endpoints needing service layer
   - `consensus/**` - Keep, needs service layer
   - `governance/approval/` - Keep, needs service layer
   - `auth/login/` - Review (may not be needed for local)

**DELETE List (app/api):**
```
app/api/ai/
app/api/audit/
app/api/auth/ (review)
app/api/enterprise/
app/api/events/
app/api/ml/
app/api/network/
app/api/providers/
app/api/quantum/
app/api/router/
app/api/security/
app/api/tinygrad/
app/api/training/
app/api/wondercraft/
app/api/petals/ (except consensus integration)
```

---

### ✅ `/src` - New Structure (KEEP)

**Status:** Newly created, good structure

**Findings:**
- `src/server/db/` ✅ - Prisma client
- `src/server/services/` ✅ - synthients.ts, proposals.ts
- `src/server/checks/` ✅ - health.ts, readiness.ts
- `src/config/` ✅ - env.ts, index.ts
- `src/components/` ✅ - 17 component files
- `src/lib/` ✅ - Empty (ready for utilities)

**Actions:** KEEP ALL

---

### ⚠️ `/components` - Duplicate (DELETE)

**Status:** Superseded by `src/components/`

**Findings:**
- Same files as `src/components/`
- No longer imported (imports updated to `@/components/*`)

**Action:** DELETE entire `/components` directory

---

### ⚠️ `/lib` - Legacy (DELETE)

**Status:** Superseded by `src/server/` and `src/lib/`

**Findings:**
- `lib/db.ts` - Moved to `src/server/db/index.ts`
- `lib/backend/**` - PostgreSQL connection manager (not used in SQLite)
- `lib/services/**` - Old service clients (not used)
- `lib/utils/**` - Legacy monitoring (not used)
- `lib/evidence/**` - Old evidence builder
- `lib/middleware/**` - Old middleware
- `lib/phase-config.ts`, `lib/feature-flags.ts` - Superseded by `src/config/`

**Action:** DELETE entire `/lib` directory (excluding already moved files)

---

### ⚠️ `/services` - Legacy (DELETE)

**Status:** Superseded by `src/server/services/`

**Findings:**
- `services/router.ts` - Legacy provider router
- `services/**/*.js` - Old service implementations

**Action:** DELETE entire `/services` directory

---

### ⚠️ `/providers` - Legacy (DELETE)

**Status:** Mock AI provider clients (not used in local runtime)

**Findings:**
- `providers/claude.ts`, `providers/gpt.ts`, `providers/grok4.ts`
- `providers/petals.ts`, `providers/tinygrad.ts`, `providers/wondercraft.ts`
- All make external API calls (not needed for local governance runtime)

**Action:** DELETE entire `/providers` directory

---

### ✅ `/prisma` - Database Schema (KEEP)

**Status:** Core database schema

**Findings:**
- `schema.prisma` ✅
- `migrations/` ✅

**Actions:** KEEP ALL

---

### ⚠️ `/public` - Needs Cleanup (MIXED)

**Status:** Mix of canonical evidence and legacy artifacts

**Findings:**

**KEEP:**
- `public/status/version.json` ✅
- `public/evidence/compliance/2025-10-07/` ✅ (latest)
- `public/evidence/verify/<shortSHA>/` ✅ (all commits)

**DELETE:**
- `public/api/**` - Duplicate static API files (not needed, use app/api)
- `public/compliance/` - Old compliance (superseded by public/evidence/compliance/)
- `public/consensus/` - Old consensus files
- `public/petals/`, `public/phase1/`, `public/restart/`, `public/training/`, `public/verify/`, `public/wondercraft/` - Legacy evidence scattered
- `public/js/` - Unused JavaScript
- `public/synthients/` - Old static files
- `public/*.html` - Old monitoring pages (monitor.html, synthients-monitor.html, etc.)

**Action:** Clean up public/ to only contain status/ + evidence/ + assets/ + static files (robots.txt, sitemap.xml)

---

### ⚠️ `/docs` - Reports vs Docs (MIXED)

**Status:** Mix of documentation and reports

**Findings:**

**KEEP (Canonical Docs):**
- `ARCHITECTURE.md` ✅
- `GOVERNANCE.md` ✅ (root level)
- `RUNBOOK_LOCAL.md` ✅
- `VERIFICATION_GATE.md` ✅
- `SECURITY.md` ✅ (root level)
- `CONTRIBUTING.md`
- `STATUS_ENDPOINTS.md`

**ARCHIVE (Historical):**
- `docs/phase2/`, `docs/phase3/` - Phase documentation
- `docs/governance/**` - Old governance docs
- `docs/comms/` - Communication logs
- All other subdirectory docs

**Action:** Keep canonical docs, archive historical to `archive/2025-10/docs/`

---

### ⚠️ ROOT REPORTS (ARCHIVE)

**Status:** Historical reports, superseded by latest

**Findings:**
- Multiple CTO reports
- Multiple platform status reports
- Multiple phase completion reports
- Migration analysis documents
- Cleanup plans

**Count:** ~15 markdown files

**Action:** Archive to `archive/2025-10/reports/`, keep only:
- `README.md` ✅
- `GOVERNANCE.md` ✅
- `SECURITY.md` ✅
- `CODEOWNERS` ✅

---

### ⚠️ `/scripts` - Cleanup Needed (MIXED)

**Status:** Mix of new automation and legacy scripts

**Findings:**

**KEEP (New):**
- `smoke-local.sh` ✅
- `branch-protection-dump.ts` ✅
- `verify-version.ts` ✅
- `evidence-pack.ts` ✅
- `seed.mjs` ✅

**DELETE (Legacy):**
- `apply-compliance-fix.mjs`
- `automated-mock-remediation.mjs`
- `backend-integration-finalization.mjs`
- `build-dynamic-evidence.mjs`
- `build-leaderboard.mjs`
- `capture-headers.sh`
- `check-branch-protection.sh`
- `check-*.mjs` (multiple)
- `classify-*.mjs`
- `deploy-*.sh`
- `generate-*.mjs`
- `inject-*.mjs`
- `shutdown-*.mjs`
- `verify-*.mjs` (except verify-version.ts)
- All Cloudflare/deploy related scripts

**Action:** Delete ~25 legacy scripts, keep 5 essential

---

### ⚠️ `/evidence` - Duplicate (DELETE)

**Status:** Superseded by `/public/evidence/`

**Findings:**
- Duplicate evidence tree
- Same structure as `public/evidence/`
- Per CTO directive: Single evidence location

**Action:** DELETE entire `/evidence` directory

---

### ⚠️ `/tests` vs `/python-tests` (CONSOLIDATE)

**Findings:**
- `tests/` - New structure (unit, integration, e2e subdirs)
- Old `tests/backend-integration.test.ts` at root of tests/
- `python-tests/` - Single Python test file

**Action:**
- KEEP `/tests` structure
- Move `python-tests/test_phase2_integration.py` to `archive/2025-10/`
- Clean up root-level test files

---

### ⚠️ `/monitoring`, `/logs`, `/reports`, `/proposals`, `/directives` (ARCHIVE)

**Status:** Historical operational artifacts

**Action:** Archive to `archive/2025-10/operational/`

---

### ⚠️ Root Config/Build Files (REVIEW)

**Findings:**
- `build.sh`, `deploy.sh` - Cloud deploy scripts
- `body.json`, `ci-build-meta.json` - Ad-hoc artifacts
- `lighthouse-*.json` (8 files) - Already archived
- `synthient-logs.sh` - Legacy logging
- `contributors.txt` - Keep
- `.DS_Store` files - Delete

**Action:**
- DELETE: build.sh, deploy.sh (cloud-specific)
- DELETE: body.json, ci-build-meta.json, synthient-logs.sh
- KEEP: contributors.txt, Makefile (if has local commands)

---

### ✅ Root Configs (KEEP)

**Files:**
- `.github/workflows/ci-local.yml` ✅
- `package.json`, `package-lock.json` ✅
- `tsconfig.json`, `next.config.js` ✅
- `.gitignore`, `.nvmrc`, `.npmrc` ✅
- `wrangler.toml` - Already archived ✅

---

## Action Plan

### Phase 1: Delete Dead Code (Immediate)

```bash
# Delete legacy API mocks (30+ routes)
git rm -r app/api/ai/
git rm -r app/api/audit/
git rm -r app/api/enterprise/
git rm -r app/api/events/
git rm -r app/api/ml/
git rm -r app/api/network/
git rm -r app/api/quantum/
git rm -r app/api/router/
git rm -r app/api/security/
git rm -r app/api/tinygrad/
git rm -r app/api/training/
git rm -r app/api/wondercraft/
git rm -r app/api/providers/

# Delete duplicate directories
git rm -r components/
git rm -r lib/
git rm -r services/
git rm -r providers/
git rm -r evidence/

# Delete legacy scripts (25+)
git rm scripts/apply-compliance-fix.mjs
git rm scripts/automated-mock-remediation.mjs
# ... (all legacy scripts)

# Delete root artifacts
git rm build.sh deploy.sh body.json ci-build-meta.json synthient-logs.sh
```

### Phase 2: Archive Reports & Docs

```bash
mkdir -p archive/2025-10/{reports,docs,operational}

# Archive reports
git mv *_REPORT*.md *_STATUS*.md *_ANALYSIS*.md archive/2025-10/reports/

# Archive legacy docs
git mv docs/{phase2,phase3,governance,comms,ai-dev,templates,ui,services} archive/2025-10/docs/

# Archive operational artifacts
git mv monitoring/ logs/ reports/ proposals/ directives/ archive/2025-10/operational/
git mv python-tests/ archive/2025-10/
```

### Phase 3: Clean Public Directory

```bash
# Delete duplicates and legacy
git rm -r public/api/
git rm -r public/compliance/
git rm -r public/consensus/
git rm -r public/petals/ public/phase1/ public/restart/ public/training/ public/verify/ public/wondercraft/
git rm -r public/js/
git rm -r public/synthients/
git rm public/*.html

# Keep only:
# public/status/
# public/evidence/
# public/robots.txt, sitemap.xml
```

### Phase 4: Verify Structure

```bash
# Should match target layout exactly
ls -1 .
# Expected: app/, src/, prisma/, public/, tests/, scripts/, docs/, .github/, configs
```

---

## Estimated Impact

**Files to Delete:** ~400-500
**Files to Archive:** ~150-200
**Files to Keep:** ~150-200
**Files to Refactor:** ~10-20

**Result:** Cleaner, focused repository (~200 production files)

---

**Per CTO directive:** Proceed systematically, commit frequently, maintain evidence trail.

