# Environment Configuration

**Last Updated:** 2025-09-13T00:25:28.980Z
**Version:** 1.0

## Overview

This document describes the environment variables and configuration required for the Zeropoint Protocol platform.

## Environment Variables

| Variable | Production | Staging | Development | Description |
|----------|------------|---------|-------------|-------------|
| `MOCKS_DISABLED` | `1` | `1` | `0` | Disables mock data in production environments |
| `TRAINING_ENABLED` | `1` | `1` | `1` | Enables Synthient training functionality |
| `SYNTHIENTS_ACTIVE` | `1` | `1` | `1` | Enables Synthient operations |
| `GOVERNANCE_MODE` | `dual-consensus` | `dual-consensus` | `development` | Sets governance mode for the platform |
| `PHASE` | `stage2` | `stage2` | `development` | Current platform phase |
| `CI_STATUS` | `green` | `green` | `development` | CI pipeline status |
| `TINYGRAD_API_URL` | `https://tinygrad.zeropointprotocol.ai` | `https://staging-tinygrad.zeropointprotocol.ai` | `http://localhost:8000` | Tinygrad service API URL |
| `PETALS_API_URL` | `https://petals.zeropointprotocol.ai` | `https://staging-petals.zeropointprotocol.ai` | `http://localhost:8001` | Petals service API URL |
| `WONDERCRAFT_API_URL` | `https://wondercraft.zeropointprotocol.ai` | `https://staging-wondercraft.zeropointprotocol.ai` | `http://localhost:8002` | Wondercraft service API URL |
| `DATABASE_URL` | `postgresql://user:pass@prod-db:5432/zeropoint` | `postgresql://user:pass@staging-db:5432/zeropoint` | `postgresql://user:pass@localhost:5432/zeropoint` | Database connection URL |

## Environment-Specific Configuration

### Production Environment
- **MOCKS_DISABLED:** `1` (enforced)
- **TRAINING_ENABLED:** `1` (enabled)
- **SYNTHIENTS_ACTIVE:** `1` (enabled)
- **GOVERNANCE_MODE:** `dual-consensus` (enforced)
- **PHASE:** `stage2` (current phase)
- **CI_STATUS:** `green` (required)

### Staging Environment
- **MOCKS_DISABLED:** `1` (enforced)
- **TRAINING_ENABLED:** `1` (enabled)
- **SYNTHIENTS_ACTIVE:** `1` (enabled)
- **GOVERNANCE_MODE:** `dual-consensus` (enforced)
- **PHASE:** `stage2` (current phase)
- **CI_STATUS:** `green` (required)

### Development Environment
- **MOCKS_DISABLED:** `0` (allows mocks for development)
- **TRAINING_ENABLED:** `1` (enabled)
- **SYNTHIENTS_ACTIVE:** `1` (enabled)
- **GOVERNANCE_MODE:** `development` (relaxed for development)
- **PHASE:** `development` (development phase)
- **CI_STATUS:** `development` (development status)

## Service URLs

### Production
- **Tinygrad:** https://tinygrad.zeropointprotocol.ai
- **Petals:** https://petals.zeropointprotocol.ai
- **Wondercraft:** https://wondercraft.zeropointprotocol.ai

### Staging
- **Tinygrad:** https://staging-tinygrad.zeropointprotocol.ai
- **Petals:** https://staging-petals.zeropointprotocol.ai
- **Wondercraft:** https://staging-wondercraft.zeropointprotocol.ai

### Development
- **Tinygrad:** http://localhost:8000
- **Petals:** http://localhost:8001
- **Wondercraft:** http://localhost:8002

## Validation Rules

### CI Validation
The CI pipeline validates the following:
1. All required environment variables are set
2. MOCKS_DISABLED=1 in production and staging
3. Service URLs are accessible
4. Database connections are functional
5. No mock code is reachable when MOCKS_DISABLED=1

### Deployment Validation
Before deployment, the following checks are performed:
1. Environment variables match expected values
2. All services are operational
3. Compliance checks pass
4. Evidence generation is working

## Troubleshooting

### Common Issues
1. **MOCKS_DISABLED not enforced:** Check wrangler.toml configuration
2. **Service URLs not accessible:** Verify service deployment and DNS
3. **Database connection failed:** Check DATABASE_URL and credentials
4. **Environment variables not loaded:** Restart deployment

### Debug Commands
```bash
# Check environment variables
wrangler env list

# Validate configuration
wrangler config validate

# Test service connectivity
curl -f https://zeropointprotocol.ai/api/readyz
```

