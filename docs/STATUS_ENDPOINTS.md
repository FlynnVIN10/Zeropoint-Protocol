# Status Endpoints Reference

## Overview
All status endpoints return JSON with required security headers and are accessible via both API calls and HTML pages.

## Endpoint Specifications

### Health Check
- **Endpoint**: `/api/healthz`
- **Method**: GET
- **Response**: System health with commit info
- **Headers**: Required security headers

### Readiness Check
- **Endpoint**: `/api/readyz`
- **Method**: GET
- **Response**: System readiness status
- **Headers**: Required security headers

### Version Information
- **Endpoint**: `/status/version.json`
- **Method**: GET
- **Response**: Build information and commit SHA
- **Headers**: Required security headers

### Training Status
- **Endpoint**: `/api/training/status`
- **Method**: GET
- **Response**: Training metrics and pipeline status
- **Headers**: Required security headers

### Petals Status
- **Endpoint**: `/petals/status.json`
- **Method**: GET
- **Response**: Distributed computing service status
- **Headers**: Required security headers

### Wondercraft Status
- **Endpoint**: `/wondercraft/status.json`
- **Method**: GET
- **Response**: AI service operational status
- **Headers**: Required security headers

## Required Security Headers
All endpoints must return:
- `content-type: application/json; charset=utf-8`
- `cache-control: no-store`
- `x-content-type-options: nosniff`
- `content-disposition: inline`
- `access-control-allow-origin: *`

## HTML Status Pages
Each endpoint has a corresponding HTML page with:
- "View JSON" links
- Noscript fallback tables
- Live data display
- Accessibility features

## Evidence Integration
- Endpoints read from evidence files at runtime
- Real-time data updates via `context.env.ASSETS.fetch`
- Fallback values if evidence files unavailable
- Comprehensive error handling and logging
