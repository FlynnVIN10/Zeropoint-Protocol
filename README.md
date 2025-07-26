# Lexame-JADE_FLYNN

**Unified API Gateway, Persistent Storage, and Auth**

- All endpoints are versioned under `/v1/`.
- Proxy endpoints (e.g., `/v1/generate-text`) forward to Python backend using HttpModule.
- Persistent storage via PostgreSQL/TypeORM; User entity for registration/login.
- JWT authentication with `/v1/register`, `/v1/login`, and `/v1/protected` endpoints.
- Prometheus metrics exposed at `/v1/metrics` and `/v1/ledger-metrics`.
- All sensitive flows and endpoints are Zeroth-gated for ethical compliance.
- All secrets (DB, JWT, etc.) are loaded from environment variables (`process.env`).

## Example Usage

### Register
```bash
curl -X POST http://localhost:3000/v1/register -H 'Content-Type: application/json' -d '{"username":"user1","password":"pass1"}'
```

### Login
```bash
curl -X POST http://localhost:3000/v1/login -H 'Content-Type: application/json' -d '{"username":"user1","password":"pass1"}'
```

### Access Protected Route
```bash
curl -H "Authorization: Bearer <access_token>" http://localhost:3000/v1/protected
```

### Prometheus Metrics
```bash
curl http://localhost:3000/v1/metrics
curl http://localhost:3000/v1/ledger-metrics
```

## Error Handling, Validation, and Health Checks
- All DTOs validated with class-validator and ValidationPipe.
- Global ExceptionFilter provides structured error handling (Zeroth-gated).
- Health-check endpoint at `/v1/health` (Zeroth-gated, Prometheus-ready).
- All error and validation flows are robust, ethical, and production-ready.

## Testing
- Jest configuration updated for TypeScript ESM support
- IPFS core functionality tests passing (9/9 tests)
- Basic functionality tests passing (3/3 tests)
- Run tests with `npm test` or `npx jest --config=jest-e2e.json`

## IPFS Integration
- Helia IPFS client fully implemented in `app.service.ts`
- File upload/download endpoints with multer support
- Soulchain ledger persistence to IPFS
- All IPFS operations Zeroth-gated for ethical compliance
- Prometheus metrics for IPFS operations

## Integrations & CI
- Petals client integrated, all API methods audited and Zeroth-gated.
- GitHub Actions CI runs tests and lint on every push (Zeroth-gated).
- See .github/workflows/ci.yml for details.

See DEPLOYMENT_STATUS.md for full deployment and architecture details.
