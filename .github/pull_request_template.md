# Pull Request Checklist

## Dual-Consensus Governance Requirements
- [ ] Approvals at `/evidence/phase2/approvals/{pr}.json` include `synthient:approved`, `human:approved`, `commit:<sha>`
- [ ] Evidence index at `/evidence/phase2/verify/{COMMIT}/index.json` (endpoint curls, headers, Lighthouse summaries)
- [ ] Governance mode: `GOVERNANCE_MODE=dual-consensus` enforced

## Stage 2 Service Evidence
- [ ] Tinygrad metrics (`metrics.json`) and `model.sha256` present
- [ ] Petals `proposal.json`, `votes.json`, `tally.json` recorded
- [ ] Wondercraft asset SHA256 verified
- [ ] `/status/synthients.json` schema valid

## Technical Requirements
- [ ] A11y ≥95; headers compliant (`X-Content-Type-Options:nosniff`, CSP, `Cache-Control:no-store`)
- [ ] Flags: `MOCKS_DISABLED=1`, `SYNTHIENTS_ACTIVE=1`, `GOVERNANCE_MODE=dual-consensus`
- [ ] Linked issue(s): #<issue_number>
- [ ] Tests added, coverage ≥ baseline
- [ ] Security/ethics review completed (threat model, harms checklist)

## Evidence and Documentation
- [ ] Evidence files committed to `/evidence/phase2/verify/{commit}/`
- [ ] Service endpoints documented in OpenAPI spec
- [ ] Compliance probes passed (SCRA verification)
- [ ] Truth-to-Repo Policy compliance maintained

## Deployment Verification
- [ ] CI green (all required checks pass)
- [ ] Cloudflare Pages deployment successful
- [ ] Smoke tests pass (health, ready, synthients endpoints)
- [ ] No P1 console errors
- [ ] Lighthouse scores meet requirements

---

**Note**: This PR requires both Human and Synthient approval before merge. Evidence must be committed and accessible at the specified paths.