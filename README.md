# Zeropoint Protocol

## Live Site
- **Production**: https://zeropointprotocol.ai
- **Evidence Root**: `/evidence/`
- **Status Endpoints**: `/api/healthz`, `/api/readyz`, `/status/version.json`, `/api/training/status`, `/petals/status.json`, `/wondercraft/status.json`
- **Status UIs**: `/status/*`

## TinyGrad Training
Run local training with:
```bash
python3 scripts/tinygrad_toy_run.py > evidence/training/latest.json
```

## Development Quickstart
```bash
# Install dependencies
npm install

# Start local development
wrangler pages dev

# Run tests
npm test
```

## Project Structure
- `public/` - Static assets and pages
- `functions/` - Cloudflare Functions
- `evidence/` - Training metrics and compliance data
- `docs/` - Project documentation
- `scripts/` - Build and utility scripts
- `.github/workflows/` - CI/CD workflows
- `archive/` - Legacy and archived content

## Status Endpoints
All endpoints return JSON with required security headers:
- `content-type: application/json; charset=utf-8`
- `cache-control: no-store`
- `x-content-type-options: nosniff`
- `content-disposition: inline`
- `access-control-allow-origin: *`

## Contributing
See `docs/CONTRIBUTING.md` for development guidelines.

## Security
See `docs/SECURITY.md` for security policies and procedures.

