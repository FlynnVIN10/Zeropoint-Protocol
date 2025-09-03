# Stage 1 Directive - Tinygrad Training Microservice

**Date:** 2025-09-02  
**Directive:** Per CTO directive, Stage 1 — Operationalize Tinygrad Training Loop  
**Broadcast Status:** Sent to Dev Team and SCRA on 2025-09-02 at 22:50 CDT  
**Objective:** Bring Tinygrad training loop online with live metrics and checkpoints, enforce MOCKS_DISABLED=1, and maintain dual-consensus governance.

## Tasks and Owners

### Dev Team

**Task:** Implement Tinygrad training microservice with REST and SSE endpoints:
- `POST /api/training/runs` - Start training run, return `run_id`
- `GET /api/training/runs/{run_id}` - Return run status
- `GET /api/training/runs/{run_id}/metrics` - Return metrics (loss, accuracy)
- `SSE /api/events/training?run_id=...` - Stream ≥10 events in 10s

**Task:** Ingest verifiable datasets (MNIST, CIFAR-10) with SHA-256 checksums:
- Store checksums in `/functions/trainer-tinygrad/datasets/checksums.json`
- Ensure dataset integrity verification

**Task:** Write evidence files to `/evidence/training/{run_id}/`:
- `metrics.jsonl` - Training metrics with decreasing loss for ≥3 checkpoints
- `checkpoints/` - Model checkpoint files
- `config.json` - Training configuration
- `provenance.json` - Dataset provenance and commit info

**Task:** Update `/healthz` and `/readyz` to include `"mocks": false`:
- Ensure MOCKS_DISABLED=1 enforcement
- Update phase to "stage1"
- Maintain all required headers

**Acceptance Criteria:**
- All endpoints return 200 OK with correct schemas and headers
- SSE emits ≥10 events in 10 seconds
- Metrics show decreasing loss for ≥3 checkpoints
- Evidence files exist in `/evidence/training/{run_id}/`
- `/healthz` and `/readyz` return `"mocks": false`, `phase: "stage1"`

**Owner:** DevOps Lead  
**Status:** Awaiting response  
**ETA:** TBD  
**Evidence:** `/evidence/training/{run_id}/` (to be populated)

### SCRA

**Task:** Probe endpoints and capture headers/bodies:
- `/api/training/runs`
- `/api/training/runs/{run_id}`
- `/api/training/runs/{run_id}/metrics`
- `/api/events/training?run_id=...`

**Task:** Validate metrics and checkpoints:
- Verify metrics show decreasing loss
- Ensure checkpoints are loadable
- Confirm no mock data present

**Task:** Store verification outputs under `/evidence/phase1/verify/{commit}/`

**Task:** File PR comments for any discrepancies with exact file paths

**Acceptance Criteria:**
- Evidence files exist under `/evidence/phase1/verify/{commit}/`
- Metrics validation shows decreasing loss trend
- No mock data detected in any endpoint
- Discrepancies reported with precise file paths and owners

**Owner:** SCRA Lead  
**Status:** Awaiting response  
**ETA:** TBD  
**Evidence:** `/evidence/phase1/verify/{commit}/` (to be populated)

## Risks and Mitigations

**Risk:** Dev Team encounters issues with Tinygrad integration or dataset ingestion.  
**Mitigation:** Dev Team to provide early feedback on implementation challenges.  
**Owner:** Dev Team  
**Rollback:** Revert to Stage 0 configuration if integration fails twice.

**Risk:** SCRA may miss subtle mock data paths if not explicitly tested.  
**Mitigation:** SCRA to include explicit mock detection in probes (check for static/hardcoded responses).  
**Owner:** SCRA  
**Rollback:** Escalate to CTO if mock data detected.

## Next Steps

1. Await Dev Team and SCRA responses ("Received and understood" or improvements)
2. Log responses in `/evidence/phase1/acknowledgements/`
3. Monitor implementation progress
4. Update PM_STATUS_REPORT.md with evidence links
5. Run CTO Verification Gate upon completion

## Evidence Pack

**Commit SHA:** TBD (to be updated post-merge)  
**PR Links:** TBD  
**CI Run URLs:** TBD  
**Cloudflare Deploy ID:** TBD  
**Preview/Prod URLs:** TBD  
**Training Evidence:** `/evidence/training/{run_id}/` (to be populated)  
**Verification Evidence:** `/evidence/phase1/verify/{commit}/` (to be populated)

---

**Directive Status:** Active  
**Compliance:** Directive free of date/time metadata
