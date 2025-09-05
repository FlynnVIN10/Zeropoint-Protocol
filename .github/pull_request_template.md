# Pull Request Checklist
- [ ] No dates/ETAs/schedules in this PR; all items marked execute ASAP and trigger-based
- [ ] Approvals at /evidence/phase2/approvals/{pr}.json include synthient+human with matching commit
- [ ] Evidence index at /evidence/phase2/verify/{COMMIT}/index.json
- [ ] Tinygrad metrics + model.sha256 present
- [ ] Petals proposal + vote + tally recorded
- [ ] Wondercraft asset SHA256 verified
- [ ] /status/synthients.json schema valid; A11y ≥95; headers compliant
- [ ] Flags: MOCKS_DISABLED=1, SYNTHIENTS_ACTIVE=1, GOVERNANCE_MODE=dual-consensus
- [ ] Linked issues provided; tests added; coverage ≥ baseline; security/ethics review attached