# v20 Kickoff

## Scope
- Provider routing improvements (latency/SLA/quotas)
- Consensus flows: history, tally, rationale summary UI
- SPA build wiring for single-page deployment
- CI extensions: routing/consensus probes, evidence

## Tasks
- services/router.ts: select best provider; collect telemetry
- components/LeftPanel.tsx: proposal history, filter, actions
- components/PromptPane.tsx: route info (latency/tokens) dropdown
- CI: add routing probe job; store results under evidence/v20/
- Docs: update SPA usage and consensus guide

## Acceptance
- P50 ≤5s, P95 ≤8s to first token
- Consensus approve + veto cycles recorded with evidence
- CI green; evidence updated under /evidence/v20/
