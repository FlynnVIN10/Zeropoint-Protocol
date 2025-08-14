# Directive: UX & Functionality Fixes — Dashboard & Interact Page

**From**: Project Manager  
**To**: Dev Team  
**CC**: CTO (OCEAN), CEO (Flynn)  
**Date**: 2025-08-02  
**Phase**: 12  
**Status**: Pending  
**Assigned To**: Dev Team  
**Approved By**: CTO (OCEAN)

**Summary**: Prioritized fixes based on CEO feedback to enhance UX on Dashboard and Interact Page in `zeropointprotocol.ai`, with backend ties to `Zeropoint-Protocol`. Focus on seamless interactions without disruptions.

## 1. Dashboard Auto-Refresh & Scrolling
- **Problem**: Refreshes scroll to bottom, disrupting view.  
- **Tasks**:  
  1. Use SSE/WebSocket (`/v1/dashboard/stream`) for delta updates, avoid full reloads.  
  2. Preserve scroll if reload needed: Store/save position via `localStorage`.  
  3. Add header toggle: `<PauseAutoRefreshToggle />` for manual control.  
- **Deliverable**: Update `/dashboard` route; test no-scroll disruptions.

## 2. Chat Sync & Streaming
- **Problem**: Manual "Sync History" required.  
- **Tasks**:  
  1. Push messages via SSE (`/v1/chat/stream`).  
  2. Auto-append; scroll to bottom only if user at bottom.  
  3. Add typing indicator and loading spinner.  
- **Deliverable**: Enhance `/dashboard/chat`; ensure live updates.

## 3. Agent XP & Status Wheel
- **Problem**: Static XP; placeholder wheel.  
- **Tasks**:  
  1. Stream XP from `/v1/agents/xp`; update UI on changes.  
  2. XP policy: Cap at zero; implement deductions if needed.  
  3. Interactive `<StatusWheel />`: Segments (Active/Idle), gauges (Trust/Ethical), hover tooltips.  
- **Deliverable**: Update agent components; verify real-time.

## 4. JSON Outputs → Rich Components
- **Problem**: Raw JSON unreadable.  
- **Tasks**:  
  1. Parse to visuals: `<HealthTable />` (Service|Status), `<AgentCardGrid />` (XP/Level/Trust/Rating), `<UptimeBadge />`.  
  2. `<JsonViewer />` (collapsible) for debug toggle.  
- **Deliverable**: Reusable components in `src/components`; apply to outputs.

## 5. Interact Page LLM UX
- **Problem**: Static "greeting_consensus" response.  
- **Tasks**:  
  1. Send prompts to `/v1/generate/text` with context.  
  2. Stream text; show first, metadata in footer.  
  3. Add retry/regenerate buttons.  
- **Deliverable**: Update `/interact`; ensure dynamic responses.

## Execution & Reporting
- **Iteration**: Demo fixes in staging; PM verifies each.  
- **Telemetry**: Log UX interactions to `/v1/telemetry`.  
- **Report**: Upload cycle completions to `/PM-to-Dev-Team/status-reports/phase12_ux_fixes_cycle_[n].md`.  
- **Escalation**: Blockers to PM within 30 minutes.

Proceed with symbiotic precision. 