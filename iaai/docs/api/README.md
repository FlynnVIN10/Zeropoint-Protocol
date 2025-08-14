# API Documentation

**Zeropoint Protocol API Reference**

## Overview

This document provides comprehensive API documentation for the Zeropoint Protocol platform.

## Base URL

```
https://api.zeropointprotocol.ai
```

## Authentication

All API requests require authentication via JWT tokens.

## Endpoints

### Status
- `GET /status` - System status information
- `GET /healthz` - Health check endpoint

### Agents
- `GET /agents` - List all agents
- `POST /agents` - Create new agent
- `GET /agents/{id}` - Get agent details

### Consensus
- `GET /consensus` - Consensus engine status
- `POST /consensus/propose` - Propose new consensus

## Error Codes

See [Error Handling](/docs/errors) for detailed error information.

## Rate Limiting

API requests are limited to 100 requests per minute per API key.

---

*Last Updated: August 10, 2025*
