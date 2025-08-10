# Audit Export Documentation

**Export Date**: August 10, 2025  
**Export Period**: Last 24 hours  
**Retention Policy**: 90 days  
**Security**: Encrypted at rest, access audited

## Schema Overview

The audit export contains JSONL (JSON Lines) files with comprehensive audit trail data for all system operations.

### File Format
- **Format**: JSONL (one JSON object per line)
- **Encoding**: UTF-8
- **Compression**: None (raw JSONL)

### Field Definitions

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `timestamp` | ISO 8601 | Event occurrence time | `"2025-08-10T14:14:00.000Z"` |
| `event_type` | String | Type of audit event | `"auth.login"`, `"api.request"`, `"data.access"` |
| `user_id` | String | User identifier (hashed) | `"user_abc123"` |
| `action` | String | Specific action performed | `"GET /api/v1/agents"` |
| `outcome` | String | Result of the action | `"success"`, `"failure"`, `"denied"` |
| `ip_address` | String | Source IP address | `"192.168.1.100"` |
| `user_agent` | String | Client user agent | `"Mozilla/5.0..."` |
| `session_id` | String | Session identifier | `"sess_xyz789"` |
| `metadata` | Object | Additional event context | `{"resource": "agent", "method": "GET"}` |

## Event Types

### Authentication Events
- `auth.login` - User login attempts
- `auth.logout` - User logout
- `auth.failure` - Failed authentication
- `auth.token_refresh` - Token refresh operations

### API Events
- `api.request` - API endpoint access
- `api.response` - API response data
- `api.error` - API error conditions

### Data Events
- `data.access` - Data access operations
- `data.modify` - Data modification
- `data.export` - Data export operations

### System Events
- `system.startup` - System startup
- `system.shutdown` - System shutdown
- `system.config_change` - Configuration changes

## Security Features

### Access Control
- **Encryption**: All audit data encrypted at rest using AES-256
- **Access Logging**: All access to audit data is logged
- **Role-Based Access**: Only authorized personnel can access audit exports

### Data Integrity
- **Immutable**: Audit records cannot be modified once created
- **Hash Verification**: SHA-256 hashes for integrity verification
- **Chain of Custody**: Complete audit trail from creation to export

## Retention Policy

### Active Retention
- **Live Data**: 90 days in production systems
- **Export Files**: 90 days in artifact storage
- **Backup Copies**: 1 year in secure backup systems

### Disposal Process
- **Automated**: Daily cleanup of expired records
- **Verification**: Disposal logged and verified
- **Compliance**: Follows GDPR and data retention requirements

## Usage Examples

### Parse Audit File
```bash
# Parse JSONL file
cat audit-export.jsonl | jq '.timestamp, .event_type, .user_id'

# Filter by event type
cat audit-export.jsonl | jq 'select(.event_type == "auth.login")'

# Search for specific user
cat audit-export.jsonl | jq 'select(.user_id == "user_abc123")'
```

### Generate Reports
```bash
# Count events by type
cat audit-export.jsonl | jq -r '.event_type' | sort | uniq -c

# Timeline analysis
cat audit-export.jsonl | jq -r '.timestamp + " " + .event_type' | sort
```

## Compliance

### GDPR Compliance
- **Data Minimization**: Only necessary audit data retained
- **Right to Erasure**: Audit data can be anonymized upon request
- **Data Portability**: Export format supports data portability

### Security Standards
- **ISO 27001**: Information security management
- **SOC 2**: Security, availability, and confidentiality
- **NIST Cybersecurity Framework**: Risk management and security controls

## Support

For questions about audit data or export procedures:
- **Security Team**: security@zeropoint.ai
- **DevOps Team**: devops@zeropoint.ai
- **Compliance Team**: compliance@zeropoint.ai

---

**Last Updated**: August 10, 2025  
**Version**: 1.0  
**Owner**: DevOps Team
