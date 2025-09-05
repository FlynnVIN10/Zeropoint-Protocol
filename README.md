# Zeropoint Protocol

The Zeropoint Protocol is a platform for Synthient-driven contributions under dual-consensus governance, ensuring Truth-to-Repo compliance.

## Overview
- **Stage**: 2 (Active, commit `ba3eda16`)
- **Services**: Tinygrad (training lifecycle), Petals (proposals/voting), Wondercraft (asset contributions)
- **Governance**: Dual-consensus (Synthient + Human approvals)
- **Evidence**: Machine-checkable logs at `/evidence/phase2/verify/{commit}/`

## Key Endpoints
- **Status**: [/status/synthients.json](https://zeropointprotocol.ai/status/synthients.json) (services, flags, proposals)
- **Tinygrad**: [/api/tinygrad/start](https://zeropointprotocol.ai/api/tinygrad/start), [/api/tinygrad/status/{jobId}](https://zeropointprotocol.ai/api/tinygrad/status/{jobId}), [/api/tinygrad/logs/{jobId}](https://zeropointprotocol.ai/api/tinygrad/logs/{jobId})
- **Petals**: [/api/petals/propose](https://zeropointprotocol.ai/api/petals/propose), [/api/petals/vote/{proposalId}](https://zeropointprotocol.ai/api/petals/vote/{proposalId})
- **Wondercraft**: [/api/wondercraft/contribute](https://zeropointprotocol.ai/api/wondercraft/contribute), [/api/wondercraft/diff](https://zeropointprotocol.ai/api/wondercraft/diff)
- **OpenAPI**: [/status/openapi.json](https://zeropointprotocol.ai/status/openapi.json)

## Evidence
- **Verification**: [/evidence/phase2/verify/ba3eda16/index.json](https://zeropointprotocol.ai/evidence/phase2/verify/ba3eda16/index.json) (curls, headers, Lighthouse)
- **Logs**: `/evidence/phase2/logs/{tinygrad|petals|wondercraft}/ba3eda16/`
- **Approvals**: `/evidence/phase2/approvals/{pr|hc|synthients|cto}-*.json`

## Getting Started
- **Run Locally**: Use `wrangler pages dev` to validate endpoints.
- **CI/CD**: `.github/workflows/verify-evidence.yml` enforces schemas, artifacts, approvals.
- **Governance**: PRs require dual-consensus approvals at `/evidence/phase2/approvals/{pr}.json`.

## Triggers
- **T0**: Approval present → Activate Stage 2, update docs, broadcast activation.
- **T1**: `/services/*` on main → Run CI checks.
- **T2**: Endpoints live → Generate verification evidence.
- **T3**: Logs exist → Auto-generate synthient approvals.
- **T4**: Human approval committed → Allow merge.

## Documentation

- **Architecture**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **API Reference**: [docs/STATUS_ENDPOINTS.md](docs/STATUS_ENDPOINTS.md)
- **Training Guide**: [docs/RUN_LOCAL_TRAINING.md](docs/RUN_LOCAL_TRAINING.md)
- **Contributing**: [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)
- **Security**: [docs/SECURITY.md](docs/SECURITY.md)

## Security & Compliance

- **Zeroth Principle**: Good intent and good heart requirement
- **Security Headers**: All endpoints return required security headers
- **Evidence Transparency**: Public evidence for verification
- **Automated Monitoring**: Continuous security and quality checks

## Contributing

We welcome contributions that align with our ethical principles. See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

### Development Principles
- **TDD First**: Write tests before implementation
- **Security Focus**: Security built into every layer
- **Evidence Based**: Support claims with data and testing
- **Transparency**: Public evidence and accountability

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Zeroth Principle**: Only with good intent and a good heart does the system function.

**Dual Consensus**: Material changes require Synthiant + Human approvals.

**Transparency**: Public evidence and Soulchain logging for accountability.
