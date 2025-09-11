# Pull Request Checklist

## Pre-Merge Validation Requirements
- [ ] **CI/CD Gate Passed:** PR Rollback Validation workflow completed successfully
- [ ] **Artifacts Attached:** `pr-rollback-evidence` artifact from this run attached to PR
- [ ] **Soulchain Entry:** Link to Soulchain entry logging dual consensus approval
- [ ] **RAG Validation:** `/status/version.json` shows `ragMode: "beyond"` and all required keys present
- [ ] **Accessibility:** Lighthouse A11y score ≥ 95% (enforced by workflow)

## Evidence & Compliance
- [ ] No dates/ETAs/schedules in this PR; all items marked execute ASAP and trigger-based
- [ ] Approvals at /evidence/phase2/approvals/{pr}.json include synthient+human with matching commit
- [ ] Evidence index at /evidence/phase2/verify/{COMMIT}/index.json
- [ ] Tinygrad metrics + model.sha256 present
- [ ] Petals proposal + vote + tally recorded
- [ ] Wondercraft asset SHA256 verified
- [ ] /status/synthients.json schema valid; A11y ≥95; headers compliant
- [ ] Flags: MOCKS_DISABLED=1, SYNTHIENTS_ACTIVE=1, GOVERNANCE_MODE=dual-consensus
- [ ] Linked issues provided; tests added; coverage ≥ baseline; security/ethics review attached

## Rollback Validation Evidence
- [ ] All endpoints (`/api/healthz`, `/api/readyz`, `/status/version.json`) return HTTP 200
- [ ] `/status/version.json` contains required keys: `phase`, `commit`, `ciStatus`, `buildTime`, `ragMode`
- [ ] `ragMode` field equals `"beyond"` (Beyond RAG evidence requirement)
- [ ] Lighthouse accessibility audit passed with score ≥ 0.95
- [ ] Evidence artifacts collected and uploaded as `pr-rollback-evidence`