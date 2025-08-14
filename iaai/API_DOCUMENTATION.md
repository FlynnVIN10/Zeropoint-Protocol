# Zeropoint Protocol API Documentation

**© [2025] Zeropoint Protocol (C Corp). All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed license. See LICENSE.md for details.**

## Overview

The Zeropoint Protocol API Gateway provides a unified interface for accessing AI generation services, IPFS storage, authentication, and blockchain operations. All endpoints are versioned under `/v1/` and include comprehensive monitoring, validation, and ethical compliance features.

## Base URL

```
https://api.zeropointprotocol.ai/v1
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Versioning

- **Current Version**: v1
- **Base Path**: `/v1/`
- **Legacy Support**: Some legacy endpoints are maintained for backward compatibility
- **Deprecation Timeline**: Legacy endpoints will be removed in v2.0

## Core Endpoints

### Gateway Status

#### GET `/v1/`
Returns the gateway welcome message.

**Response:**
```json
{
  "message": "Zeropoint Protocol API Gateway v1.0"
}
```

#### GET `/v1/status`
Returns comprehensive gateway status information.

**Response:**
```json
{
  "service": "Zeropoint Protocol API Gateway",
  "version": "1.0.0",
  "status": "operational",
  "timestamp": "2025-01-26T14:30:00.000Z",
  "endpoints": {
    "auth": ["/v1/register", "/v1/login", "/v1/protected"],
    "generation": ["/v1/generate-text", "/v1/generate-image", "/v1/generate-code"],
    "storage": ["/v1/ipfs/upload", "/v1/ipfs/download", "/v1/ipfs/list"],
    "monitoring": ["/v1/health", "/v1/metrics", "/v1/ledger-metrics"],
    "blockchain": ["/v1/soulchain/persist"]
  }
}
```

#### GET `/v1/health`
Returns health status of all services.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-26T14:30:00.000Z",
  "services": {
    "database": "connected",
    "ipfs": "ready",
    "python_backend": "healthy"
  },
  "metrics": {
    "active_connections": 42,
    "uptime": 3600
  }
}
```

## AI Generation Endpoints

### Text Generation

#### POST `/v1/generate-text`
Generates text using the Python backend AI models.

**Request Body:**
```json
{
  "text": "Write a story about a robot learning to paint",
  "options": {
    "max_length": 500,
    "temperature": 0.7,
    "top_p": 0.9
  }
}
```

**Response:**
```json
{
  "generated_text": "Once upon a time, in a world where robots and humans coexisted...",
  "model": "bloom-7b1",
  "tokens_used": 150,
  "processing_time": 2.3
}
```

### Image Generation

#### POST `/v1/generate-image`
Generates images using Stable Diffusion models.

**Request Body:**
```json
{
  "prompt": "A serene mountain landscape at sunset with golden clouds",
  "options": {
    "size": "512x512",
    "style": "realistic",
    "guidance_scale": 7.5,
    "num_inference_steps": 50
  }
}
```

**Response:**
```json
{
  "image_url": "https://ipfs.io/ipfs/QmX...",
  "cid": "QmX...",
  "prompt": "A serene mountain landscape at sunset with golden clouds",
  "model": "stable-diffusion-v1-5",
  "processing_time": 15.2
}
```

### Code Generation

#### POST `/v1/generate-code`
Generates code in various programming languages.

**Request Body:**
```json
{
  "prompt": "Create a function to calculate fibonacci numbers",
  "language": "python"
}
```

**Response:**
```json
{
  "code": "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)",
  "language": "python",
  "explanation": "This function uses recursion to calculate fibonacci numbers...",
  "model": "codegen-16b",
  "processing_time": 1.8
}
```

### Legacy Endpoint (Deprecated)

#### POST `/v1/generate`
**⚠️ DEPRECATED: Use `/v1/generate-text` instead**

Legacy endpoint for text generation. Will be removed in v2.0.

**Request Body:**
```json
{
  "text": "Legacy prompt"
}
```

## Authentication Endpoints

### User Registration

#### POST `/v1/register`
Registers a new user account.

**Request Body:**
```json
{
  "username": "newuser",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "id": 123,
  "username": "newuser",
  "message": "User registered successfully"
}
```

### User Login

#### POST `/v1/login`
Authenticates user and returns JWT token.

**Request Body:**
```json
{
  "username": "newuser",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 123,
    "username": "newuser"
  }
}
```

### Protected Route

#### GET `/v1/protected`
Access protected content (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "message": "You have accessed a protected route.",
  "user_id": 123
}
```

## IPFS Storage Endpoints

### File Upload

#### POST `/v1/ipfs/upload`
Uploads a file to IPFS storage.

**Request:**
```
Content-Type: multipart/form-data

file: <file-buffer>
rationale: "Storing user-generated content for decentralized access"
```

**Response:**
```json
{
  "success": true,
  "cid": "QmX...",
  "filename": "document.pdf",
  "size": 1024000,
  "message": "File uploaded successfully"
}
```

### File Download

#### GET `/v1/ipfs/download/:cid`
Downloads a file from IPFS storage.

**Request Body:**
```json
{
  "rationale": "Downloading user-requested file for local access"
}
```

**Response:**
```
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="file-QmX..."

<file-buffer>
```

### Directory Listing

#### GET `/v1/ipfs/list/:cid`
Lists contents of an IPFS directory.

**Response:**
```json
{
  "success": true,
  "cid": "QmX...",
  "entries": [
    {
      "name": "file1.txt",
      "cid": "QmY...",
      "size": 1024,
      "type": "file"
    },
    {
      "name": "folder1",
      "cid": "QmZ...",
      "size": 0,
      "type": "directory"
    }
  ],
  "count": 2
}
```

## Soulchain Blockchain Endpoints

### Persist Ledger

#### POST `/v1/soulchain/persist`
Persists the current soulchain ledger to IPFS.

**Response:**
```json
{
  "success": true,
  "cid": "QmX...",
  "message": "Soulchain ledger persisted to IPFS successfully"
}
```

## Petals Integration Endpoints

### Code Proposal

#### POST `/v1/petals/propose`
Submits a code proposal to the Petals distributed training network.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "rationale": "Improving code generation for Python web frameworks",
  "proposedCode": "def create_web_app():\n    app = Flask(__name__)\n    return app",
  "agentId": "agent-123",
  "context": "Web development framework optimization"
}
```

**Response:**
```json
{
  "success": true,
  "response": {
    "accepted": true,
    "feedback": "Good proposal for Flask integration",
    "training_cycle": "cycle-456"
  },
  "message": "Petals proposal processed successfully"
}
```

## Monitoring Endpoints

### Prometheus Metrics

#### GET `/v1/metrics`
Returns Prometheus-formatted metrics.

**Response:**
```
# HELP api_requests_total Total API requests
# TYPE api_requests_total counter
api_requests_total{method="POST",endpoint="generate-text",status="200"} 150

# HELP api_request_duration_seconds API request duration in seconds
# TYPE api_request_duration_seconds histogram
api_request_duration_seconds_bucket{method="POST",endpoint="generate-text",le="0.1"} 10
api_request_duration_seconds_bucket{method="POST",endpoint="generate-text",le="0.5"} 45
api_request_duration_seconds_bucket{method="POST",endpoint="generate-text",le="1"} 120
api_request_duration_seconds_bucket{method="POST",endpoint="generate-text",le="+Inf"} 150

# HELP python_backend_latency_seconds Python backend request latency
# TYPE python_backend_latency_seconds histogram
python_backend_latency_seconds_bucket{endpoint="generate-text",le="0.1"} 5
python_backend_latency_seconds_bucket{endpoint="generate-text",le="0.5"} 25
python_backend_latency_seconds_bucket{endpoint="generate-text",le="1"} 80
python_backend_latency_seconds_bucket{endpoint="generate-text",le="+Inf"} 150
```

### Soulchain Metrics

#### GET `/v1/ledger-metrics`
Returns soulchain-specific metrics.

**Response:**
```
# HELP soulchain_transactions_total Total soulchain transactions
# TYPE soulchain_transactions_total counter
soulchain_transactions_total{agent_id="api-gateway"} 1250

# HELP soulchain_ledger_size_bytes Soulchain ledger size in bytes
# TYPE soulchain_ledger_size_bytes gauge
soulchain_ledger_size_bytes 1048576
```

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error_code": "ERROR_CODE",
  "timestamp": "2025-01-26T14:30:00.000Z"
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Request validation failed
- `AUTHENTICATION_ERROR`: Authentication required or failed
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `ZEROTH_VIOLATION`: Ethical compliance check failed
- `BACKEND_ERROR`: Python backend service error
- `IPFS_ERROR`: IPFS storage error
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Internal server error

### Rate Limiting

- **Standard Endpoints**: 100 requests per minute
- **Generation Endpoints**: 20 requests per minute
- **File Upload**: 10 requests per minute
- **Authentication**: 5 requests per minute

## Validation Rules

### Text Generation
- `text`: Required string, min length 1, max length 10000
- `options.max_length`: Optional number, min 1, max 5000
- `options.temperature`: Optional number, min 0.1, max 2.0
- `options.top_p`: Optional number, min 0.1, max 1.0

### Image Generation
- `prompt`: Required string, min length 1, max length 1000
- `options.size`: Optional string, must match pattern `^\d+x\d+$`
- `options.style`: Optional string, enum: ["realistic", "artistic", "cartoon"]
- `options.guidance_scale`: Optional number, min 1.0, max 20.0

### Code Generation
- `prompt`: Required string, min length 1, max length 5000
- `language`: Optional string, enum: ["python", "javascript", "java", "cpp", "go"]

### Authentication
- `username`: Required string, min length 3, max length 50, alphanumeric
- `password`: Required string, min length 6, max length 100

## Zeroth-Gate Compliance

All endpoints are subject to ethical compliance checks through the Zeroth-gate system. Requests that violate ethical principles will be rejected with a `ZEROTH_VIOLATION` error.

### Compliance Requirements

1. **Benevolent Intent**: All requests must demonstrate good intent
2. **Ethical Use**: No harmful or malicious applications
3. **Privacy Respect**: No unauthorized data access
4. **Fair Use**: No abuse of system resources

## Deprecation Timeline

### Phase 1 (Current)
- Legacy `/v1/generate` endpoint marked as deprecated
- New `/v1/generate-text` endpoint recommended

### Phase 2 (v1.5 - Q2 2025)
- Legacy endpoint will show deprecation warnings
- Documentation will emphasize new endpoints

### Phase 3 (v2.0 - Q4 2025)
- Legacy endpoints will be removed
- Breaking changes will be introduced

## SDKs and Libraries

### JavaScript/TypeScript
```bash
npm install @zeropoint/api-client
```

```javascript
import { ZeropointClient } from '@zeropoint/api-client';

const client = new ZeropointClient({
  baseUrl: 'https://api.zeropointprotocol.ai/v1',
  token: 'your-jwt-token'
});

const response = await client.generateText({
  text: 'Hello, world!',
  options: { max_length: 100 }
});
```

### Python
```bash
pip install zeropoint-api-client
```

```python
from zeropoint_api import ZeropointClient

client = ZeropointClient(
    base_url='https://api.zeropointprotocol.ai/v1',
    token='your-jwt-token'
)

response = client.generate_text(
    text='Hello, world!',
    options={'max_length': 100}
)
```

## Support and Contact

- **API Documentation**: https://docs.zeropointprotocol.ai
- **Support Email**: support@zeropointprotocol.ai
- **Status Page**: https://status.zeropointprotocol.ai
- **GitHub Issues**: https://github.com/FlynnVIN10/Zeropoint-Protocol/issues

---

**© [2025] Zeropoint Protocol (C Corp). All Rights Reserved.**
**View-Only License: No clone, modify, run or distribute without signed license.**
**Contact legal@zeropointprotocol.ai for licensing inquiries.** 