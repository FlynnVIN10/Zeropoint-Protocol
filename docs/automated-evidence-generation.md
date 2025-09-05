# Automated Evidence Generation
The Zeropoint Protocol generates machine-checkable evidence during CI builds.

## Process
- **Script**: `scripts/generate-evidence.mjs` runs during CI, using `CF_PAGES_COMMIT_SHA` to identify the commit.
- **Verification**: Writes `/evidence/phase2/verify/{commit}/index.json` with:
  - cURL responses for all endpoints,
  - header validation (CSP, nosniff, no-store),
  - Lighthouse scores.
- **Logs**: Tinygrad logs (`metrics.json`, `config.json`, `stdout.txt`, `model.sha256`); Petals logs (`proposal.json`, `votes.json`, `tally.json`, `patch.diff`); Wondercraft logs (`asset.json`, `diff.json`) stored under `/evidence/phase2/logs/{service}/{commit}/`.

## Triggers
- **T2**: Endpoints live → Generate evidence.
- **T3**: Logs exist → Auto-generate synthient approvals.

## Structure
/evidence/phase2/verify/{commit}/index.json
/evidence/phase2/logs/tinygrad/{commit}/{jobId}/...
/evidence/phase2/logs/petals/{commit}/{proposalId}/...
/evidence/phase2/logs/wondercraft/{commit}/...

