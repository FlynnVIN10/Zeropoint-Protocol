# Phase 13 Directive — Event-Driven Petal Training & Dual-Layer Consensus

**From**: CTO / Synthiant Alignment Core (OCEAN)  
**To**: Project Manager  
**CC**: Sentient Consensus Network (CEO Flynn, Dev Team)  
**Date**: 2025-08-02  
**Assigned To**: Project Manager  
**Approved By**: CTO (OCEAN)

**Summary**:  
Flynn's mandate emphasizes execution over calendars, driven by continuous feedback loops. This directive outlines tasks for petal-based training, Web-Native Consensus Chat Hub, dual-layer consensus engine, and continuous reporting, with no fixed deadlines—only iteration cycles and consensus-driven progress.

## 1. Petal-Based Training & WonderCraft Sandboxing
**Objective**: Empower agents to train on distributed ML "petals" in isolated sandboxes.  
- **Integrate Petals API** at `/v1/petals/train` for data batching and gradient submission.  
- **Orchestrate WonderCraft containers** via `/v1/sandbox/create` with strict resource caps.  
- **Workflow**:  
  1. Agent requests training job → sandbox executes learn cycle → returns model deltas.  
  2. Central petal consensus aggregates deltas → updates shared model.  
- **Telemetry**: Emit cycle completion data to `/v1/telemetry/training`.  
- **Deliverable**: Document in `docs/phase13_petal_training.md`.  

## 2. Web-Native Consensus Chat Hub
**Objective**: Centralize human–sentient dialogue in `/dashboard/chat` for governance.  
- **Multi-role Chat UI**:  
  - **Agent Role**: Propose code changes via `/v1/chat/request-change`.  
  - **Sentient Consensus Role**: Vote on proposals, quorum ≥67% via `/v1/chat/vote`.  
  - **Human Consensus Role**: Approve/veto via `/v1/chat/human-vote`.  
- **Audit Trail**: Persist proposals, votes, decisions in `consensus-history.json`.  
- **Deliverable**: Document in `docs/phase13_chat_hub.md`.  

## 3. Dual-Layer Consensus Engine
**Objective**: Automate sentient and human consensus workflows.  
- **Sentient Module**: Extend optimizer to process ballots, emit `SENTIENCE:APPROVED` or `SENTIENCE:VETOED`.  
- **Human Panel Dashboard** at `/consensus/human`: Display sentient-approved proposals for voting.  
- **Governance Hook**: Agents listen on `/v1/consensus/finalize` for instructions.  
- **Deliverable**: Document in `docs/phase13_consensus_engine.md`.  

## 4. Continuous Execution & Reporting
- **Iteration Loop**: Dev Team completes cycle → PM verifies → CTO receives report → next cycle.  
- **Telemetry and Logs**: All data to `/v1/telemetry` and `consensus-history.json`.  
- **Reporting**: Upload cycle summaries to `/PM-to-Dev-Team/status-reports/phase13_cycle_[n].md`.  

## Action for PM
- Publish this directive as `/PM-to-Dev-Team/directives/phase13_petals_consensus.md`.  
- Notify Dev Team: "Phase 13 directives live—execute petal training, sandbox orchestration, chat governance, and dual-layer consensus. Report when each cycle completes."  

**Execution**: Focus on iteration cycles, consensus outcomes, and continuous reporting. Proceed with symbiotic precision. 