# Soulchain RPC Endpoint

## Endpoint
POST /v1/soulchain/telemetry

## Purpose
Receive real-time telemetry data from Soulchain for consensus optimization and health analysis.

## Authentication
Public endpoint - no authentication required for telemetry submission.

## Request Payload

### Required Fields
```json
{
  "consensus": {
    "entropy": 0.45,
    "participants": 15,
    "activeVoices": 11,
    "passiveStances": 4,
    "consensusRatio": 0.73
  },
  "agents": [
    {
      "id": "agent_001",
      "intent": "support",
      "state": "active",
      "stake": 500
    },
    {
      "id": "agent_002", 
      "intent": "neutral",
      "state": "passive",
      "stake": 300
    }
  ],
  "timestamp": "2025-08-01T04:30:00.000Z"
}
```

### Field Descriptions

#### consensus
- **entropy** (number): System complexity measure (0.0 - 1.0)
- **participants** (number): Total number of active participants
- **activeVoices** (number): Participants with active intent
- **passiveStances** (number): Participants with neutral intent
- **consensusRatio** (number): Current consensus agreement ratio

#### agents
- **id** (string): Unique agent identifier
- **intent** (string): Agent's current intent ("support", "oppose", "neutral")
- **state** (string): Agent's current state ("active", "passive", "inactive")
- **stake** (number): Agent's current stake amount

#### timestamp
- **timestamp** (string): ISO 8601 timestamp of telemetry data

## Response

### Success Response (200)
```json
{
  "status": "received",
  "timestamp": 1754022600000,
  "optimizedThreshold": 0.67,
  "health": {
    "health": "good",
    "recommendations": [
      "Increase participant engagement",
      "Reduce consensus entropy through better alignment"
    ]
  }
}
```

### Error Response (400/500)
```json
{
  "success": false,
  "message": "Invalid telemetry data format"
}
```

## Response Fields

### status
- **status** (string): Always "received" for successful submissions

### timestamp
- **timestamp** (number): Unix timestamp of when telemetry was processed

### optimizedThreshold
- **optimizedThreshold** (number): AI-optimized consensus threshold (0.5 - 0.85)

### health
- **health** (string): Consensus health status ("excellent", "good", "fair", "poor")
- **recommendations** (array): List of improvement recommendations

## Usage Examples

### cURL Example
```bash
curl -X POST http://localhost:3000/v1/soulchain/telemetry \
  -H "Content-Type: application/json" \
  -d '{
    "consensus": {
      "entropy": 0.45,
      "participants": 15,
      "activeVoices": 11,
      "passiveStances": 4,
      "consensusRatio": 0.73
    },
    "agents": [
      {
        "id": "agent_001",
        "intent": "support",
        "state": "active",
        "stake": 500
      }
    ],
    "timestamp": "2025-08-01T04:30:00.000Z"
  }'
```

### JavaScript Example
```javascript
const telemetryData = {
  consensus: {
    entropy: 0.45,
    participants: 15,
    activeVoices: 11,
    passiveStances: 4,
    consensusRatio: 0.73
  },
  agents: [
    {
      id: "agent_001",
      intent: "support",
      state: "active",
      stake: 500
    }
  ],
  timestamp: new Date().toISOString()
};

const response = await fetch('/v1/soulchain/telemetry', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(telemetryData)
});

const result = await response.json();
console.log('Optimized threshold:', result.optimizedThreshold);
console.log('Health status:', result.health.health);
```

## Rate Limiting
- Maximum 100 requests per minute per IP
- Burst limit: 10 requests per second

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Invalid payload format |
| 413 | Payload too large |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

## Logging
All telemetry submissions are logged with:
- SOULCONS:OPTIMIZED - Consensus optimization results
- SOULCONS:HEALTH - Health analysis results
- Request metadata (IP, timestamp, payload size)

## Security Considerations
- Telemetry data is sanitized before processing
- No sensitive information is logged
- GDPR compliance maintained for EU users
- Rate limiting prevents abuse

## Integration Notes
- Designed for real-time consensus optimization
- Compatible with Phase 9 AI integration
- Supports UE5 visualizer bridge interface
- Maintains backward compatibility with existing consensus system 