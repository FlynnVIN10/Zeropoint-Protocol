# Right-Hand Panel Spec - Human Consensus Command Center

## Overview
Transform the right-hand panel into a functional, data-rich command center for Human Consensus. Monitor Synthient status, manage proposals, and interact with Tinygrad, Petals, and Wondercraft services.

## Layout
- **Width**: 24rem minimum, responsive to ≤1280px (no overlap)
- **Theme**: Dark-mode aesthetic, matches `apps/web/styles/tokens.css`
- **Sections**:
  1. Status Dashboard
  2. Proposals
  3. Tinygrad Controls
  4. Petals Interfaces
  5. Wondercraft Interfaces
  6. Audit/Evidence

## Status Dashboard
- **Data Source**: `/status/synthients.json`
- **Fields**: platform status, governance mode, commit, env flags, service health
- **Update**: SSE/polling every 5s
- **Evidence**: Log to `/evidence/phase1/ui/stream/synthients.json.http`

## Proposals
- **List**: GET `/consensus/proposals` or "No proposals yet"
- **Detail**: Select to view details
- **Submit**: Form for POST `/consensus/proposals`
- **Vote**: Form for POST `/consensus/proposals/{id}/vote`
- **Evidence**: Log to `/evidence/phase1/ui/proposals/{create,vote}.http`

## Tinygrad Controls
- **Start**: Form with dataset, model_config, training_params → POST `/api/tinygrad/start`
- **Status**: GET `/api/tinygrad/status/{jobId}`
- **Logs**: GET `/api/tinygrad/logs/{jobId}` in scrollable area
- **Evidence**: Log to `/evidence/phase1/logs/tinygrad/{start,status,logs}.http`

## Petals Interfaces
- **Propose**: Form → POST `/api/petals/propose`
- **Vote**: Form → POST `/api/petals/vote/{proposalId}`
- **Status/Tally**: GET endpoints
- **Evidence**: Log to `/evidence/phase1/logs/petals/`

## Wondercraft Interfaces
- **Contribute**: Form → POST `/api/wondercraft/contribute`
- **Diff**: Form → POST `/api/wondercraft/diff`
- **Status**: GET endpoints
- **Evidence**: Log to `/evidence/phase1/logs/wondercraft/`

## Audit/Evidence
- **Logger**: Every action logs {method, url, headers, status, first120, timestamp, commit}
- **A11y**: Focus states, ARIA, keyboard nav, aria-live for toasts

## Compliance
- Headers: nosniff, no-store
- A11y ≥95
- No mocks in prod
- Dual Consensus enforced
