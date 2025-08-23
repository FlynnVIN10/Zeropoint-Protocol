# Status Endpoints Documentation

## Overview
Zeropoint Protocol provides comprehensive status monitoring through RESTful API endpoints and HTML status pages. All endpoints return structured JSON with consistent headers and support both programmatic access and human-readable display.

## API Endpoints

### 1. Health Check - `/api/healthz`
**Purpose**: System health monitoring with commit information
**Method**: GET
**Response**: 
```json
{
  "status": "ok",
  "uptime": 3600,
  "commit": "afaeda9c"
}
```
**Headers**:
- `content-type: application/json; charset=utf-8`
- `cache-control: no-store`
- `x-content-type-options: nosniff`
- `content-disposition: inline`
- `access-control-allow-origin: *`

### 2. Readiness Check - `/api/readyz`
**Purpose**: Service readiness verification
**Method**: GET
**Response**:
```json
{
  "ready": true,
  "db": true,
  "cache": true
}
```
**Headers**: Same as health endpoint

### 3. Version Information - `/status/version.json`
**Purpose**: Build and deployment information
**Method**: GET
**Response**:
```json
{
  "commit": "afaeda9c",
  "buildTime": "2025-08-23T01:22:25Z",
  "env": "prod"
}
```
**Headers**: Same as health endpoint

### 4. Training Status - `/api/training/status`
**Purpose**: Training pipeline operational status
**Method**: GET
**Response**:
```json
{
  "status": "idle",
  "lastRun": "2025-08-23T01:25:00Z",
  "nextRun": "2025-08-23T06:00:00Z",
  "configured": true,
  "message": "Training workflow operational"
}
```
**Headers**: Same as health endpoint

### 5. Petals Status - `/petals/status.json`
**Purpose**: Distributed computing network status
**Method**: GET
**Response**:
```json
{
  "configured": true,
  "active": true,
  "lastContact": "2025-08-23T01:21:24.860Z",
  "notes": "Petals distributed computing network - operational status"
}
```
**Headers**: Same as health endpoint

### 6. Wondercraft Status - `/wondercraft/status.json`
**Purpose**: AI model service status
**Method**: GET
**Response**:
```json
{
  "configured": true,
  "active": true,
  "lastContact": "2025-08-23T01:21:30.037Z",
  "notes": "Wondercraft AI model service - operational status"
}
```
**Headers**: Same as health endpoint

## HTML Status Pages

### 1. Health Status - `/status/health/`
**Features**:
- Live health data display
- Noscript fallback tables
- View JSON link
- Real-time commit information

### 2. Ready Status - `/status/ready/`
**Features**:
- Service readiness display
- Database and cache status
- Noscript fallback tables
- View JSON link

### 3. Version Status - `/status/version/`
**Features**:
- Build information display
- Commit hash and build time
- Environment information
- Noscript fallback tables

### 4. Training Status - `/status/training/`
**Features**:
- Training pipeline status
- Last run information
- Next scheduled run
- Metrics display

### 5. Petals Status - `/status/petals/`
**Features**:
- Distributed computing status
- Network connectivity
- Operational metrics
- Service notes

### 6. Wondercraft Status - `/status/wondercraft/`
**Features**:
- AI service status
- Model availability
- Performance metrics
- Service notes

## Noscript Support

All status pages include `<noscript>` sections with static tables displaying the same information available via JavaScript. This ensures accessibility and functionality even when JavaScript is disabled.

### Example Noscript Structure
```html
<noscript>
  <table>
    <tr><th>Status</th><td>ok</td></tr>
    <tr><th>Commit</th><td>afaeda9c</td></tr>
    <tr><th>Build Time</th><td>2025-08-23T01:22:25Z</td></tr>
  </table>
</noscript>
```

## Monitoring and Verification

### Daily Probes
- Automated health checks every 6 hours
- Evidence collection in `/evidence/v19/deploy_log.txt`
- Lighthouse audits for accessibility and performance

### Verification Gates
- CI/CD pipeline validation
- Header compliance checking
- Response format validation
- Evidence drift detection

### Compliance Requirements
- All endpoints must return 200 OK
- Required headers must be present
- JSON responses must be valid
- Noscript fallbacks must display data
- Evidence must be canonicalized

## Integration

### Frontend Integration
```javascript
// Fetch status data
fetch('/api/healthz')
  .then(response => response.json())
  .then(data => {
    document.getElementById('status').textContent = data.status;
    document.getElementById('commit').textContent = data.commit;
  });
```

### Backend Integration
```bash
# Health check
curl -i https://zeropointprotocol.ai/api/healthz

# Training status
curl -i https://zeropointprotocol.ai/api/training/status

# All endpoints
curl -i https://zeropointprotocol.ai/status/version.json
```

## Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure `access-control-allow-origin` header is set
2. **Cache Issues**: Use `cache-control: no-store` for real-time data
3. **JavaScript Errors**: Check browser console for fetch failures
4. **Header Mismatches**: Verify all required headers are present

### Debug Commands
```bash
# Check endpoint status
curl -i https://zeropointprotocol.ai/api/healthz

# Verify headers
curl -I https://zeropointprotocol.ai/status/version.json

# Test noscript fallback
curl -s https://zeropointprotocol.ai/status/health/ | grep -A 10 noscript
```
