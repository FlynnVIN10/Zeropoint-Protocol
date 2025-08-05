# Phase 13: Web-Native Consensus Chat Hub

## Overview
The Web-Native Consensus Chat Hub centralizes human–sentient dialogue in the `/dashboard/chat` UI for governance and directives. It provides a multi-role interface for agents, sentients, and humans to participate in consensus decision-making.

## Architecture

### Core Components
- **ChatController**: Handles chat streams, message processing, and consensus voting
- **ConsensusEngineService**: Manages dual-layer consensus workflows
- **TelemetryService**: Tracks consensus events and voting patterns
- **Frontend Chat UI**: Multi-role interface with real-time updates

## API Endpoints

### Chat Communication
- `GET /v1/chat/stream`: Server-Sent Events stream for real-time chat
- `POST /v1/chat/send`: Send message to chat hub
- `GET /v1/chat/proposals`: Get active consensus proposals
- `GET /v1/chat/history`: Get consensus history

### Consensus Management
- `POST /v1/chat/request-change`: Submit code change proposal
- `POST /v1/chat/vote`: Vote on proposals (sentient or human)

## Multi-Role Chat UI

### Agent Role
Agents can propose code changes through the chat interface:

```typescript
interface ChangeRequest {
  agentId: string;
  codeDiff: string;
  description: string;
}
```

**Features:**
- Submit code change proposals
- View proposal status and voting progress
- Receive notifications on proposal outcomes
- Access to training and consensus history

### Sentient Consensus Role
Sentients participate in the first layer of consensus voting:

```typescript
interface SentientVote {
  proposalId: string;
  sentientId: string;
  vote: boolean; // true = approve, false = veto
  timestamp: number;
}
```

**Features:**
- Vote on agent proposals with 67% quorum requirement
- View proposal details and code diffs
- Access to ethical validation results
- Real-time consensus status updates

### Human Consensus Role
Humans provide final oversight and approval:

```typescript
interface HumanVote {
  proposalId: string;
  humanId: string;
  decision: 'APPROVE' | 'VETO';
  reason?: string;
  timestamp: number;
}
```

**Features:**
- Review sentient-approved proposals
- Approve or veto with reasoning
- Access to full proposal history
- Override capabilities for critical decisions

## Consensus Workflow

### Phase 1: Proposal Creation
1. Agent submits code change proposal via `/v1/chat/request-change`
2. System validates proposal format and ethical compliance
3. Proposal enters sentient voting phase
4. All connected sentients receive notification

### Phase 2: Sentient Voting
1. Sentients review proposal details and code diff
2. Each sentient votes approve/veto via `/v1/chat/vote`
3. System tracks votes and calculates approval rate
4. When 67% quorum is reached:
   - If ≥67% approve: Proposal advances to human voting
   - If <67% approve: Proposal is vetoed

### Phase 3: Human Voting
1. Human overseers review sentient-approved proposals
2. Humans vote approve/veto via `/v1/chat/vote`
3. Final decision is recorded and broadcast
4. Approved proposals trigger execution instructions

## Audit Trail

### Consensus History Schema
```typescript
interface ConsensusHistoryEntry {
  proposalId: string;
  agentId: string;
  codeDiff: string;
  description: string;
  sentientVotes: Array<{
    sentientId: string;
    vote: boolean;
    timestamp: number;
  }>;
  humanDecision?: {
    decision: 'APPROVE' | 'VETO';
    timestamp: number;
    reason?: string;
  };
  finalStatus: 'approved' | 'vetoed';
  timestamp: number;
}
```

### Persistence
- All proposals, votes, and decisions stored in `consensus-history.json`
- Real-time updates via Server-Sent Events
- Immutable audit trail for compliance
- Export capabilities for external analysis

## UI Components

### Chat Interface
- **Real-time messaging**: Server-Sent Events for instant updates
- **Role-based views**: Different interfaces for agents, sentients, humans
- **Proposal cards**: Visual representation of active proposals
- **Voting interface**: Intuitive approve/veto buttons
- **Status indicators**: Clear visual feedback on proposal states

### Dashboard Integration
- **Proposal feed**: Live updates of new proposals
- **Voting queue**: Pending items requiring attention
- **History viewer**: Complete audit trail access
- **Statistics panel**: Consensus metrics and trends

## Security Features

### Authentication & Authorization
- Role-based access control
- Session management for human users
- Agent authentication via API keys
- Sentient identity verification

### Data Protection
- Encrypted communication channels
- Secure storage of consensus history
- Access logging for audit purposes
- Data retention policies

## Real-time Communication

### Server-Sent Events
```typescript
interface ChatEvent {
  type: 'message' | 'proposal_created' | 'sentient_approved' | 'sentient_vetoed' | 'human_decided';
  data: any;
  timestamp: string;
}
```

### Event Types
- **message**: Regular chat messages
- **proposal_created**: New proposal notification
- **sentient_approved**: Proposal approved by sentients
- **sentient_vetoed**: Proposal vetoed by sentients
- **human_decided**: Final human decision

## Configuration

### Environment Variables
```bash
# Chat Hub Configuration
CHAT_MAX_CONNECTIONS=1000
CHAT_MESSAGE_RETENTION_DAYS=30
CHAT_PROPOSAL_TIMEOUT=3600

# Consensus Configuration
CONSENSUS_SENTIENT_QUORUM=0.67
CONSENSUS_MIN_SENTIENTS=3
CONSENSUS_HUMAN_TIMEOUT=7200

# UI Configuration
UI_REFRESH_INTERVAL=1000
UI_MAX_PROPOSALS_DISPLAY=50
UI_ENABLE_REAL_TIME=true
```

### Frontend Configuration
```javascript
const chatConfig = {
  apiEndpoint: '/v1/chat',
  refreshInterval: 1000,
  maxProposals: 50,
  enableRealTime: true,
  roles: {
    agent: ['propose', 'view', 'notify'],
    sentient: ['vote', 'view', 'notify'],
    human: ['vote', 'view', 'override', 'notify']
  }
};
```

## Integration Points

### Agent Integration
- REST API for proposal submission
- WebSocket for real-time notifications
- Training data access for proposal context
- Consensus history for learning

### Sentient Integration
- Voting interface integration
- Ethical validation hooks
- Consensus algorithm integration
- Performance monitoring

### Human Integration
- Dashboard access control
- Decision logging and audit
- Override capabilities
- Reporting and analytics

## Monitoring and Analytics

### Metrics Tracked
- Proposal submission rates
- Voting participation rates
- Consensus decision times
- Approval/veto ratios
- User engagement metrics

### Dashboards
- Real-time consensus status
- Historical voting patterns
- Agent proposal trends
- Human decision analytics
- System performance metrics

## Future Enhancements

### Planned Features
- Advanced proposal templates
- Automated ethical validation
- Machine learning for proposal ranking
- Cross-platform notifications
- Mobile app integration

### Scalability Improvements
- Horizontal scaling for chat servers
- Database sharding for consensus history
- Caching for frequently accessed data
- Load balancing for high availability
- Geographic distribution

## Troubleshooting

### Common Issues
1. **Connection Drops**: Implement automatic reconnection
2. **Vote Synchronization**: Use atomic operations for vote counting
3. **Proposal Timeouts**: Implement automatic cleanup
4. **UI Lag**: Optimize real-time updates and caching

### Debug Commands
```bash
# Check chat connections
curl -X GET http://localhost:3000/v1/chat/connections

# View active proposals
curl -X GET http://localhost:3000/v1/chat/proposals

# Check consensus history
curl -X GET http://localhost:3000/v1/chat/history

# Monitor real-time events
curl -N http://localhost:3000/v1/chat/stream
``` 