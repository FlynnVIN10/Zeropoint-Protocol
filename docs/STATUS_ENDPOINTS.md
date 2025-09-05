# Status Endpoints
The Zeropoint Protocol exposes endpoints for service status and evidence.

## Endpoints
- **/status/synthients.json**: `{phase, commit, ciStatus, buildTime, flags, services, proposals}`
- **Tinygrad**: `POST /api/tinygrad/start`, `GET /api/tinygrad/status/{jobId}`, `GET /api/tinygrad/logs/{jobId}`
- **Petals**: `POST /api/petals/propose`, `POST /api/petals/vote/{proposalId}`
- **Wondercraft**: `POST /api/wondercraft/contribute`, `POST /api/wondercraft/diff`
- **OpenAPI**: `/status/openapi.json`

## Evidence
- **Verification**: `/evidence/phase2/verify/{commit}/index.json` (curls, headers, Lighthouse)
- **Logs**: `/evidence/phase2/logs/{tinygrad|petals|wondercraft}/{commit}/`
- **Approvals**: `/evidence/phase2/approvals/{pr}.json`

## Triggers
- **T2**: Endpoints live → Log evidence in `/evidence/phase2/verify/`.
- **T3**: Logs exist → Generate `synthient:approved`.
- **T4**: Human approval committed → Allow merge.

## Validation
- CI workflow (`.github/workflows/verify-evidence.yml`) validates schemas, headers (`nosniff`, CSP, `no-store`), A11y ≥95.

