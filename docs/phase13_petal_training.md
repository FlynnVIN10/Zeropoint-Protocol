# Phase 13: Petal-Based Training & WonderCraft Sandboxing

## Overview
This document outlines the implementation of petal-based training with WonderCraft sandboxing for the Zeropoint Protocol. The system enables agents to train on distributed ML "petals" in isolated containers with strict resource caps.

## Architecture

### Core Components
- **PetalsController**: Handles training requests and orchestrates the training workflow
- **PetalsService**: Manages distributed ML training cycles and model aggregation
- **SandboxService**: Orchestrates WonderCraft containers with resource isolation
- **TelemetryService**: Emits training cycle completion data

## API Endpoints

### Petal Training
- `POST /v1/petals/train`: Submit training job with data batching and gradient submission
- `GET /v1/petals/status/:cycleId`: Get training cycle status
- `GET /v1/petals/model/shared`: Retrieve shared model state

### Sandbox Management
- `POST /v1/sandbox/create`: Create isolated WonderCraft container
- `POST /v1/sandbox/execute`: Execute command in sandbox
- `DELETE /v1/sandbox/:sandboxId`: Destroy sandbox container

## Workflow

### 1. Training Request
```typescript
interface PetalTrainingRequest {
  agentId: string;
  dataBatch: any[];
  modelType: string;
  trainingParams: {
    learningRate: number;
    batchSize: number;
    epochs: number;
  };
}
```

### 2. Sandbox Creation
```typescript
interface SandboxCreateRequest {
  agentId: string;
  resourceCaps: {
    cpu: number;
    memory: number;
    gpu?: number;
  };
  trainingConfig: PetalTrainingRequest;
}
```

### 3. Training Execution
1. Agent submits training job via `/v1/petals/train`
2. System creates isolated WonderCraft sandbox with resource caps
3. Sandbox executes learn cycle with provided data and parameters
4. Training results return model deltas to central system
5. Central petal consensus aggregates deltas using federated learning
6. Shared model is updated with aggregated deltas

### 4. Telemetry Emission
```typescript
interface TrainingTelemetryEvent {
  event: 'training_cycle_completed' | 'training_cycle_failed';
  cycleId?: string;
  agentId: string;
  timestamp: number;
  deltas?: any;
  metrics?: {
    loss: number;
    accuracy: number;
    duration: number;
  };
  error?: string;
}
```

## Resource Management

### Sandbox Resource Caps
- **CPU**: Configurable cores (default: 2)
- **Memory**: Configurable MB (default: 4096MB)
- **GPU**: Optional GPU allocation
- **Network**: Isolated network namespace
- **Storage**: Ephemeral storage with size limits

### Security Features
- Container isolation with strict resource limits
- Network namespace isolation
- Read-only filesystem for training data
- Process monitoring and kill switches
- Automatic cleanup on completion

## Model Aggregation

### Federated Learning Approach
- Model deltas are aggregated using federated averaging
- Weight updates are averaged across participating agents
- Bias terms are updated independently
- Metadata includes aggregation method and timestamp

### Consensus Integration
- Training cycles are logged in consensus history
- Model updates require consensus approval
- Ethical validation before model deployment
- Audit trail for all training activities

## Error Handling

### Training Failures
- Automatic retry with exponential backoff
- Resource limit violations trigger immediate termination
- Failed cycles are logged with detailed error information
- Graceful degradation to fallback models

### Sandbox Failures
- Container health monitoring
- Automatic restart for recoverable failures
- Resource overrun detection and termination
- Cleanup of orphaned containers

## Monitoring and Metrics

### Training Metrics
- Loss progression over epochs
- Accuracy improvements
- Training duration
- Resource utilization
- Model convergence rates

### System Metrics
- Active sandbox count
- Resource utilization per sandbox
- Training cycle success rates
- Model aggregation performance
- Telemetry emission rates

## Configuration

### Environment Variables
```bash
# Petals Configuration
PETALS_MAX_CONCURRENT_CYCLES=10
PETALS_DEFAULT_LEARNING_RATE=0.001
PETALS_DEFAULT_BATCH_SIZE=32
PETALS_DEFAULT_EPOCHS=10

# Sandbox Configuration
SANDBOX_DEFAULT_CPU=2
SANDBOX_DEFAULT_MEMORY=4096
SANDBOX_MAX_LIFETIME=3600
SANDBOX_CLEANUP_INTERVAL=300

# Telemetry Configuration
TELEMETRY_RETENTION_DAYS=7
TELEMETRY_BATCH_SIZE=100
TELEMETRY_FLUSH_INTERVAL=60
```

### Scaling Configuration
```json
{
  "maxConcurrentTrainingCycles": 10,
  "maxSandboxLifetime": 3600,
  "resourceLimits": {
    "cpu": 4,
    "memory": 8192,
    "gpu": 1
  },
  "aggregationThreshold": 0.67,
  "consensusRequired": true
}
```

## Future Enhancements

### Planned Features
- Multi-GPU training support
- Advanced federated learning algorithms
- Real-time model versioning
- Automated hyperparameter optimization
- Cross-validation in sandboxed environments

### Integration Roadmap
- Integration with external ML frameworks
- Support for custom model architectures
- Real-time collaboration between agents
- Advanced security and privacy features
- Performance optimization and caching

## Troubleshooting

### Common Issues
1. **Resource Exhaustion**: Increase resource caps or reduce concurrent cycles
2. **Training Divergence**: Adjust learning rates or batch sizes
3. **Sandbox Failures**: Check container logs and resource availability
4. **Telemetry Loss**: Verify network connectivity and storage space

### Debug Commands
```bash
# Check sandbox status
curl -X GET http://localhost:3000/v1/sandbox/status/:sandboxId

# View training telemetry
curl -X GET http://localhost:3000/v1/telemetry/training

# Monitor resource usage
docker stats --no-stream

# Check consensus history
curl -X GET http://localhost:3000/v1/chat/history
``` 