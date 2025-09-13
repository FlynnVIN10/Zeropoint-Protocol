# Petals Consensus Service Documentation

**Service:** petals
**Priority:** CRITICAL
**Status:** IN_PROGRESS
**Last Updated:** 2025-09-13T00:37:11.421Z

## Overview

Petals Consensus Service provides core functionality for the Zeropoint Protocol platform.

## Architecture

- **Database Schema:** `lib/db/schemas/petals.sql`
- **API Client:** `lib/services/petals-client.ts`
- **Endpoints:** 7

## Endpoints

- `app/api/petals/propose/route.ts`
- `app/api/petals/status/[proposalId]/route.ts`
- `app/api/petals/tally/[proposalId]/route.ts`
- `app/api/petals/vote/[proposalId]/route.ts`
- `app/api/consensus/proposals/route.ts`
- `app/api/consensus/vote/route.ts`
- `app/api/consensus/history/route.ts`

## Required Connections

1. Database connection for proposals and votes
2. Petals network integration
3. Consensus mechanism
4. Proposal lifecycle management
5. Vote tallying system

## Database Schema

The service uses the following database tables:
- See `lib/db/schemas/petals.sql` for complete schema definition

## API Client Usage

```typescript
import { petalsClient } from 'lib/services/petals-client.ts'

// Initialize client
const client = new petalsClient()

// Use client methods
// See client implementation for available methods
```

## Integration Status

- **Current Status:** IN_PROGRESS
- **Database:** Configured
- **API Client:** Implemented
- **Endpoints:** 7 configured

