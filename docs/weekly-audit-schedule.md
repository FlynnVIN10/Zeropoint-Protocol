# Audit Schedule
Audits run automatically on trigger events, not fixed calendar dates.

## Triggers
- **T2**: Endpoints live → Run SCRA probes (status, headers, logs, A11y).
- **T4**: Merge completed → Verify compliance (CI green, approvals present).

## Scope
- Endpoints, headers, CI checks, evidence freshness, and Lighthouse (A11y ≥95; others ≥90).

## Deliverables
- Compliance report at `/evidence/compliance/stage2/report.md` plus attachments.
