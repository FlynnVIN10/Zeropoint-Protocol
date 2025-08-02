import { Injectable, Logger } from '@nestjs/common';

export interface TrainingTelemetryEvent {
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

export interface ConsensusTelemetryEvent {
  event: 'proposal_created' | 'sentient_voted' | 'human_voted' | 'proposal_finalized';
  proposalId: string;
  agentId?: string;
  voterId?: string;
  vote?: boolean;
  role?: 'sentient' | 'human';
  timestamp: number;
  details?: any;
}

@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);
  private trainingEvents: TrainingTelemetryEvent[] = [];
  private consensusEvents: ConsensusTelemetryEvent[] = [];

  async emitTrainingTelemetry(event: TrainingTelemetryEvent): Promise<void> {
    this.logger.log(`Emitting training telemetry: ${event.event} for agent ${event.agentId}`);
    
    this.trainingEvents.push(event);

    // Log the telemetry event
    this.logger.log(`Training Telemetry: ${JSON.stringify(event)}`);

    // In a real implementation, this would send to a telemetry endpoint
    // For now, we'll just log and store locally
    if (event.event === 'training_cycle_completed') {
      this.logger.log(`Training cycle ${event.cycleId} completed successfully`);
      this.logger.log(`Metrics: Loss=${event.metrics?.loss}, Accuracy=${event.metrics?.accuracy}, Duration=${event.metrics?.duration}ms`);
    } else if (event.event === 'training_cycle_failed') {
      this.logger.error(`Training cycle failed for agent ${event.agentId}: ${event.error}`);
    }
  }

  async emitConsensusTelemetry(event: ConsensusTelemetryEvent): Promise<void> {
    this.logger.log(`Emitting consensus telemetry: ${event.event} for proposal ${event.proposalId}`);
    
    this.consensusEvents.push(event);

    // Log the telemetry event
    this.logger.log(`Consensus Telemetry: ${JSON.stringify(event)}`);

    // In a real implementation, this would send to a telemetry endpoint
    switch (event.event) {
      case 'proposal_created':
        this.logger.log(`Proposal ${event.proposalId} created by agent ${event.agentId}`);
        break;
      case 'sentient_voted':
        this.logger.log(`Sentient ${event.voterId} voted ${event.vote ? 'APPROVE' : 'VETO'} on proposal ${event.proposalId}`);
        break;
      case 'human_voted':
        this.logger.log(`Human ${event.voterId} voted ${event.vote ? 'APPROVE' : 'VETO'} on proposal ${event.proposalId}`);
        break;
      case 'proposal_finalized':
        this.logger.log(`Proposal ${event.proposalId} finalized with status: ${event.details?.status}`);
        break;
    }
  }

  async getTrainingTelemetry(agentId?: string, startTime?: number, endTime?: number): Promise<TrainingTelemetryEvent[]> {
    let filteredEvents = this.trainingEvents;

    if (agentId) {
      filteredEvents = filteredEvents.filter(event => event.agentId === agentId);
    }

    if (startTime) {
      filteredEvents = filteredEvents.filter(event => event.timestamp >= startTime);
    }

    if (endTime) {
      filteredEvents = filteredEvents.filter(event => event.timestamp <= endTime);
    }

    return filteredEvents;
  }

  async getConsensusTelemetry(proposalId?: string, startTime?: number, endTime?: number): Promise<ConsensusTelemetryEvent[]> {
    let filteredEvents = this.consensusEvents;

    if (proposalId) {
      filteredEvents = filteredEvents.filter(event => event.proposalId === proposalId);
    }

    if (startTime) {
      filteredEvents = filteredEvents.filter(event => event.timestamp >= startTime);
    }

    if (endTime) {
      filteredEvents = filteredEvents.filter(event => event.timestamp <= endTime);
    }

    return filteredEvents;
  }

  async getTelemetrySummary(): Promise<any> {
    const now = Date.now();
    const last24Hours = now - (24 * 60 * 60 * 1000);

    const recentTrainingEvents = this.trainingEvents.filter(event => event.timestamp >= last24Hours);
    const recentConsensusEvents = this.consensusEvents.filter(event => event.timestamp >= last24Hours);

    const trainingStats = {
      totalCycles: recentTrainingEvents.filter(e => e.event === 'training_cycle_completed').length,
      failedCycles: recentTrainingEvents.filter(e => e.event === 'training_cycle_failed').length,
      successRate: recentTrainingEvents.length > 0 
        ? recentTrainingEvents.filter(e => e.event === 'training_cycle_completed').length / recentTrainingEvents.length 
        : 0,
    };

    const consensusStats = {
      totalProposals: recentConsensusEvents.filter(e => e.event === 'proposal_created').length,
      totalVotes: recentConsensusEvents.filter(e => e.event === 'sentient_voted' || e.event === 'human_voted').length,
      finalizedProposals: recentConsensusEvents.filter(e => e.event === 'proposal_finalized').length,
    };

    return {
      training: trainingStats,
      consensus: consensusStats,
      timestamp: now,
    };
  }

  async clearOldTelemetry(olderThanDays: number = 7): Promise<void> {
    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    
    const originalTrainingCount = this.trainingEvents.length;
    const originalConsensusCount = this.consensusEvents.length;

    this.trainingEvents = this.trainingEvents.filter(event => event.timestamp >= cutoffTime);
    this.consensusEvents = this.consensusEvents.filter(event => event.timestamp >= cutoffTime);

    const removedTrainingCount = originalTrainingCount - this.trainingEvents.length;
    const removedConsensusCount = originalConsensusCount - this.consensusEvents.length;

    this.logger.log(`Cleared old telemetry: ${removedTrainingCount} training events, ${removedConsensusCount} consensus events`);
  }
} 