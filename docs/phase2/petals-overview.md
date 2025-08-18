# Petals Integration (Phase 2) Overview

## Objective
Integrate Petals for Synthiant training, enabling distributed LLM sessions and proposal submission via website UI.

## Components

### **API Interface**: `/iaai/petals/api.py`
- **Purpose**: Connects to Petals nodes; supports training/inference
- **Key Functions**:
  - `connect_petals_node()`: Establish connection to distributed node
  - `run_training_session()`: Execute training with specified model/steps
  - `get_node_status()`: Monitor node health and availability
  - `disconnect_petals_node()`: Clean connection termination

### **Proposal Pipeline**: `/iaai/petals/proposals.py`
- **Purpose**: Submits proposals to SvelteKit `/proposals` UI
- **Key Functions**:
  - `submit_proposal()`: Route proposals to consensus queue
  - `get_proposal_status()`: Track proposal review progress
  - `list_pending_proposals()`: Retrieve queue for dashboard
  - `update_proposal_status()`: Update consensus workflow state
  - `validate_proposal()`: Ensure proposal data integrity

### **Consensus UI**: Dual consensus (Synthiant + Human)
- **Purpose**: Enable transparent proposal review and approval
- **Components**:
  - Proposal dashboard (`/proposals`)
  - Consensus review interface
  - Approval workflow management
  - Status tracking and progress indicators

## Zeroth Principle
- **Good Intent**: Ethical training, auditable code
- **Good Heart**: Transparent, fair UI; no dark patterns

## Next Steps
1. Complete Phase 2 implementation
2. Conduct comprehensive testing
3. Prepare for Phase 3 planning
4. Update documentation and user guides

**Intent**: good heart, good will, GOD FIRST.
