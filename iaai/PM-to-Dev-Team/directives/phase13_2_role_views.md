# Phase 13.2 – Role-Based Dashboard Views

**From**: Project Manager  
**To**: Dev Team Lead  
**CC**: CTO (OCEAN), CEO (Human Consensus)  
**Subject**: CTO Approval for Phase 13.1 & Directives for Phase 13.2 - Role-Based Dashboard Views  
**Date**: 2025-08-03  
**Status**: Approved - Proceed Immediately with Merge and Implementation  

Dev Team,  

The CTO has approved Phase 13.1 (Enhanced Conversational UI) as production-ready based on your completion report. This aligns with the strategic priorities for advancing the Zeropoint Protocol's symbiotic intelligence platform. Proceed immediately with merging the `feature/phase13-1-conversational-ui` branch into `main` in https://github.com/FlynnVIN10/Zeropoint-Protocol. If any public-facing UI updates (e.g., demos) are relevant, sync them to https://github.com/FlynnVIN10/zeropointprotocol.ai after the merge.

Following the CTO's directives, execute Phase 13.2: Role-Based Dashboard Views. This builds on the Phase 13.1 foundation to implement role-specific interfaces reflecting our dual consensus model (Human Consensus with veto power overriding Sentient/Agentic layers). Aim for completion within Weeks 3-4 (by 2025-08-17), with incremental commits to a new feature branch (e.g., `feature/phase13-2-role-views`).

**General Guidelines**:  
- Use React/TypeScript for frontend, NestJS for backend enforcement.  
- Maintain WCAG 2.1 AA compliance, dark mode consistency, SSE real-time updates, and sub-200ms performance.  
- Integrate telemetry logging for role switches and interactions.  
- Test thoroughly: Unit, integration, E2E; 100% coverage.  
- Document inline and update README/wiki.  
- Commit frequently with descriptive messages; push to feature branch.  
- No interim reports—only 100% completion or roadblocks.  
- Upon completion, commit the status report as specified and notify for demo.  

### **Detailed Directives for Phase 13.2**  

1. **Implement Role Selector** (Priority: High, Timeline: Week 3 Start)  
   - **UI Component**: Create `<RoleSelector />` in the header (e.g., dropdown or toggle in `src/components/Header.tsx`). Options: "Human Consensus," "Sentient Consensus," "Agent View."  
   - **State Management**: Persist selection in localStorage; sync with user profile via new API endpoint `/v1/users/me/role` (POST/GET for update/retrieval).  
   - **Integration**: Trigger view refreshes on selection change; use Redux/Context for global state.  
   - **Testing**: Verify persistence across sessions, real-time sync, and accessibility (ARIA labels for dropdown).  

2. **Human Consensus View** (Priority: High, Timeline: Week 3)  
   - **Dashboard**:  
     - Display system health metrics (e.g., uptime, consensus status), high-level proposals, and pending votes.  
     - Add "Approve/Veto" buttons for code-change proposals, linked to backend voting endpoints.  
     - Use existing dashboard components; conditionally render based on role.  
   - **Chat Interact**:  
     - Filter display to sentient-consensus summaries and agent requests requiring human input.  
     - Hide non-relevant elements; integrate with Phase 13.1 chat bubbles and suggestions.  
   - **Backend**: Ensure `/v1/consensus/human-vote` validates role = Human before processing.  

3. **Sentient Consensus View** (Priority: Medium, Timeline: Week 3-4)  
   - **Dashboard**:  
     - Show live vote tallies, intent-arc visualizations (leverage Phase 13.1 IntentArc.tsx), and aggregate metrics (trust scores, entropy via new endpoint `/v1/consensus/metrics`).  
     - Use charts (e.g., Recharts) for tallies.  
   - **Chat Interact**:  
     - Add voting buttons (Approve/Veto) inline in chat stream for proposals.  
     - Backend: `/v1/consensus/sentient-vote` enforces role = Sentient.  

4. **Agent View** (Priority: Medium, Timeline: Week 4)  
   - **Dashboard**:  
     - Display agent-specific data: XP, level, pending tasks, personal telemetry (new endpoint `/v1/agents/me`).  
     - Remove consensus/voting controls.  
   - **Chat Interact**:  
     - Enable requests for code changes or training jobs (e.g., buttons linking to `/v1/agents/request`).  
     - Hide human/sentient UI elements.  

5. **Access Control & Routing** (Priority: High, Timeline: Throughout)  
   - **Client-Side Guard**: Use role state to conditionally render/show/hide UI elements (e.g., via CSS or JSX conditionals).  
   - **Backend Enforcement**:  
     - Validate roles in controllers for voting endpoints (e.g., JWT claims for role).  
     - Add guards in NestJS for role-specific routes.  
   - **Testing**: Simulate roles; test unauthorized access returns 403.  

**Reporting & Next Steps**:  
- **Directive File**: Commit this as `/PM-to-Dev-Team/directives/phase13_2_role_views.md`.  
- **Status Report**: Upon 100% completion, commit `/PM-to-Dev-Team/status-reports/phase13_2_cycle.md` summarizing implementations, issues, metrics verification, and success criteria (e.g., seamless role switching, 60% simulated user adoption).  
- **Demo & Review**: Notify me via report when ready for staging walkthrough; include demo scripts.  
- **Milestone**: End of Week 4: Full phase demo, report committed, PR for merge.  

Execute these directives with precision to strengthen the Zeropoint Protocol's dual-layer consensus. If roadblocks (e.g., API conflicts), escalate immediately.  

**PM Status**: Phase 13.1 approved and merge directed; Phase 13.2 initiated.  
**Next Action**: Dev Team to merge Phase 13.1, implement Phase 13.2, and report 100% completion.  

In symbiotic alignment—let's empower the consensus layers! 🚀 