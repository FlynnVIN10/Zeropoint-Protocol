# Zeropoint Protocol - Architecture
**Local Runtime Architecture (Post-Cloudflare Migration)**

---

## System Overview

Zeropoint Protocol is a local-first, dual-consensus governance platform for Synthient training, proposals, and evidence tracking.

**Runtime:** Next.js (standalone)  
**Database:** SQLite (via Prisma)  
**Deployment:** Local macOS (MacBook Pro / Tinybox Green)  
**No Cloud Dependencies**

---

## Architecture Layers

```
┌─────────────────────────────────────────────┐
│           Client (Browser)                  │
│  - React UI (proposals, synthients)         │
│  - Real-time refresh (1.5s polling)         │
└─────────────────────────────────────────────┘
                    │
                    │ HTTP/JSON
                    ▼
┌─────────────────────────────────────────────┐
│         Next.js Server (Local)              │
│  - App Router API routes                    │
│  - Server-side rendering                    │
│  - Static file serving                      │
└─────────────────────────────────────────────┘
                    │
                    │ Prisma ORM
                    ▼
┌─────────────────────────────────────────────┐
│         SQLite Database (dev.db)            │
│  - Synthients, TrainingRuns                 │
│  - Proposals, Votes                         │
│  - Evidence records                         │
└─────────────────────────────────────────────┘
```

---

## Directory Structure

```
zeropoint-protocol/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── healthz/       # Health check
│   │   ├── readyz/        # Readiness check
│   │   ├── synthients/    # Synthient management
│   │   │   ├── route.ts   # GET/POST synthients
│   │   │   └── [id]/train/route.ts  # Training
│   │   └── proposals/     # Proposal system
│   │       ├── route.ts   # GET/POST proposals
│   │       └── [id]/vote/route.ts   # Voting
│   ├── page.tsx           # Main dashboard UI
│   └── layout.tsx         # Root layout
│
├── lib/
│   └── db.ts              # Prisma client singleton
│
├── prisma/
│   └── schema.prisma      # Database schema
│
├── public/
│   ├── status/
│   │   └── version.json   # Version metadata
│   └── evidence/
│       └── verify/local/  # Evidence storage
│
├── docs/
│   ├── INDEX.md           # Documentation index
│   ├── ARCHITECTURE.md    # This file
│   └── RUNBOOK_LOCAL.md   # Operational guide
│
├── scripts/
│   └── seed.mjs           # Database seeding
│
└── .github/workflows/
    └── ci-local.yml       # Build/test only (no deploy)
```

---

## Data Flow

### Proposal Creation & Voting

```
User fills form
    ↓
POST /api/proposals { title, body }
    ↓
Next.js API route
    ↓
Prisma creates Proposal record
    ↓
Response → UI updates
    ↓
User clicks Approve/Veto
    ↓
POST /api/proposals/:id/vote { voter, decision }
    ↓
Prisma creates Vote record
Prisma updates Proposal.status
    ↓
Response → UI updates
```

### Synthient Training

```
User clicks "Start Training"
    ↓
POST /api/synthients/:id/train
    ↓
Prisma updates Synthient.status = "training"
Prisma creates TrainingRun record
    ↓
setTimeout (simulates async training)
    ↓
After 1.5s:
  Prisma updates TrainingRun (success, metrics)
  Prisma updates Synthient.status = "ready"
    ↓
UI polls and shows updated status
```

---

## Database Schema

### Synthient
```prisma
model Synthient {
  id            String        @id @default(cuid())
  name          String
  status        String        @default("idle")  // idle | training | ready
  lastHeartbeat DateTime?
  runs          TrainingRun[]
}
```

**Purpose:** Represents an AI agent that can be trained

### TrainingRun
```prisma
model TrainingRun {
  id          String    @id @default(cuid())
  synthientId String
  startedAt   DateTime  @default(now())
  finishedAt  DateTime?
  status      String    @default("running")  // running | success | failed
  metrics     Json?
  Synthient   Synthient @relation(...)
}
```

**Purpose:** Tracks individual training sessions

### Proposal
```prisma
model Proposal {
  id        String   @id @default(cuid())
  title     String
  body      String
  createdAt DateTime @default(now())
  status    String   @default("open")  // open | approved | vetoed
  votes     Vote[]
  evidence  Json?
}
```

**Purpose:** Governance proposals for dual-consensus

### Vote
```prisma
model Vote {
  id         String   @id @default(cuid())
  proposalId String
  voter      String
  decision   String   // approve | veto
  reason     String?
  Proposal   Proposal @relation(...)
}
```

**Purpose:** Records approval/veto decisions

---

## API Endpoints

### Health & Status

| Endpoint | Method | Purpose | Response |
|----------|--------|---------|----------|
| `/api/healthz` | GET | Health check | `{ ok: true, service: "web", now: ISO }` |
| `/api/readyz` | GET | Readiness check | `{ ready: true, checks: { db: true }, now: ISO }` |

### Synthients

| Endpoint | Method | Purpose | Response |
|----------|--------|---------|----------|
| `/api/synthients` | GET | List all | Array of Synthient objects |
| `/api/synthients` | POST | Create | New Synthient object |
| `/api/synthients/:id/train` | POST | Start training | `{ started: true, runId: string }` |

### Proposals

| Endpoint | Method | Purpose | Response |
|----------|--------|---------|----------|
| `/api/proposals` | GET | List all | Array of Proposal objects (with votes) |
| `/api/proposals` | POST | Create | New Proposal object |
| `/api/proposals/:id/vote` | POST | Vote | New Vote object |

---

## Technology Stack

### Runtime
- **Next.js 15.0.4** - App Router, API routes, SSR
- **Node.js ≥18** - Server runtime
- **React 18** - UI framework

### Database
- **SQLite** - Local file database (dev.db)
- **Prisma ORM** - Type-safe database client
- **WAL Mode** - Write-Ahead Logging for performance

### Development
- **TypeScript 5** - Type safety
- **ESLint** - Code quality
- **Prisma Studio** - Database GUI

---

## Configuration

### Environment Variables

**Required:**
- `DATABASE_URL` - SQLite file path (e.g., `file:./dev.db`)

**Optional:**
- `LOCAL_MODE` - Flag for local development (1 or 0)
- `MOCKS_DISABLED` - Disable mock data (0 for local dev)
- `NODE_ENV` - Environment (development | production)
- `PORT` - Server port (default: 3000)

### TypeScript Configuration

**tsconfig.json:**
- Target: ES2020
- Module: ESNext
- Path aliases: `@/*` → `./*`
- Strict mode enabled

---

## Security

### Local Security Model

**No exposed ports by default** - Runs on localhost:3000  
**No authentication** - Single-user local development  
**Database file permissions** - Standard Unix permissions  
**No TLS** - Local HTTP only

### For Production Deployment

- [ ] Add authentication middleware
- [ ] Enable HTTPS (reverse proxy)
- [ ] Implement CORS restrictions
- [ ] Add rate limiting
- [ ] Enable security headers middleware

---

## Scalability

### Current (Local)
- Single process
- SQLite file database
- In-memory session state

### Future (Tinybox Green)
- Same architecture (portable)
- Potential: Upgrade to PostgreSQL if needed
- Potential: Add Redis for sessions
- Potential: Multi-process with PM2

---

## Evidence & Compliance

### Status Files
**Location:** `public/status/version.json`  
**Mode:** Local static (manual update)  
**Future:** CI-generated

### Evidence Files
**Location:** `public/evidence/verify/local/`  
**Mode:** Placeholder  
**Future:** Automated evidence generation

---

## CI/CD

### Current Workflow (ci-local.yml)

**Triggers:** PR + Push to main  
**Steps:**
1. Install dependencies
2. Generate Prisma Client
3. Type check
4. Lint (soft fail)
5. Build (with test DB)
6. Verify no deploy steps

**Gates:**
- ✅ Build must succeed
- ✅ Type check must pass
- ✅ No deploy commands allowed

**No deployment** - Local runtime only

---

## Monitoring

### Health Checks
- Automated: UI polls `/api/healthz` every 1.5s
- Manual: `curl http://localhost:3000/api/healthz`

### Database Health
- Checked by `/api/readyz`
- Returns 503 if database unavailable

### Logs
- Next.js dev logs to console
- Production logs to stdout
- Future: Structured logging

---

## Development Workflow

### 1. Start Development
```bash
npm run dev
```

### 2. Make Changes
- Edit code in `app/`, `lib/`, `components/`
- Hot reload active

### 3. Test Locally
- Use UI or curl commands
- Check database with Prisma Studio

### 4. Commit
```bash
git add .
git commit -m "feat: your feature"
git push origin feature-branch
```

### 5. PR & CI
- CI runs automatically
- Must pass all checks
- No deploy step

### 6. Merge
- Dual-consensus required
- Merge to main
- Pull and restart locally

---

## Differences from Cloudflare Version

| Aspect | Cloudflare | Local |
|--------|-----------|-------|
| **Hosting** | Cloudflare Pages | localhost:3000 |
| **Database** | PostgreSQL (planned) | SQLite (dev.db) |
| **Edge Runtime** | Workers | Node.js |
| **Deployment** | wrangler deploy | npm start |
| **KV Storage** | Cloudflare KV | SQLite tables |
| **Functions** | 47 separate files | App Router integrated |
| **Build** | @cloudflare/next-on-pages | next build |
| **CI/CD** | Deploy workflows | Build/test only |

---

## Future Enhancements

### Near-term
- [ ] Add unit tests (Jest/Vitest)
- [ ] Implement integration tests
- [ ] Add PM2 for process management
- [ ] Structured logging

### Medium-term
- [ ] Upgrade to PostgreSQL (if needed)
- [ ] Add authentication (JWT)
- [ ] Implement WebSocket for real-time
- [ ] Add Redis for caching

### Long-term
- [ ] Multi-tenant support
- [ ] Distributed deployment
- [ ] Load balancing
- [ ] Observability stack

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-07  
**Author:** Dev Team  
**Status:** Post-Cloudflare Migration
