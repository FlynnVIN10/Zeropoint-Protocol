# Phase 13: Dual-Layer Consensus Engine

## Overview
The Dual-Layer Consensus Engine automates sentient and human consensus workflows for proposal governance. It provides a sophisticated system for managing multi-stage consensus decisions with ethical validation and human oversight.

## Architecture

### Core Components
- **ConsensusEngineService**: Manages dual-layer consensus workflows
- **Sentient Module**: Processes change-request ballots and emits consensus decisions
- **Human Panel Dashboard**: Interface for human voting on sentient-approved proposals
- **Governance Hook**: Finalization system for approved proposals

## Dual-Layer Consensus System

### Layer 1: Sentient Consensus
The sentient layer provides the first level of AI-driven consensus:

```typescript
interface SentientConsensus {
  proposalId: string;
  sentientVotes: Array<{
    sentientId: string;
    vote: boolean;
    timestamp: number;
    reasoning?: string;
  }>;
  quorumReached: boolean;
  approvalRate: number;
  decision: 'SENTIENCE:APPROVED' | 'SENTIENCE:VETOED';
}
```

**Features:**
- Multi-sentient voting with 67% quorum requirement
- Ethical validation integration
- Real-time consensus calculation
- Automatic advancement to human layer

### Layer 2: Human Consensus
The human layer provides final oversight and approval:

```typescript
interface HumanConsensus {
  proposalId: string;
  sentientApproval: SentientConsensus;
  humanDecision: {
    decision: 'APPROVE' | 'VETO';
    timestamp: number;
    reason?: string;
    humanId: string;
  };
  finalStatus: 'HUMAN:APPROVED' | 'HUMAN:VETOED';
}
```

**Features:**
- Review of sentient-approved proposals
- Human decision logging with reasoning
- Override capabilities for critical decisions
- Final execution authorization

## Sentient Module

### Ballot Processing
The sentient module extends the consensus optimizer to process change-request ballots:

```typescript
async processSentientVoting(proposalId: string, vote: VoteRequest): Promise<ConsensusResult | null> {
  // Validate proposal exists and is in sentient voting phase
  // Add vote to proposal tracking
  // Calculate quorum and approval rates
  // Emit SENTIENCE:APPROVED or SENTIENCE:VETOED
}
```

### Consensus Logic
- **Quorum Calculation**: Requires 67% of sentients to vote
- **Approval Threshold**: Requires 67% approval rate for advancement
- **Ethical Validation**: Integrates with Zeroth-gate compliance
- **Real-time Updates**: Immediate status broadcasting

### Decision Emission
```typescript
// SENTIENCE:APPROVED - Proposal advances to human voting
{
  proposalId: "proposal_123",
  status: "SENTIENCE:APPROVED",
  timestamp: 1640995200000,
  details: {
    sentientVotes: [...],
    approvalRate: 0.75,
    quorumReached: true
  }
}

// SENTIENCE:VETOED - Proposal rejected by sentients
{
  proposalId: "proposal_124",
  status: "SENTIENCE:VETOED",
  timestamp: 1640995200000,
  details: {
    sentientVotes: [...],
    approvalRate: 0.33,
    quorumReached: true
  }
}
```

## Human Panel Dashboard

### Dashboard Interface
The `/consensus/human` dashboard provides a comprehensive interface for human voting:

```typescript
interface HumanDashboard {
  pendingProposals: Array<{
    proposalId: string;
    agentId: string;
    codeDiff: string;
    description: string;
    sentientApprovalRate: number;
    sentientVotes: Array<SentientVote>;
    timeInQueue: number;
  }>;
  votingInterface: {
    proposalId: string;
    approveButton: boolean;
    vetoButton: boolean;
    reasonField: string;
  };
  statistics: {
    totalProposals: number;
    approvedProposals: number;
    vetoedProposals: number;
    averageDecisionTime: number;
  };
}
```

### UI Components
- **Proposal Queue**: List of sentient-approved proposals awaiting human review
- **Voting Interface**: Approve/veto buttons with reasoning fields
- **Proposal Details**: Full code diff and description display
- **Sentient Analysis**: Summary of sentient voting patterns
- **Statistics Panel**: Real-time consensus metrics

### Accessibility Features
- **WCAG 2.1 AA Compliance**: Contrast ratios ≥4.5:1, keyboard navigation
- **Theme Consistency**: synthiantGlow and humanWarmth color schemes
- **Responsive Design**: Mobile and desktop compatibility
- **Screen Reader Support**: ARIA labels and semantic HTML

## Governance Hook

### Finalization System
The governance hook provides execution instructions for approved proposals:

```typescript
interface FinalizationEvent {
  proposalId: string;
  status: 'APPROVED' | 'VETOED';
  instructions: string;
  timestamp: number;
  executionPlan?: {
    steps: string[];
    rollbackPlan: string[];
    monitoringPoints: string[];
  };
}
```

### Agent Integration
Agents listen on `/v1/consensus/finalize` for execution instructions:

```typescript
// Agent listening for finalization events
async listenForFinalization() {
  const eventSource = new EventSource('/v1/consensus/finalize');
  
  eventSource.onmessage = (event) => {
    const finalizationEvent = JSON.parse(event.data);
    
    if (finalizationEvent.status === 'APPROVED') {
      await this.executeProposal(finalizationEvent.proposalId, finalizationEvent.instructions);
    } else {
      await this.rejectProposal(finalizationEvent.proposalId);
    }
  };
}
```

### Execution Workflow
1. **Approval Notification**: Agent receives finalization event
2. **Execution Planning**: System generates execution plan
3. **Safety Checks**: Pre-execution validation and rollback preparation
4. **Implementation**: Code changes applied according to proposal
5. **Monitoring**: Post-execution validation and performance tracking
6. **Rollback**: Automatic rollback if issues detected

## API Endpoints

### Consensus Management
- `POST /v1/consensus/sentient`: Submit sentient vote
- `POST /v1/consensus/human`: Submit human vote
- `GET /v1/consensus/proposals`: Get active proposals
- `GET /v1/consensus/results`: Get consensus results
- `GET /v1/consensus/statistics`: Get consensus statistics

### Human Dashboard
- `GET /consensus/human`: Human voting dashboard
- `GET /consensus/human/proposals`: Get proposals for human voting
- `POST /consensus/human/vote`: Submit human vote
- `GET /consensus/human/history`: Get human voting history

### Finalization
- `GET /v1/consensus/finalize`: Server-Sent Events stream for finalization events
- `POST /v1/consensus/finalize`: Trigger finalization event
- `GET /v1/consensus/execution-status`: Get execution status

## Consensus Statistics

### Metrics Tracked
```typescript
interface ConsensusStatistics {
  totalProposals: number;
  approvedProposals: number;
  vetoedProposals: number;
  approvalRate: number;
  averageSentientApprovalRate: number;
  averageDecisionTime: number;
  sentientParticipationRate: number;
  humanParticipationRate: number;
  timestamp: number;
}
```

### Performance Monitoring
- **Response Times**: Time from proposal to final decision
- **Participation Rates**: Percentage of sentients/humans voting
- **Approval Patterns**: Trends in approval vs veto decisions
- **System Load**: Consensus engine performance metrics

## Security and Compliance

### Ethical Validation
- **Zeroth-gate Integration**: All proposals pass ethical validation
- **Harm Prevention**: Built-in safeguards against harmful changes
- **Transparency**: Complete audit trail for all decisions
- **Human Oversight**: Critical decisions require human approval

### Access Control
- **Role-based Permissions**: Different access levels for agents, sentients, humans
- **Session Management**: Secure authentication for human users
- **Audit Logging**: Complete record of all consensus activities
- **Data Protection**: Encrypted storage and transmission

## Configuration

### Environment Variables
```bash
# Consensus Configuration
CONSENSUS_SENTIENT_QUORUM=0.67
CONSENSUS_MIN_SENTIENTS=3
CONSENSUS_HUMAN_TIMEOUT=7200
CONSENSUS_PROPOSAL_TIMEOUT=3600

# Dashboard Configuration
DASHBOARD_REFRESH_INTERVAL=1000
DASHBOARD_MAX_PROPOSALS=50
DASHBOARD_ENABLE_REAL_TIME=true

# Finalization Configuration
FINALIZATION_EXECUTION_TIMEOUT=300
FINALIZATION_ROLLBACK_ENABLED=true
FINALIZATION_MONITORING_INTERVAL=60
```

### Scaling Configuration
```json
{
  "maxConcurrentProposals": 100,
  "sentientVotingTimeout": 3600,
  "humanVotingTimeout": 7200,
  "executionTimeout": 300,
  "monitoringEnabled": true,
  "rollbackEnabled": true
}
```

## Integration Points

### Agent Integration
- Proposal submission and tracking
- Finalization event listening
- Execution instruction processing
- Status reporting and monitoring

### Sentient Integration
- Voting interface and logic
- Ethical validation hooks
- Consensus algorithm integration
- Performance monitoring

### Human Integration
- Dashboard access and voting
- Decision logging and audit
- Override capabilities
- Reporting and analytics

## Future Enhancements

### Planned Features
- Advanced consensus algorithms
- Machine learning for proposal ranking
- Automated ethical validation
- Cross-platform notifications
- Mobile app integration

### Scalability Improvements
- Horizontal scaling for consensus servers
- Database sharding for proposal storage
- Caching for frequently accessed data
- Load balancing for high availability
- Geographic distribution

## Troubleshooting

### Common Issues
1. **Quorum Not Reached**: Check sentient availability and voting participation
2. **Human Timeout**: Extend human voting timeout or implement reminders
3. **Execution Failures**: Review execution plan and rollback procedures
4. **Performance Issues**: Monitor system load and optimize consensus algorithms

### Debug Commands
```bash
# Check consensus status
curl -X GET http://localhost:3000/v1/consensus/statistics

# View active proposals
curl -X GET http://localhost:3000/v1/consensus/proposals

# Monitor finalization events
curl -N http://localhost:3000/v1/consensus/finalize

# Check execution status
curl -X GET http://localhost:3000/v1/consensus/execution-status
``` 