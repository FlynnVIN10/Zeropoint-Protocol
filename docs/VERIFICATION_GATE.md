# Verification Gate - Local Runtime
**Per CTO directive: Local-first verification and compliance checks**

---

## Purpose

Define machine-checkable verification gates for Zeropoint Protocol's local runtime to ensure dual-consensus integrity, security, and quality standards.

---

## Scope

**Everything runs on localhost.** GitHub is code storage only.

**CI is build/test only.** No deploy or cloud workflows.

**Evidence lives in /public/\*\*.** Verified against localhost endpoints.

---

## Verification Gate Checklist

### 1. Endpoint Health (REQUIRED)

**Endpoints must return 200 OK:**

```bash
# Health check
curl -sS http://localhost:3000/api/healthz | jq .

# Expected:
{
  "ok": true,
  "service": "web",
  "now": "2025-10-07T..."
}
```

```bash
# Readiness check
curl -sS http://localhost:3000/api/readyz | jq .

# Expected:
{
  "ready": true,
  "checks": { "db": true },
  "now": "2025-10-07T..."
}
```

**Requirements:**
- ✅ Status code: 200
- ✅ Content-Type: application/json; charset=utf-8
- ✅ Headers: X-Content-Type-Options: nosniff
- ✅ Headers: Cache-Control: no-store

**Gate:** ❌ **FAIL** if any endpoint returns non-200 or missing headers

---

### 2. CI/CD Status (REQUIRED)

**CI must be green with required checks passing:**

```bash
# Check latest workflow run
gh run list --branch main --limit 1

# Check specific workflow
gh run view --log | grep "ci-local"
```

**Required Checks:**
- ✅ Install dependencies
- ✅ Generate Prisma Client
- ✅ Type check (`npm run typecheck`)
- ✅ Lint (`npm run lint`)
- ✅ Build (`npm run build`)
- ✅ No deploy commands verification

**Gate:** ❌ **FAIL** if CI not green or any check fails

---

### 3. Evidence Alignment (REQUIRED)

**Status file must exist and align with repo:**

```bash
cat public/status/version.json | jq -r '.phase,.commit,.ciStatus,.buildTime'
```

**Expected Fields:**
- `phase`: "Dev" (local mode)
- `commit`: Current HEAD SHA or "local"
- `ciStatus`: "green" (after CI runs) or "local"
- `buildTime`: ISO 8601 timestamp

**Verification:**
```bash
# Current commit
git rev-parse --short HEAD

# Compare with version.json
cat public/status/version.json | jq -r '.commit'
```

**Gate:** ⚠️ **WARN** if misaligned (acceptable in local dev)

---

### 4. Lighthouse Local (REQUIRED)

**Accessibility and Performance standards:**

```bash
# Run Lighthouse on localhost
npx lighthouse http://localhost:3000 \
  --only-categories=accessibility,performance \
  --output=json \
  --output-path=./public/evidence/lighthouse-local/report.json

# Check scores
cat public/evidence/lighthouse-local/report.json | jq '.categories.accessibility.score * 100'
cat public/evidence/lighthouse-local/report.json | jq '.categories.performance.score * 100'
```

**Requirements:**
- ✅ Accessibility ≥ 95
- ✅ Performance ≥ 80

**Gate:** ❌ **FAIL** if accessibility < 95

---

### 5. Governance & Consensus (REQUIRED)

**All material changes must have dual-consensus:**

```bash
# Check PR approvals
gh pr view <PR_NUMBER> --json reviews

# Expected:
# - At least 1 CTO/SCRA approval
# - No unresolved change requests
```

**Audit Log:**
- Evidence stored in `/public/evidence/compliance/YYYY-MM-DD/`
- PR linked to compliance report
- Dual-consensus recorded

**Gate:** ❌ **FAIL** if missing approvals or evidence

---

### 6. Security Headers (Local Dev) (REQUIRED)

**Headers must be present even on localhost:**

```bash
curl -I http://localhost:3000/ | grep -E "Content-Security|Referrer|nosniff"
```

**Expected Headers:**
- `Content-Security-Policy`: Restrictive
- `Referrer-Policy: no-referrer`
- `X-Content-Type-Options: nosniff`
- `Cache-Control: no-store` (for sensitive routes)

**Note:** May require Express middleware or Next.js middleware for local enforcement

**Gate:** ⚠️ **WARN** if headers missing (dev acceptable, prod required)

---

### 7. No Mocks in Production (REQUIRED)

**When MOCKS_DISABLED=1:**

```bash
# Check environment
cat .env.local | grep MOCKS_DISABLED

# Verify endpoints don't return mock data
curl -s http://localhost:3000/api/healthz | jq '.ok'
```

**Requirements:**
- If `MOCKS_DISABLED=1`, no endpoints return fabricated/mock data
- All mock endpoints return 503 with compliance message

**Gate:** ❌ **FAIL** if mocks leak when disabled

---

### 8. Database Readiness (REQUIRED)

**SQLite database must be operational:**

```bash
# Check database file exists
ls -lh dev.db

# Check migrations applied
npx prisma migrate status

# Check seed data
npx prisma studio
# OR query directly:
# SELECT COUNT(*) FROM Synthient;  -- Should be ≥2
# SELECT COUNT(*) FROM Proposal;   -- Should be ≥1
```

**Requirements:**
- ✅ dev.db file exists
- ✅ Migrations up to date
- ✅ Seed data present

**Gate:** ❌ **FAIL** if database missing or migrations pending

---

### 9. Secret Scanning (REQUIRED)

**No secrets in repository:**

```bash
# Check for .env files
git ls-files | grep "\.env"

# Expected: Only .env.local.example

# Check for keys/certs
git ls-files | grep -E "\.pem$|\.key$"

# Expected: None

# Check for backup files
git ls-files | grep "\.backup\."

# Expected: None
```

**Banned Patterns:**
- `.env*` (except `.env.local.example`)
- `*.pem`, `*.key`
- `*.backup.*`
- `id_rsa`, `credentials`

**Gate:** ❌ **FAIL** if any secrets found

---

### 10. Coverage Baseline (REQUIRED)

**Test coverage must meet baseline:**

```bash
# Run tests with coverage
npm test -- --coverage

# Check coverage thresholds
# (Baseline TBD - currently minimal tests)
```

**Requirements:**
- ✅ Coverage ≥ baseline (TBD)
- ✅ No failing tests

**Gate:** ⏳ **PENDING** (tests to be implemented)

---

## Canonical Evidence Paths

### Status
```
/public/status/version.json
```

**Required Fields:**
```json
{
  "phase": "Dev",
  "commit": "<shortSHA>",
  "ciStatus": "green",
  "buildTime": "YYYY-MM-DDTHH:MM:SSZ"
}
```

### Build Provenance
```
/public/evidence/verify/<shortSHA>/
  ├── metadata.json
  └── lighthouse/
      └── report.json
```

### Compliance Reports
```
/public/evidence/compliance/YYYY-MM-DD/
  ├── report.md
  ├── post-migration-verification.md
  └── [other audits].md
```

---

## Daily Localhost Probes (09:00 CDT)

**Automated Script (Future):**
```bash
#!/bin/bash
# scripts/daily-probe.sh

DATE=$(date +%Y-%m-%d)
EVIDENCE_DIR="public/evidence/compliance/${DATE}"
mkdir -p "${EVIDENCE_DIR}"

# Start server if not running
lsof -ti:3000 || npm run dev &
sleep 5

# Probe endpoints
echo "## Daily Localhost Probe - ${DATE}" > "${EVIDENCE_DIR}/probe.md"
echo "" >> "${EVIDENCE_DIR}/probe.md"

echo "### Healthz" >> "${EVIDENCE_DIR}/probe.md"
curl -sS http://localhost:3000/api/healthz | jq . >> "${EVIDENCE_DIR}/probe.md"

echo "### Readyz" >> "${EVIDENCE_DIR}/probe.md"
curl -sS http://localhost:3000/api/readyz | jq . >> "${EVIDENCE_DIR}/probe.md"

echo "### Version" >> "${EVIDENCE_DIR}/probe.md"
cat public/status/version.json | jq . >> "${EVIDENCE_DIR}/probe.md"

# Commit evidence
git add "${EVIDENCE_DIR}/probe.md"
git commit -m "evidence: daily probe ${DATE}"
```

---

## Workflow Requirements

### Allowed Workflows

**ci-local.yml ONLY** for builds:
- Install deps (`npm ci`)
- Generate Prisma Client
- Type check
- Lint
- Build
- **NO DEPLOY**

**security.yml** for scanning:
- CodeQL SAST
- Dependency Review
- NPM audit
- **NO DEPLOY**

**quality-gates.yml** for quality:
- Lint (max-warnings=0)
- Type check
- Coverage (when implemented)
- **NO DEPLOY**

**release.yml** for versioning:
- Semantic release (tag + CHANGELOG)
- **NO DEPLOY**

### Forbidden

- ❌ Any workflow with `wrangler`
- ❌ Any workflow with `cloudflare`
- ❌ Any workflow with `pages deploy`
- ❌ Any workflow uploading to cloud
- ❌ Any workflow requiring cloud secrets

**Enforcement:**
```yaml
# In ci-local.yml
- name: Verify no deploy steps
  run: |
    if grep -r "wrangler\|cloudflare\|pages deploy" .github/workflows/*.yml; then
      echo "❌ Deploy steps found in workflows"
      exit 1
    fi
```

---

## Branch Protection (GitHub Settings)

**Required for main branch:**
- ✅ Require pull requests
- ✅ Require at least 1 approval (CTO or SCRA)
- ✅ Require status checks:
  - `build-test` (from ci-local.yml)
- ✅ Dismiss stale reviews on new commits
- ✅ Block force pushes
- ✅ Block deletions
- ❌ No bypass allowed

---

## Failure Policy

### Two Consecutive Gate Failures

**Triggers:**
1. CI fails twice in a row on main
2. Localhost healthz fails twice
3. Security scan finds critical issues twice
4. Coverage drops below baseline twice

**Actions:**
1. Auto-open P0 issue
2. Freeze merges to main
3. 5-line summary to CTO:
   - Root cause
   - Impact
   - Owner
   - Rollback plan
   - Evidence links

**Resolution:**
- Fix verified by passing all gates
- CTO approval to unfreeze

---

## Truth-to-Repo Policy

### Requirements

**All claims must map to:**
- Repo-anchored evidence
- Machine-checkable outputs
- Localhost-verifiable endpoints

**Build fails if:**
- `ciStatus !== "green"` (in production)
- Evidence files missing
- Endpoint checks fail

**Examples:**

✅ **Good:**
- "Build passed" → Link to CI run with green checkmarks
- "A11y score 96" → Link to Lighthouse JSON artifact
- "2 synthients exist" → `curl localhost:3000/api/synthients | jq length`

❌ **Bad:**
- "Build passed" → No CI link
- "A11y score 96" → Screenshot only
- "2 synthients exist" → Manual claim without query

---

## SCRA Verification Cadence

### Per-Merge Gate (Automatic)
- ✅ Run after every merge to main
- ✅ File compliance report
- ✅ Verify all gates pass

### Daily Localhost Probe (09:00 CDT)
- ✅ Automated curl checks
- ✅ Store in `/public/evidence/compliance/YYYY-MM-DD/`
- ✅ Commit evidence

### Pre-Release Full Audit
- ✅ Before any version tag
- ✅ Comprehensive gate check
- ✅ Documentation review
- ✅ Security scan results

### Post-Report Reconciliation
- ✅ After CTO/SCRA directives
- ✅ Verify Dev Team actions
- ✅ Check evidence updated
- ✅ Close audit loop

---

## Integration with Existing Processes

### With CI/CD
- CI workflow triggers SCRA verification
- CI artifacts linked in compliance reports
- CI failures trigger SCRA escalation

### With Development
- PR opened → SCRA reviews for compliance
- PR merged → SCRA runs verification gate
- Issues found → SCRA tags Dev owners

### With CTO
- CTO directive → SCRA monitors execution
- CTO requests audit → SCRA delivers report
- CTO needs evidence → SCRA provides links

---

## Example Verification Report Format

```markdown
# Compliance Report - YYYY-MM-DD
Per CTO directive: Post-merge verification

## Summary (≤10 lines)
Merge <SHA> to main verified. All gates passing. No issues found.

## Findings
✅ Endpoints: 200 OK
✅ CI: Green (all checks passed)
✅ Evidence: Aligned
✅ Lighthouse: A11y 97, Perf 85
✅ Governance: Dual-consensus recorded

## Evidence Links
- CI Run: https://github.com/.../actions/runs/...
- Healthz: { "ok": true, ... }
- Version: { "phase": "Dev", "commit": "abc123", ... }

## Risks
None identified.

## Recommendations
Continue current practices.

## Owners
N/A
```

---

## Red-Team Focus Areas

### 1. Consensus Bypass
- Check for unilateral code paths
- Verify all material changes have approvals
- Look for "emergency" override mechanisms

### 2. Secret Leakage
- Scan for hardcoded credentials
- Check .gitignore coverage
- Verify .env* files excluded

### 3. Dependency Supply Chain
- npm audit results
- Outdated packages
- Known vulnerabilities

### 4. Data Handling
- PII in logs or evidence
- Token/ID redaction
- Database query safety (Prisma helps)

### 5. Headers/CSP
- CSP configuration
- Missing security headers
- localhost enforcement

### 6. Build Provenance
- Commit → artifact traceability
- Evidence SHA alignment
- Version.json accuracy

### 7. Documentation Truth
- Claims match localhost reality
- Dead links
- Outdated instructions

---

## Acceptance for SCRA Function

**100% Compliance:**
- ✅ Every merge has compliance report
- ✅ All claims reconciled to local evidence ≤24h
- ✅ Zero undisclosed capability deltas

**Evidence:**
- Reports in `/public/evidence/compliance/`
- Localhost probe outputs
- CI artifact links

---

## Quick Reference Commands

### Pre-Merge Verification
```bash
# 1. Build & Test
npm ci
npx prisma generate
npm run typecheck
npm run lint
npm run build

# 2. Start server
npm run dev

# 3. Smoke tests (in another terminal)
curl -sS http://localhost:3000/api/healthz | jq .
curl -sS http://localhost:3000/api/readyz | jq .

# 4. Evidence check
cat public/status/version.json | jq .

# 5. Secret scan
git ls-files | grep -E "\.env$|\.pem$|\.key$|\.backup\."
```

### Post-Merge Verification
```bash
# 1. Pull latest
git pull origin main

# 2. Rebuild
npm ci
npx prisma migrate dev
npm run seed
npm run build

# 3. Verify
npm run dev
curl -sS http://localhost:3000/api/healthz | jq .

# 4. Generate compliance report
# (Manual for now, automated in future)
```

---

## Escalation Criteria

### Open P0 and Freeze Merges If:

1. **Two consecutive CI failures** on main
2. **Two consecutive healthz failures** at localhost
3. **Critical security issue** found twice
4. **Coverage drop** below baseline twice
5. **Secret detected** in repo
6. **Undisclosed capability** reaches localhost

**Summary to CTO (5 lines):**
```
Root cause: <one sentence>
Impact: <one sentence>
Owner: <name>
Rollback: <command or "not needed">
Evidence: <link to CI run, issue, or artifact>
```

---

## Future Enhancements

### Automated Daily Probes
- Cron job or GitHub Actions (schedule)
- Store results in `/public/evidence/compliance/`
- Alert on failures

### Lighthouse CI
- Run on every PR
- Comment with scores
- Block merge if A11y < 95

### Evidence Automation
- Auto-generate compliance reports
- Link CI runs to evidence files
- Version alignment checks

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-07  
**Author:** Dev Team (per CTO directive)  
**Status:** Canonical verification gate for local runtime

---

*This gate ensures dual-consensus integrity, security, and quality for all changes to Zeropoint Protocol's local runtime.*

