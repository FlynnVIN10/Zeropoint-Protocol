# Zeropoint Protocol - Documentation Index

**Last Updated:** 2025-10-07 (CI-managed)  
**Repository:** https://github.com/FlynnVIN10/Zeropoint-Protocol  
**Platform:** https://zeropointprotocol.ai

---

## 📋 Authoritative Documentation

This index lists all canonical documentation files for Zeropoint Protocol. Documents marked with ✅ are actively maintained and CI-updated where applicable.

### Core Documentation ✅

| Document | Purpose | CI-Updated | Location |
|----------|---------|------------|----------|
| `README.md` | Project overview, quick start | Stage, Commit, Services | `/README.md` |
| `GOVERNANCE.md` | Dual-consensus governance rules | No | `/GOVERNANCE.md` |
| `EXECUTIVE_SUMMARY.md` | High-level platform summary | No | `/EXECUTIVE_SUMMARY.md` |
| `DEPLOYMENT.md` | Single source for deployment | Yes (provenance footer) | `/DEPLOYMENT.md` |
| `PM_RULESET.md` | PM execution directives | No | `/PM_RULESET.md` |
| `CODEOWNERS` | Code ownership assignments | No | `/CODEOWNERS` |

### Technical Documentation ✅

| Document | Purpose | Location |
|----------|---------|----------|
| `ARCHITECTURE.md` | System architecture overview | `/docs/ARCHITECTURE.md` |
| `CONTRIBUTING.md` | Contribution guidelines | `/docs/CONTRIBUTING.md` |
| `SECURITY.md` | Security policies & procedures | `/docs/SECURITY.md` |
| `STATUS_ENDPOINTS.md` | Health/readiness/version API specs | `/docs/STATUS_ENDPOINTS.md` |

### Operational Guides ✅

| Document | Purpose | Location |
|----------|---------|----------|
| `RUN_LOCAL_TRAINING.md` | Local training setup | `/docs/RUN_LOCAL_TRAINING.md` |
| `automated-evidence-generation.md` | Evidence automation | `/docs/automated-evidence-generation.md` |
| `ci-trigger.md` | CI/CD trigger documentation | `/docs/ci-trigger.md` |

### Governance & Compliance ✅

| Document | Purpose | Location |
|----------|---------|----------|
| `governance-log.md` | Governance decision log | `/docs/governance-log.md` |
| `governance/dual-consensus.md` | Dual-consensus specification | `/docs/governance/dual-consensus.md` |
| `governance/verification-gates.md` | Quality gate definitions | `/docs/governance/verification-gates.md` |

### Reports & Status ✅

| Document | Purpose | CI-Updated | Location |
|----------|---------|------------|----------|
| `PLATFORM_STATUS_REPORT.md` | Current platform status | No | `/PLATFORM_STATUS_REPORT.md` |
| `reports/SCRA_FULL_REPOSITORY_AUDIT_2025-10-07.md` | Latest SCRA audit | No | `/reports/SCRA_FULL_REPOSITORY_AUDIT_2025-10-07.md` |
| `reports/PM_STATUS_REPORT_CURRENT.md` | PM status tracking | No | `/reports/PM_STATUS_REPORT_CURRENT.md` |

### License & Legal ✅

| Document | Purpose | Location |
|----------|---------|----------|
| `LICENSE.md` | Main license | `/license/LICENSE.md` |
| `LEGAL.md` | Legal framework | `/license/LEGAL.md` |
| `CLA.md` | Contributor License Agreement | `/license/CLA.md` |
| `ZAA.md` | Zero-knowledge Authentication Agreement | `/license/ZAA.md` |

---

## 📊 CI-Generated Artifacts

These paths are **exclusively written by CI**. Manual edits are not permitted.

### Version & Status

| Artifact | CI Workflow | Location |
|----------|-------------|----------|
| `/public/status/version.json` | `deploy.yml` | Current commit, buildTime, phase, env |
| `/public/build-info.json` | `build-with-evidence.yml` | Build metadata |

### Evidence

| Artifact | Pattern | Purpose |
|----------|---------|---------|
| `/public/evidence/verify/<shortSHA>/` | Per-commit | Verification artifacts per deployment |
| `/evidence/ci/ci-build-meta.json` | Per-build | CI build metadata |
| `/public/evidence/lighthouse/*.json` | Per-audit | Lighthouse accessibility audits |

---

## 🗄️ Archived Documentation

Legacy and duplicate documents have been archived to maintain repository clarity:

| Archive Path | Contents | Date Archived |
|--------------|----------|---------------|
| `/archive/2025-10/cto_reports/` | Duplicate CTO directive reports | 2025-10-07 |
| `/archive/2025-10/lighthouse_root/` | Root-level lighthouse JSON files | 2025-10-07 |
| `/archive/2025-10/` | ci-build-meta.json, body.json | 2025-10-07 |

---

## 📝 Deprecated Documentation

The following documents are **deprecated** and replaced by canonical versions:

| Deprecated File | Replacement | Reason |
|-----------------|-------------|--------|
| `DEPLOYMENT_INSTRUCTIONS.md` | `DEPLOYMENT.md` | Consolidated |
| `DEPLOYMENT_STATUS.md` | `DEPLOYMENT.md` | Consolidated |
| `CTO_DIRECTIVE_*.md` (duplicates) | Latest canonical report | Multiple overlapping versions |

---

## 🔧 Documentation Maintenance

### Principles

1. **Single Source of Truth:** Each topic has one canonical document
2. **CI-Managed Fields:** Stage, Commit, Services auto-updated by CI
3. **Provenance:** All generated artifacts link back to CI run
4. **Archive, Don't Delete:** Move obsolete docs to `/archive/YYYY-MM/`

### Updating This Index

This index is maintained by the Dev Team and SCRA. To add a new authoritative document:

1. Create/update the document
2. Add entry to appropriate section in this index
3. Mark if CI-updated
4. Include provenance link if applicable
5. Submit via PR with dual-consensus approval

### Contact

- **PM:** See `PM_RULESET.md` for PM contact and responsibilities
- **SCRA:** Synthient Compliance & Research Analyst (automated)
- **CTO:** Executive oversight (via CEO approval)

---

**Index Version:** 1.0  
**Last Audit:** 2025-10-07  
**Next Review:** 2025-11-07 or on major platform changes

---

*This index is maintained to support the Zeroth Principle: truth-to-repo alignment and public transparency.*

