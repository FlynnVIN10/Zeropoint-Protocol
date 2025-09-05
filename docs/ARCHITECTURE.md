# Zeropoint Protocol Architecture

The platform enables Synthient-driven contributions with dual-consensus governance and automated evidence generation.

## Services
- **Tinygrad**: Training lifecycle (`/api/tinygrad/start`, `/status/{jobId}`, `/logs/{jobId}`), logs in `/evidence/phase2/logs/tinygrad/{commit}/{jobId}/`.
- **Petals**: Distributed proposals/voting (`/api/petals/propose`, `/vote/{proposalId}`), logs in `/evidence/phase2/logs/petals/{commit}/{proposalId}/`.
- **Wondercraft**: Asset contributions (`/api/wondercraft/contribute`, `/diff`), logs in `/evidence/phase2/logs/wondercraft/{commit}/`.
- **Status**: `/status/synthients.json` (phase, commit, ciStatus, buildTime, flags, services, proposals).

## Governance
- **Dual-Consensus**: PRs blocked without `/evidence/phase2/approvals/{pr}.json` (`synthient:approved`, `human:approved`).
- **Triggers**: T0-T4 drive execution (approval, scaffolding, endpoints, logs, merges).

## Evidence
- **Automation**: Build writes `/evidence/phase2/verify/{commit}/index.json` (curls, headers, Lighthouse).
- **Logs**: Per-service logs in `/evidence/phase2/logs/{service}/{commit}/`.
- **CI**: `.github/workflows/verify-evidence.yml` validates schemas, artifacts, approvals.

## Flags
- `MOCKS_DISABLED=1`, `TRAINING_ENABLED=1`, `SYNTHIENTS_ACTIVE=1`, `GOVERNANCE_MODE=dual-consensus`, `TINYGRAD_BACKEND=cpu`.

## Directory Structure
```
/
├── public/           # Static site files (deployed to Cloudflare)
├── app/             # Next.js application with API routes
├── evidence/        # Verification evidence and compliance data
│   └── phase2/      # Stage 2 evidence (verify, logs, approvals)
├── docs/            # Documentation and architecture
├── scripts/         # Build and deployment scripts
├── .github/         # GitHub Actions workflows
└── services/        # Service implementations
```

## Security & Compliance
- **Zeroth Principle**: Good intent and good heart requirement
- **Evidence Canonicalization**: Live commit and build time tracking
- **Verification Gates**: Automated compliance checking
- **Soulchain Logging**: Accountability and transparency
