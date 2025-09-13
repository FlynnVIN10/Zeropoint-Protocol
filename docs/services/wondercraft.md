# Wondercraft Contribution Service Documentation

**Service:** wondercraft
**Priority:** HIGH
**Status:** IN_PROGRESS
**Last Updated:** 2025-09-13T00:37:11.422Z

## Overview

Wondercraft Contribution Service provides core functionality for the Zeropoint Protocol platform.

## Architecture

- **Database Schema:** `lib/db/schemas/wondercraft.sql`
- **API Client:** `lib/services/wondercraft-client.ts`
- **Endpoints:** 4

## Endpoints

- `app/api/wondercraft/contribute/route.ts`
- `app/api/wondercraft/diff/route.ts`
- `app/api/wondercraft/diff/[assetId]/route.ts`
- `app/api/wondercraft/status/[contributionId]/route.ts`

## Required Connections

1. Database connection for contributions
2. Wondercraft API integration
3. Asset management system
4. Contribution workflow
5. Diff generation and tracking

## Database Schema

The service uses the following database tables:
- See `lib/db/schemas/wondercraft.sql` for complete schema definition

## API Client Usage

```typescript
import { wondercraftClient } from 'lib/services/wondercraft-client.ts'

// Initialize client
const client = new wondercraftClient()

// Use client methods
// See client implementation for available methods
```

## Integration Status

- **Current Status:** IN_PROGRESS
- **Database:** Configured
- **API Client:** Implemented
- **Endpoints:** 4 configured

