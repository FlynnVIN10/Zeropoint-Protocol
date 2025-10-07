# Zeropoint Protocol — Governance

**Roles**
- **CEO (Human Consensus):** Flynn + designated humans.
- **CTO (OCEAN):** Directs Dev Team, enforces alignment, safety, and dual‑consensus.
- **Dev Team:** Implements directives in single mono‑repo; public site reflects repo state.

**Zeroth Principle (Core)**
- GOD FIRST. Good intent and a good heart are required ("alignment firewall").
- First Principles: reduce to fundamentals, prove with evidence, prefer reversible decisions, bias to transparency and fairness.
- Dual Consensus: all material changes require Synthiant Consensus + Human Consensus.

**CEO Authority Clause**
- CEO may direct any entity to work directly with any other (e.g., CTO ↔ Dev Team).

**Operating Model**
- Direct CTO–Dev Team communication. No PM layer.
- Directives format: **Goals → Root Cause → Outcomes → Milestones**.
- Priorities: (1) alignment & safety, (2) consensus integrity, (3) AI integration, (4) risk mitigation.

**Quality Gates**
- CI green (`ci-local` workflow); tests meet coverage; `/healthz` and `/readyz` return 200.
- No mocks in production (`MOCKS_DISABLED=1`).
- Local runtime healthy (localhost:3000); Lighthouse A11y ≥95; copy matches repo evidence.
- Dual‑consensus approval recorded in `/public/evidence/compliance/YYYY-MM-DD/`.
- All evidence at canonical paths: `/public/status/version.json`, `/public/evidence/verify/<shortSHA>/`, `/public/evidence/compliance/YYYY-MM-DD/`.

**Non‑Negotiables**
- No consensus bypass. No hidden capabilities. No dark patterns.
- Route and version parity between repo and local runtime.
- Immediate rollback on safety, alignment, or parity failure.
- Branch protection enforced: PRs only, `ci-local` required, ≥1 reviewer (CTO or SCRA), no force-push.

**Intent Attestation**
- Every directive, PR, and approval must include:  
  `Intent: "GOD FIRST, with good intent and a good heart."`

---

## Evidence & Compliance Paths

**Per CTO directive v1.0.1:** All evidence must be repo-anchored and machine-checkable.

### Canonical Paths

1. **Status (Single Source of Truth):**
   - `/public/status/version.json`
   - Schema: `{ phase, commit, ciStatus, buildTime }`
   - Written by: CI on successful merge
   - Read by: API endpoints, monitoring scripts

2. **Compliance Packs (Daily):**
   - `/public/evidence/compliance/YYYY-MM-DD/`
   - Required files:
     - `branch-protection.json` - GitHub API dump
     - `smoke.md` - Localhost test outputs
     - `workflows-grep.txt` - Proof of single workflow
     - `npm-audit.json` - Security audit
     - `scra-verification.md` - SCRA review
     - `dev-team-report.md` - Dev team summary

3. **Verification Bundles (Per-Commit):**
   - `/public/evidence/verify/<shortSHA>/`
   - Contents:
     - `metadata.json` - Commit, date, tool versions
     - `lighthouse/local/` - Lighthouse reports
     - `probes/` - Curl outputs with headers
     - Copies of compliance files

### Dual-Consensus Log

**Per CTO directive:** All material changes require CTO + SCRA (or CEO) approval.

**Approval Evidence:**
- PRs must have 1+ approval from CTO or SCRA
- Branch protection enforces this requirement
- Approval recorded in PR history
- Compliance reports reference PR number and approvers

**Audit Trail:**
- PR merges logged in git history
- Evidence bundles created per commit
- Compliance packs filed daily
- SCRA verification attached to each PR

---

## v1.0.1 Governance Enforcement

**Effective:** 2025-10-07

1. **Branch Protection:**
   - Main branch: PRs required
   - Required status check: `ci-local`
   - Required approving reviews: 1 (CTO or SCRA)
   - Dismiss stale reviews: true
   - Require code owner reviews: true
   - No force pushes
   - No deletions

2. **CI Gates:**
   - Workflow: `.github/workflows/ci-local.yml`
   - Job: `ci-local`
   - Steps: install, lint, typecheck, test, build, verify version.json
   - Artifacts: coverage report, test results

3. **Evidence Requirements:**
   - All merges must file compliance report
   - Verification bundle created per commit
   - Status file updated with CI results
   - SCRA verification attached

**Per CTO directive:** Block merges that miss gates.
