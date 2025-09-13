# Complete Repository Classification Report

**Date:** 2025-09-13T01:14:02.243Z
**Total Files:** 215
**Classification Coverage:** 100%

## Classification Summary

| Classification | Count | Percentage |
|----------------|-------|------------|
| Gated Prototype | 65 | 30.2% |
| Unknown | 73 | 34.0% |
| Operational | 58 | 27.0% |
| Mock | 19 | 8.8% |

## Action Required Summary

| Action | Count |
|--------|-------|
| VERIFY | 123 |
| REVIEW | 56 |
| IMPLEMENT | 17 |
| REMOVE_MOCKS | 19 |

## Detailed File Analysis

| File | Classification | Action | Issues | Mock Indicators | Compliance | DB | External |
|------|----------------|--------|--------|-----------------|------------|----|----------|
| infra/worker-status/src/worker.ts | Gated Prototype | VERIFY | Missing error handling | 1 | ✅ | ❌ | ❌ |
| types/pg.d.ts | Unknown | REVIEW | Missing error handling; Missing input validation | 0 | ❌ | ❌ | ❌ |
| types/env.d.ts | Gated Prototype | VERIFY | Missing error handling; Missing input validation | 1 | ✅ | ❌ | ❌ |
| app/status/synthients.json/route.ts | Gated Prototype | VERIFY | Missing input validation | 3 | ✅ | ❌ | ❌ |
| app/status/openapi.json/route.ts | Operational | VERIFY | None | 0 | ❌ | ❌ | ✅ |
| app/layout.tsx | Unknown | IMPLEMENT | Missing database connections or external service calls; Missing error handling; Missing input validation | 0 | ❌ | ❌ | ❌ |
| app/lib/buildMeta.ts | Unknown | IMPLEMENT | Missing database connections or external service calls; Missing error handling; Missing input validation | 0 | ❌ | ❌ | ❌ |
| app/api/consensus/vote/route.ts | Gated Prototype | VERIFY | Missing error handling | 1 | ✅ | ❌ | ❌ |
| app/api/consensus/history/route.ts | Gated Prototype | VERIFY | Missing error handling | 1 | ✅ | ❌ | ❌ |
| app/api/consensus/proposals/route.ts | Gated Prototype | VERIFY | Missing error handling | 1 | ✅ | ❌ | ❌ |
| app/api/wondercraft/diff/route.ts | Gated Prototype | VERIFY | Missing error handling | 1 | ✅ | ❌ | ❌ |
| app/api/wondercraft/diff/[assetId]/route.ts | Unknown | REVIEW | None | 0 | ❌ | ❌ | ❌ |
| app/api/wondercraft/status/[contributionId]/route.ts | Unknown | REVIEW | None | 0 | ❌ | ❌ | ❌ |
| app/api/wondercraft/contribute/route.ts | Unknown | REVIEW | None | 0 | ❌ | ❌ | ❌ |
| app/api/enterprise/users/route.ts | Gated Prototype | VERIFY | Missing error handling | 1 | ✅ | ❌ | ❌ |
| app/api/security/monitoring/route.ts | Gated Prototype | VERIFY | Missing error handling | 1 | ✅ | ❌ | ❌ |
| app/api/auth/login/route.ts | Gated Prototype | VERIFY | Missing error handling | 1 | ✅ | ❌ | ❌ |
| app/api/tinygrad/start/route.ts | Unknown | REVIEW | None | 0 | ❌ | ❌ | ❌ |
| app/api/tinygrad/status/[jobId]/route.ts | Unknown | REVIEW | None | 0 | ❌ | ❌ | ❌ |
| app/api/tinygrad/logs/[jobId]/route.ts | Unknown | REVIEW | None | 0 | ❌ | ❌ | ❌ |
| app/api/training/metrics/route.ts | Gated Prototype | VERIFY | Missing error handling | 1 | ✅ | ❌ | ❌ |
| app/api/training/status/route.ts | Gated Prototype | VERIFY | Missing error handling | 1 | ✅ | ❌ | ❌ |
| app/api/training/route.ts | Gated Prototype | VERIFY | Missing error handling | 1 | ✅ | ❌ | ❌ |
| app/api/readyz/route.ts | Mock | REMOVE_MOCKS | Contains mock indicators: mock; Missing error handling | 1 | ✅ | ❌ | ❌ |
| app/api/providers/wondercraft/stream/route.ts | Unknown | IMPLEMENT | Missing database connections or external service calls | 0 | ✅ | ❌ | ❌ |
| app/api/providers/tinygrad/stream/route.ts | Unknown | IMPLEMENT | Missing database connections or external service calls | 0 | ✅ | ❌ | ❌ |
| app/api/providers/petals/stream/route.ts | Unknown | IMPLEMENT | Missing database connections or external service calls | 0 | ✅ | ❌ | ❌ |
| app/api/network/instances/route.ts | Gated Prototype | VERIFY | Missing error handling | 1 | ✅ | ❌ | ❌ |
| app/api/audit/log/route.ts | Gated Prototype | VERIFY | Missing error handling | 1 | ✅ | ❌ | ❌ |
| app/api/ml/pipeline/route.ts | Gated Prototype | VERIFY | Missing error handling | 1 | ✅ | ❌ | ❌ |
| app/api/ai/models/route.ts | Gated Prototype | VERIFY | Missing error handling | 1 | ✅ | ❌ | ❌ |
| app/api/ai/reasoning/route.ts | Gated Prototype | VERIFY | Missing error handling | 1 | ✅ | ❌ | ❌ |
| app/api/ai/ethics/route.ts | Gated Prototype | VERIFY | Missing error handling | 1 | ✅ | ❌ | ❌ |
| app/api/petals/propose/route.ts | Unknown | REVIEW | None | 0 | ❌ | ❌ | ❌ |
| app/api/petals/vote/[proposalId]/route.ts | Unknown | REVIEW | None | 0 | ❌ | ❌ | ❌ |
| app/api/petals/status/[proposalId]/route.ts | Unknown | REVIEW | None | 0 | ❌ | ❌ | ❌ |
| app/api/petals/tally/[proposalId]/route.ts | Unknown | REVIEW | None | 0 | ❌ | ❌ | ❌ |
| app/api/governance/approval/route.ts | Unknown | REVIEW | None | 0 | ❌ | ❌ | ❌ |
| app/api/healthz/route.ts | Mock | REMOVE_MOCKS | Contains mock indicators: mock; Missing error handling | 1 | ✅ | ❌ | ❌ |
| app/api/events/consensus/route.ts | Gated Prototype | VERIFY | Missing input validation | 2 | ✅ | ❌ | ❌ |
| app/api/events/agents/route.ts | Gated Prototype | VERIFY | Missing input validation | 2 | ✅ | ❌ | ❌ |
| app/api/events/synthiant/route.ts | Gated Prototype | VERIFY | Missing error handling | 1 | ✅ | ❌ | ❌ |
| app/api/proposals/stream/route.ts | Gated Prototype | VERIFY | Missing error handling | 1 | ✅ | ❌ | ❌ |
| app/api/proposals/route.ts | Gated Prototype | VERIFY | Missing input validation | 1 | ✅ | ❌ | ✅ |
| app/api/proposals/[id]/route.ts | Operational | VERIFY | None | 0 | ❌ | ✅ | ❌ |
| app/api/synthients/syslog/stream/route.ts | Gated Prototype | VERIFY | Missing error handling | 1 | ✅ | ❌ | ❌ |
| app/api/synthients/syslog/route.ts | Gated Prototype | VERIFY | Missing error handling | 1 | ✅ | ❌ | ❌ |
| app/api/synthients/syslog/export/route.ts | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| app/api/synthients/test/route.ts | Unknown | REVIEW | Missing error handling; Missing input validation | 0 | ❌ | ❌ | ❌ |
| app/api/quantum/compute/route.ts | Gated Prototype | VERIFY | Missing error handling | 1 | ✅ | ❌ | ❌ |
| app/api/router/exec/route.ts | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| app/api/router/analytics/route.ts | Unknown | REVIEW | Missing input validation | 0 | ❌ | ❌ | ❌ |
| app/page.tsx | Unknown | IMPLEMENT | Missing database connections or external service calls; Missing error handling; Missing input validation | 0 | ❌ | ❌ | ❌ |
| app/synthients/monitor/page.tsx | Operational | VERIFY | None | 0 | ❌ | ❌ | ✅ |
| app/synthients/page.tsx | Operational | VERIFY | Missing error handling; Missing input validation | 0 | ❌ | ❌ | ✅ |
| providers/gpt.ts | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| providers/wondercraft.ts | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| providers/tinygrad.ts | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| providers/petals.ts | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| providers/claude.ts | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| providers/grok4.ts | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| components/RoutingStrategySelector.tsx | Mock | REMOVE_MOCKS | Contains mock indicators: mock; Missing error handling | 1 | ✅ | ❌ | ❌ |
| components/wondercraft/DiffForm.tsx | Mock | REMOVE_MOCKS | Contains mock indicators: mock; Missing error handling | 1 | ✅ | ❌ | ❌ |
| components/wondercraft/ContributionForm.tsx | Mock | REMOVE_MOCKS | Contains mock indicators: mock; Missing error handling | 1 | ✅ | ❌ | ❌ |
| components/tinygrad/JobLogsViewer.tsx | Mock | REMOVE_MOCKS | Contains mock indicators: mock; Missing error handling | 1 | ✅ | ❌ | ❌ |
| components/tinygrad/JobStartForm.tsx | Mock | REMOVE_MOCKS | Contains mock indicators: mock; Missing error handling | 1 | ✅ | ❌ | ❌ |
| components/tinygrad/JobStatusViewer.tsx | Mock | REMOVE_MOCKS | Contains mock indicators: mock; Missing error handling | 1 | ✅ | ❌ | ❌ |
| components/ChainOfThought.tsx | Unknown | IMPLEMENT | Missing database connections or external service calls; Missing error handling; Missing input validation | 0 | ❌ | ❌ | ❌ |
| components/Footer.tsx | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| components/RightPanel.tsx | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| components/dashboard/SynthientsPanel.tsx | Mock | REMOVE_MOCKS | Contains mock indicators: mock; Missing error handling | 1 | ✅ | ❌ | ❌ |
| components/LeftPanel.tsx | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| components/petals/VoteForm.tsx | Mock | REMOVE_MOCKS | Contains mock indicators: mock; Missing error handling | 1 | ✅ | ❌ | ❌ |
| components/petals/ProposalForm.tsx | Mock | REMOVE_MOCKS | Contains mock indicators: mock; Missing error handling | 1 | ✅ | ❌ | ❌ |
| components/TopTicker.tsx | Unknown | IMPLEMENT | Missing database connections or external service calls; Missing input validation | 0 | ❌ | ❌ | ❌ |
| components/PromptPane.tsx | Mock | REMOVE_MOCKS | Contains mock indicators: mock; Missing error handling | 1 | ✅ | ❌ | ❌ |
| components/BottomTicker.tsx | Unknown | IMPLEMENT | Missing database connections or external service calls; Missing input validation | 0 | ❌ | ❌ | ❌ |
| components/proposals/ProposalList.tsx | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| public/consensus/history.ts | Unknown | REVIEW | Missing input validation | 0 | ❌ | ❌ | ❌ |
| public/consensus/proposals.ts | Unknown | REVIEW | Missing input validation | 0 | ❌ | ❌ | ❌ |
| public/consensus/vote.ts | Unknown | REVIEW | Missing input validation | 0 | ❌ | ❌ | ❌ |
| public/consensus/logs.ts | Unknown | REVIEW | Missing input validation | 0 | ❌ | ❌ | ❌ |
| public/consensus/proposals.json.ts | Unknown | REVIEW | Missing error handling; Missing input validation | 0 | ❌ | ❌ | ❌ |
| public/wondercraft/status.json.ts | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| public/js/training-debug.js | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| public/petals/status.json.ts | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| public/api/zeroth/status.ts | Unknown | REVIEW | Missing error handling; Missing input validation | 0 | ❌ | ❌ | ❌ |
| public/api/wondercraft/status.json.ts | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| public/api/readyz.ts | Gated Prototype | VERIFY | Missing error handling; Missing input validation | 1 | ✅ | ❌ | ❌ |
| public/api/healthz.ts | Gated Prototype | VERIFY | Missing input validation | 2 | ✅ | ❌ | ❌ |
| public/api/training/status.ts | Operational | VERIFY | Missing error handling; Missing input validation | 0 | ❌ | ❌ | ✅ |
| public/api/training/runs.ts | Gated Prototype | VERIFY | None | 5 | ✅ | ❌ | ❌ |
| public/api/training/runs/[runId]/metrics.ts | Gated Prototype | VERIFY | Missing error handling | 2 | ✅ | ❌ | ❌ |
| public/api/training/runs/[runId].ts | Gated Prototype | VERIFY | Missing error handling | 2 | ✅ | ❌ | ❌ |
| public/api/providers/wondercraft/status.ts | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| public/api/providers/wondercraft/exec.ts | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| public/api/providers/tinygrad/status.ts | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| public/api/providers/tinygrad/exec.ts | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| public/api/providers/petals/status.ts | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| public/api/providers/petals/exec.ts | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| public/api/test.ts | Unknown | REVIEW | Missing error handling; Missing input validation | 0 | ❌ | ❌ | ❌ |
| public/api/monitor.ts | Operational | VERIFY | None | 0 | ❌ | ❌ | ✅ |
| public/api/events/training.ts | Gated Prototype | VERIFY | Missing error handling | 2 | ✅ | ❌ | ❌ |
| public/api/events/synthiant.ts | Unknown | REVIEW | Missing error handling; Missing input validation | 0 | ❌ | ❌ | ❌ |
| public/api/events/training/test.ts | Gated Prototype | VERIFY | Missing error handling; Missing input validation | 2 | ✅ | ❌ | ❌ |
| public/api/events/consensus.ts | Unknown | REVIEW | Missing error handling; Missing input validation | 0 | ❌ | ❌ | ❌ |
| public/api/events/synthient.ts | Unknown | REVIEW | Missing error handling; Missing input validation | 0 | ❌ | ❌ | ❌ |
| public/api/events/alerts.ts | Unknown | REVIEW | Missing error handling; Missing input validation | 0 | ❌ | ❌ | ❌ |
| public/api/router/exec.ts | Operational | VERIFY | Missing input validation | 0 | ✅ | ❌ | ✅ |
| public/api/router/instances.ts | Unknown | REVIEW | Missing error handling; Missing input validation | 0 | ❌ | ❌ | ❌ |
| public/api/router/config.ts | Unknown | REVIEW | Missing error handling; Missing input validation | 0 | ❌ | ❌ | ❌ |
| scripts/build-evidence-index.mjs | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| scripts/check-links.mjs | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| scripts/build-dynamic-evidence.mjs | Gated Prototype | VERIFY | None | 2 | ✅ | ❌ | ✅ |
| scripts/smoke.mjs | Unknown | REVIEW | Missing error handling | 0 | ❌ | ❌ | ❌ |
| scripts/governance-evidence-management.mjs | Gated Prototype | VERIFY | Missing error handling | 4 | ✅ | ❌ | ❌ |
| scripts/end-to-end-compliance.mjs | Gated Prototype | VERIFY | None | 1 | ✅ | ❌ | ✅ |
| scripts/probe-routing.mjs | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| scripts/error-handling-validation.mjs | Gated Prototype | VERIFY | None | 1 | ✅ | ✅ | ✅ |
| scripts/check-status-verified.mjs | Gated Prototype | VERIFY | None | 2 | ✅ | ❌ | ❌ |
| scripts/generate-evidence.mjs | Unknown | REVIEW | Missing error handling; Missing input validation | 0 | ❌ | ❌ | ❌ |
| scripts/complete-mock-elimination.mjs | Gated Prototype | VERIFY | None | 2 | ✅ | ❌ | ✅ |
| scripts/fix-critical-mocks.mjs | Gated Prototype | VERIFY | None | 1 | ✅ | ❌ | ❌ |
| scripts/smoke-test.cjs | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| scripts/ci-validate-environment.mjs | Gated Prototype | VERIFY | None | 2 | ✅ | ❌ | ✅ |
| scripts/environment-flag-enforcement.mjs | Gated Prototype | VERIFY | None | 2 | ✅ | ✅ | ✅ |
| scripts/complete-codebase-classification.mjs | Gated Prototype | VERIFY | None | 15 | ✅ | ✅ | ✅ |
| scripts/inject-build.mjs | Unknown | REVIEW | None | 0 | ❌ | ❌ | ❌ |
| scripts/final-mock-elimination.mjs | Gated Prototype | VERIFY | None | 2 | ✅ | ❌ | ✅ |
| scripts/verify-phase5.cjs | Operational | VERIFY | None | 0 | ❌ | ❌ | ✅ |
| scripts/update-worker-env.mjs | Unknown | REVIEW | Missing error handling; Missing input validation | 0 | ❌ | ❌ | ❌ |
| scripts/_lib/http.cjs | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| scripts/_lib/fsx.cjs | Unknown | IMPLEMENT | Missing database connections or external service calls; Missing input validation | 0 | ❌ | ❌ | ❌ |
| scripts/repository-audit.mjs | Gated Prototype | VERIFY | Missing input validation | 10 | ✅ | ✅ | ✅ |
| scripts/core-service-implementation.mjs | Gated Prototype | VERIFY | None | 1 | ✅ | ✅ | ✅ |
| scripts/guard-no-bare-booleans.mjs | Unknown | REVIEW | Missing error handling; Missing input validation | 0 | ❌ | ❌ | ❌ |
| scripts/check-links.js | Gated Prototype | VERIFY | None | 2 | ✅ | ❌ | ❌ |
| scripts/write-version-json.mjs | Operational | VERIFY | Missing error handling; Missing input validation | 0 | ❌ | ❌ | ✅ |
| scripts/apply-compliance-fix.mjs | Gated Prototype | VERIFY | None | 1 | ✅ | ❌ | ❌ |
| scripts/complete-service-integration.mjs | Operational | VERIFY | None | 0 | ❌ | ✅ | ✅ |
| scripts/verify-compliance.mjs | Gated Prototype | VERIFY | None | 1 | ✅ | ❌ | ✅ |
| scripts/check-readme-parity.mjs | Unknown | REVIEW | None | 0 | ❌ | ❌ | ❌ |
| scripts/create-risk-register.mjs | Gated Prototype | VERIFY | Missing error handling | 4 | ✅ | ❌ | ❌ |
| scripts/check-workflows.mjs | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| scripts/add-compliance-checks.mjs | Gated Prototype | VERIFY | Missing input validation | 1 | ✅ | ❌ | ❌ |
| scripts/build-leaderboard.mjs | Unknown | REVIEW | Missing error handling | 0 | ❌ | ❌ | ❌ |
| scripts/service-reconciliation.mjs | Gated Prototype | VERIFY | None | 9 | ✅ | ✅ | ✅ |
| scripts/automated-mock-remediation.mjs | Gated Prototype | VERIFY | None | 10 | ✅ | ❌ | ❌ |
| scripts/collect-lighthouse.cjs | Gated Prototype | VERIFY | Missing input validation | 2 | ✅ | ❌ | ❌ |
| lib/feature-flags.ts | Mock | REMOVE_MOCKS | Contains mock indicators: mock; Missing input validation | 1 | ✅ | ❌ | ❌ |
| lib/middleware/error-handler.ts | Mock | REMOVE_MOCKS | Contains mock indicators: mock; Missing input validation | 1 | ✅ | ❌ | ❌ |
| lib/evidence/logger.ts | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| lib/utils/validation.ts | Operational | VERIFY | None | 0 | ❌ | ❌ | ✅ |
| lib/utils/monitoring.ts | Operational | VERIFY | Missing input validation | 0 | ❌ | ✅ | ✅ |
| lib/db/config.ts | Mock | REMOVE_MOCKS | Contains mock indicators: mock; Missing input validation | 1 | ✅ | ❌ | ❌ |
| lib/compliance-middleware.ts | Mock | REMOVE_MOCKS | Contains mock indicators: mock; Missing input validation | 1 | ✅ | ❌ | ❌ |
| lib/services/tinygrad-client.ts | Operational | VERIFY | Missing input validation | 0 | ❌ | ✅ | ✅ |
| lib/services/petals-client.ts | Operational | VERIFY | Missing input validation | 0 | ❌ | ✅ | ✅ |
| lib/services/wondercraft-client.ts | Operational | VERIFY | Missing input validation | 0 | ❌ | ✅ | ✅ |
| lib/phase-config.ts | Unknown | IMPLEMENT | Missing database connections or external service calls; Missing error handling; Missing input validation | 0 | ❌ | ❌ | ❌ |
| functions/synthients.ts | Unknown | REVIEW | Missing error handling | 0 | ❌ | ❌ | ❌ |
| functions/consensus/history.ts | Unknown | REVIEW | Missing input validation | 0 | ❌ | ❌ | ❌ |
| functions/consensus/proposals.ts | Unknown | REVIEW | Missing input validation | 0 | ❌ | ❌ | ❌ |
| functions/consensus/vote.ts | Unknown | REVIEW | Missing input validation | 0 | ❌ | ❌ | ❌ |
| functions/consensus/logs.ts | Unknown | REVIEW | Missing input validation | 0 | ❌ | ❌ | ❌ |
| functions/consensus/proposals.json.ts | Unknown | REVIEW | Missing error handling; Missing input validation | 0 | ❌ | ❌ | ❌ |
| functions/wondercraft/status.json.ts | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| functions/_lib/json.ts | Unknown | IMPLEMENT | Missing database connections or external service calls; Missing error handling | 0 | ❌ | ❌ | ❌ |
| functions/status/version.json.ts | Unknown | REVIEW | Missing error handling | 0 | ❌ | ❌ | ❌ |
| functions/status/synthients.ts | Unknown | REVIEW | Missing error handling | 0 | ❌ | ❌ | ❌ |
| functions/status/version.ts | Unknown | REVIEW | Missing error handling | 0 | ❌ | ❌ | ❌ |
| functions/petals/status.json.ts | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| functions/api/zeroth/status.ts | Unknown | REVIEW | Missing error handling; Missing input validation | 0 | ❌ | ❌ | ❌ |
| functions/api/training.ts | Unknown | REVIEW | Missing input validation | 0 | ❌ | ❌ | ❌ |
| functions/api/wondercraft/contribute.ts | Gated Prototype | VERIFY | Missing input validation | 1 | ✅ | ❌ | ❌ |
| functions/api/wondercraft/status.json.ts | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| functions/api/proposals.ts | Unknown | REVIEW | Missing input validation | 0 | ❌ | ❌ | ❌ |
| functions/api/synthients-syslog.ts | Unknown | REVIEW | Missing error handling; Missing input validation | 0 | ❌ | ❌ | ❌ |
| functions/api/readyz.ts | Gated Prototype | VERIFY | Missing error handling; Missing input validation | 1 | ✅ | ❌ | ❌ |
| functions/api/healthz.ts | Gated Prototype | VERIFY | Missing input validation | 1 | ✅ | ❌ | ❌ |
| functions/api/tinygrad/start.ts | Gated Prototype | VERIFY | Missing input validation | 1 | ✅ | ❌ | ❌ |
| functions/api/training/status.ts | Operational | VERIFY | Missing error handling; Missing input validation | 0 | ❌ | ❌ | ✅ |
| functions/api/training/runs.ts | Gated Prototype | VERIFY | None | 5 | ✅ | ❌ | ❌ |
| functions/api/training/leaderboard.ts | Unknown | REVIEW | Missing input validation | 0 | ❌ | ❌ | ❌ |
| functions/api/training/runs/[runId]/metrics.ts | Gated Prototype | VERIFY | Missing error handling | 2 | ✅ | ❌ | ❌ |
| functions/api/training/runs/[runId].ts | Gated Prototype | VERIFY | Missing error handling | 2 | ✅ | ❌ | ❌ |
| functions/api/providers/wondercraft/status.ts | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| functions/api/providers/wondercraft/exec.ts | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| functions/api/providers/tinygrad/status.ts | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| functions/api/providers/tinygrad/exec.ts | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| functions/api/providers/petals/status.ts | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| functions/api/providers/petals/exec.ts | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| functions/api/synthient/status.ts | Operational | VERIFY | Missing input validation | 0 | ❌ | ❌ | ✅ |
| functions/api/synthient/proposals.ts | Unknown | REVIEW | Missing error handling; Missing input validation | 0 | ❌ | ❌ | ❌ |
| functions/api/synthient/consensus.ts | Unknown | REVIEW | Missing error handling; Missing input validation | 0 | ❌ | ❌ | ❌ |
| functions/api/synthient/bootstrap.ts | Operational | VERIFY | Missing error handling; Missing input validation | 0 | ❌ | ❌ | ✅ |
| functions/api/petals/propose.ts | Gated Prototype | VERIFY | Missing input validation | 1 | ✅ | ❌ | ❌ |
| functions/api/monitor.ts | Operational | VERIFY | None | 0 | ❌ | ❌ | ✅ |
| functions/api/events/training.ts | Gated Prototype | VERIFY | Missing error handling | 2 | ✅ | ❌ | ❌ |
| functions/api/events/synthiant.ts | Unknown | REVIEW | Missing error handling; Missing input validation | 0 | ❌ | ❌ | ❌ |
| functions/api/events/training/test.ts | Gated Prototype | VERIFY | Missing error handling; Missing input validation | 2 | ✅ | ❌ | ❌ |
| functions/api/events/consensus.ts | Unknown | REVIEW | Missing error handling; Missing input validation | 0 | ❌ | ❌ | ❌ |
| functions/api/events/synthient.ts | Unknown | REVIEW | Missing error handling; Missing input validation | 0 | ❌ | ❌ | ❌ |
| functions/api/events/alerts.ts | Unknown | REVIEW | Missing error handling; Missing input validation | 0 | ❌ | ❌ | ❌ |
| functions/api/router/exec.ts | Operational | VERIFY | Missing input validation | 0 | ✅ | ❌ | ✅ |
| functions/api/router/instances.ts | Unknown | REVIEW | Missing error handling; Missing input validation | 0 | ❌ | ❌ | ❌ |
| functions/api/router/config.ts | Unknown | REVIEW | Missing error handling; Missing input validation | 0 | ❌ | ❌ | ❌ |
| services/trainer-tinygrad/index.ts | Unknown | IMPLEMENT | Missing database connections or external service calls; Missing error handling; Missing input validation | 0 | ❌ | ❌ | ❌ |
| services/api-server/index.js | Unknown | IMPLEMENT | Missing database connections or external service calls; Missing input validation | 0 | ❌ | ❌ | ❌ |
| services/router.ts | Unknown | IMPLEMENT | Missing database connections or external service calls; Missing input validation | 0 | ❌ | ❌ | ❌ |
| services/petals-orchestrator/index.ts | Mock | REMOVE_MOCKS | Contains mock indicators: mock; Missing input validation | 1 | ✅ | ❌ | ❌ |
| services/enhanced-router.ts | Unknown | IMPLEMENT | Missing database connections or external service calls; Missing input validation | 0 | ❌ | ❌ | ❌ |
| services/wondercraft-bridge/index.ts | Unknown | IMPLEMENT | Missing database connections or external service calls; Missing error handling; Missing input validation | 0 | ❌ | ❌ | ❌ |
| services/governance/index.js | Mock | REMOVE_MOCKS | Contains mock indicators: mock; Missing input validation | 1 | ✅ | ❌ | ❌ |
| services/audit.ts | Mock | REMOVE_MOCKS | Contains mock indicators: mock; Missing input validation | 1 | ✅ | ❌ | ❌ |

## Critical Issues Requiring Immediate Action

### Mock Files (19)
These files contain mock data and must be remediated:

- **app/api/readyz/route.ts**: Contains mock indicators: mock, Missing error handling
- **app/api/healthz/route.ts**: Contains mock indicators: mock, Missing error handling
- **components/RoutingStrategySelector.tsx**: Contains mock indicators: mock, Missing error handling
- **components/wondercraft/DiffForm.tsx**: Contains mock indicators: mock, Missing error handling
- **components/wondercraft/ContributionForm.tsx**: Contains mock indicators: mock, Missing error handling
- **components/tinygrad/JobLogsViewer.tsx**: Contains mock indicators: mock, Missing error handling
- **components/tinygrad/JobStartForm.tsx**: Contains mock indicators: mock, Missing error handling
- **components/tinygrad/JobStatusViewer.tsx**: Contains mock indicators: mock, Missing error handling
- **components/dashboard/SynthientsPanel.tsx**: Contains mock indicators: mock, Missing error handling
- **components/petals/VoteForm.tsx**: Contains mock indicators: mock, Missing error handling
- **components/petals/ProposalForm.tsx**: Contains mock indicators: mock, Missing error handling
- **components/PromptPane.tsx**: Contains mock indicators: mock, Missing error handling
- **lib/feature-flags.ts**: Contains mock indicators: mock, Missing input validation
- **lib/middleware/error-handler.ts**: Contains mock indicators: mock, Missing input validation
- **lib/db/config.ts**: Contains mock indicators: mock, Missing input validation
- **lib/compliance-middleware.ts**: Contains mock indicators: mock, Missing input validation
- **services/petals-orchestrator/index.ts**: Contains mock indicators: mock, Missing input validation
- **services/governance/index.js**: Contains mock indicators: mock, Missing input validation
- **services/audit.ts**: Contains mock indicators: mock, Missing input validation

### Unknown Status Files (73)
These files need manual review:

- **types/pg.d.ts**: Missing error handling, Missing input validation
- **app/layout.tsx**: Missing database connections or external service calls, Missing error handling, Missing input validation
- **app/lib/buildMeta.ts**: Missing database connections or external service calls, Missing error handling, Missing input validation
- **app/api/wondercraft/diff/[assetId]/route.ts**: 
- **app/api/wondercraft/status/[contributionId]/route.ts**: 
- **app/api/wondercraft/contribute/route.ts**: 
- **app/api/tinygrad/start/route.ts**: 
- **app/api/tinygrad/status/[jobId]/route.ts**: 
- **app/api/tinygrad/logs/[jobId]/route.ts**: 
- **app/api/providers/wondercraft/stream/route.ts**: Missing database connections or external service calls
- **app/api/providers/tinygrad/stream/route.ts**: Missing database connections or external service calls
- **app/api/providers/petals/stream/route.ts**: Missing database connections or external service calls
- **app/api/petals/propose/route.ts**: 
- **app/api/petals/vote/[proposalId]/route.ts**: 
- **app/api/petals/status/[proposalId]/route.ts**: 
- **app/api/petals/tally/[proposalId]/route.ts**: 
- **app/api/governance/approval/route.ts**: 
- **app/api/synthients/test/route.ts**: Missing error handling, Missing input validation
- **app/api/router/analytics/route.ts**: Missing input validation
- **app/page.tsx**: Missing database connections or external service calls, Missing error handling, Missing input validation
- **components/ChainOfThought.tsx**: Missing database connections or external service calls, Missing error handling, Missing input validation
- **components/TopTicker.tsx**: Missing database connections or external service calls, Missing input validation
- **components/BottomTicker.tsx**: Missing database connections or external service calls, Missing input validation
- **public/consensus/history.ts**: Missing input validation
- **public/consensus/proposals.ts**: Missing input validation
- **public/consensus/vote.ts**: Missing input validation
- **public/consensus/logs.ts**: Missing input validation
- **public/consensus/proposals.json.ts**: Missing error handling, Missing input validation
- **public/api/zeroth/status.ts**: Missing error handling, Missing input validation
- **public/api/test.ts**: Missing error handling, Missing input validation
- **public/api/events/synthiant.ts**: Missing error handling, Missing input validation
- **public/api/events/consensus.ts**: Missing error handling, Missing input validation
- **public/api/events/synthient.ts**: Missing error handling, Missing input validation
- **public/api/events/alerts.ts**: Missing error handling, Missing input validation
- **public/api/router/instances.ts**: Missing error handling, Missing input validation
- **public/api/router/config.ts**: Missing error handling, Missing input validation
- **scripts/smoke.mjs**: Missing error handling
- **scripts/generate-evidence.mjs**: Missing error handling, Missing input validation
- **scripts/inject-build.mjs**: 
- **scripts/update-worker-env.mjs**: Missing error handling, Missing input validation
- **scripts/_lib/fsx.cjs**: Missing database connections or external service calls, Missing input validation
- **scripts/guard-no-bare-booleans.mjs**: Missing error handling, Missing input validation
- **scripts/check-readme-parity.mjs**: 
- **scripts/build-leaderboard.mjs**: Missing error handling
- **lib/phase-config.ts**: Missing database connections or external service calls, Missing error handling, Missing input validation
- **functions/synthients.ts**: Missing error handling
- **functions/consensus/history.ts**: Missing input validation
- **functions/consensus/proposals.ts**: Missing input validation
- **functions/consensus/vote.ts**: Missing input validation
- **functions/consensus/logs.ts**: Missing input validation
- **functions/consensus/proposals.json.ts**: Missing error handling, Missing input validation
- **functions/_lib/json.ts**: Missing database connections or external service calls, Missing error handling
- **functions/status/version.json.ts**: Missing error handling
- **functions/status/synthients.ts**: Missing error handling
- **functions/status/version.ts**: Missing error handling
- **functions/api/zeroth/status.ts**: Missing error handling, Missing input validation
- **functions/api/training.ts**: Missing input validation
- **functions/api/proposals.ts**: Missing input validation
- **functions/api/synthients-syslog.ts**: Missing error handling, Missing input validation
- **functions/api/training/leaderboard.ts**: Missing input validation
- **functions/api/synthient/proposals.ts**: Missing error handling, Missing input validation
- **functions/api/synthient/consensus.ts**: Missing error handling, Missing input validation
- **functions/api/events/synthiant.ts**: Missing error handling, Missing input validation
- **functions/api/events/consensus.ts**: Missing error handling, Missing input validation
- **functions/api/events/synthient.ts**: Missing error handling, Missing input validation
- **functions/api/events/alerts.ts**: Missing error handling, Missing input validation
- **functions/api/router/instances.ts**: Missing error handling, Missing input validation
- **functions/api/router/config.ts**: Missing error handling, Missing input validation
- **services/trainer-tinygrad/index.ts**: Missing database connections or external service calls, Missing error handling, Missing input validation
- **services/api-server/index.js**: Missing database connections or external service calls, Missing input validation
- **services/router.ts**: Missing database connections or external service calls, Missing input validation
- **services/enhanced-router.ts**: Missing database connections or external service calls, Missing input validation
- **services/wondercraft-bridge/index.ts**: Missing database connections or external service calls, Missing error handling, Missing input validation

## Remediation Plan

### Phase 1: Remove Mock Data (Priority: CRITICAL)
1. Remove all mock indicators from operational files
2. Add compliance gating to prototype files
3. Implement proper 503 responses for gated endpoints

### Phase 2: Implement Missing Functionality (Priority: HIGH)
1. Add database connections to files missing them
2. Implement external service calls where needed
3. Add proper error handling and validation

### Phase 3: Clean Up Unknown Files (Priority: MEDIUM)
1. Review and classify unknown status files
2. Remove deprecated files
3. Implement missing functionality

