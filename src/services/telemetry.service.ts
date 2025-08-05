import { Injectable, Logger } from '@nestjs/common';
import { InfluxDB, Point, WriteApi } from '@influxdata/influxdb-client';

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

export interface TelemetryEvent {
  category: string;
  action: string;
  data: any;
  timestamp: number;
}

@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);
  private influxDB: InfluxDB;
  private writeApi: WriteApi;
  private trainingEvents: TrainingTelemetryEvent[] = [];
  private consensusEvents: ConsensusTelemetryEvent[] = [];
  private eventStats: Map<string, any> = new Map();

  constructor() {
    // Initialize InfluxDB connection
    const url = process.env.INFLUXDB_URL || 'http://localhost:8086';
    const token = process.env.INFLUXDB_TOKEN || 'your-token';
    const org = process.env.INFLUXDB_ORG || 'zeropoint';
    const bucket = process.env.INFLUXDB_BUCKET || 'telemetry';

    this.influxDB = new InfluxDB({ url, token });
    this.writeApi = this.influxDB.getWriteApi(org, bucket, 'ms');

    // Set up error handling for write API
    this.writeApi.on('error', (error) => {
      this.logger.error(`InfluxDB write error: ${error.message}`);
    });

    this.writeApi.on('writeSuccess', (lines) => {
      this.logger.debug(`Successfully wrote ${lines.length} lines to InfluxDB`);
    });
  }

  async logEvent(category: string, action: string, data: any): Promise<void> {
    const timestamp = Date.now();
    this.logger.log(`Logging telemetry event: ${category}.${action}`);

    try {
      // Create InfluxDB point
      const point = new Point('telemetry_event')
        .tag('category', category)
        .tag('action', action)
        .tag('service', 'zeropoint-api')
        .tag('environment', process.env.NODE_ENV || 'development')
        .intField('timestamp', timestamp)
        .stringField('data', JSON.stringify(data));

      // Add additional tags from data if available
      if (data.agentId) point.tag('agent_id', data.agentId);
      if (data.cycleId) point.tag('cycle_id', data.cycleId);
      if (data.proposalId) point.tag('proposal_id', data.proposalId);
      if (data.sandboxId) point.tag('sandbox_id', data.sandboxId);

      // Add numeric fields for metrics
      if (data.latency) point.floatField('latency', data.latency);
      if (data.tokensUsed) point.intField('tokens_used', data.tokensUsed);
      if (data.confidence) point.floatField('confidence', data.confidence);
      if (data.responseLength) point.intField('response_length', data.responseLength);

      // Write to InfluxDB
      await this.writeApi.writePoint(point);
      await this.writeApi.flush();

      // Update local stats
      this.updateEventStats(category, action, data);

      this.logger.debug(`Telemetry event logged: ${category}.${action}`);

    } catch (error) {
      this.logger.error(`Failed to log telemetry event: ${error.message}`);
      
      // Fallback to local storage
      this.storeEventLocally(category, action, data, timestamp);
    }
  }

  async emitTrainingTelemetry(event: TrainingTelemetryEvent): Promise<void> {
    this.logger.log(`Emitting training telemetry: ${event.event} for agent ${event.agentId}`);
    
    this.trainingEvents.push(event);

    // Log to InfluxDB
    await this.logEvent('training', event.event, {
      agentId: event.agentId,
      cycleId: event.cycleId,
      metrics: event.metrics,
      error: event.error,
      timestamp: event.timestamp,
    });

    // Log the telemetry event
    this.logger.log(`Training Telemetry: ${JSON.stringify(event)}`);

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

    // Log to InfluxDB
    await this.logEvent('consensus', event.event, {
      proposalId: event.proposalId,
      agentId: event.agentId,
      voterId: event.voterId,
      vote: event.vote,
      role: event.role,
      details: event.details,
      timestamp: event.timestamp,
    });

    // Log the telemetry event
    this.logger.log(`Consensus Telemetry: ${JSON.stringify(event)}`);

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

  async getEventStats(category: string): Promise<any> {
    const stats = this.eventStats.get(category) || {
      total: 0,
      successful: 0,
      failed: 0,
      avgLatency: 0,
      avgTokens: 0,
      lastUpdated: Date.now(),
    };

    return stats;
  }

  async getMetrics(timeRange: string = '1h'): Promise<any> {
    try {
      const queryApi = this.influxDB.getQueryApi(process.env.INFLUXDB_ORG || 'zeropoint');
      
      // Query for various metrics
      const queries = [
        // Training metrics
        `from(bucket: "${process.env.INFLUXDB_BUCKET || 'telemetry'}")
          |> range(start: -${timeRange})
          |> filter(fn: (r) => r["_measurement"] == "telemetry_event" and r["category"] == "training")
          |> group()
          |> count()`,
        
        // Generation metrics
        `from(bucket: "${process.env.INFLUXDB_BUCKET || 'telemetry'}")
          |> range(start: -${timeRange})
          |> filter(fn: (r) => r["_measurement"] == "telemetry_event" and r["category"] == "generation")
          |> group()
          |> mean(column: "_value")`,
        
        // Consensus metrics
        `from(bucket: "${process.env.INFLUXDB_BUCKET || 'telemetry'}")
          |> range(start: -${timeRange})
          |> filter(fn: (r) => r["_measurement"] == "telemetry_event" and r["category"] == "consensus")
          |> group()
          |> count()`,
      ];

      const results = await Promise.all(
        queries.map(query => queryApi.queryRaw(query))
      );

      return {
        training: this.parseQueryResult(results[0]),
        generation: this.parseQueryResult(results[1]),
        consensus: this.parseQueryResult(results[2]),
        timestamp: Date.now(),
      };

    } catch (error) {
      this.logger.error(`Failed to query metrics: ${error.message}`);
      return {
        training: { count: 0 },
        generation: { avgLatency: 0 },
        consensus: { count: 0 },
        timestamp: Date.now(),
      };
    }
  }

  private parseQueryResult(result: any): any {
    // Parse InfluxDB query result
    // This is a simplified parser - in production you'd want more robust parsing
    try {
      const data = JSON.parse(result);
      if (data.results && data.results[0] && data.results[0].series) {
        const series = data.results[0].series[0];
        if (series.values && series.values.length > 0) {
          return {
            value: series.values[0][1],
            timestamp: series.values[0][0],
          };
        }
      }
    } catch (error) {
      this.logger.warn(`Failed to parse query result: ${error.message}`);
    }
    
    return { value: 0, timestamp: Date.now() };
  }

  private updateEventStats(category: string, action: string, data: any): void {
    const key = `${category}.${action}`;
    const currentStats = this.eventStats.get(key) || {
      total: 0,
      successful: 0,
      failed: 0,
      avgLatency: 0,
      avgTokens: 0,
      lastUpdated: Date.now(),
    };

    currentStats.total++;
    
    if (action.includes('completed') || action.includes('success')) {
      currentStats.successful++;
    } else if (action.includes('failed') || action.includes('error')) {
      currentStats.failed++;
    }

    // Update average latency
    if (data.latency) {
      currentStats.avgLatency = (currentStats.avgLatency * (currentStats.total - 1) + data.latency) / currentStats.total;
    }

    // Update average tokens
    if (data.tokensUsed) {
      currentStats.avgTokens = (currentStats.avgTokens * (currentStats.total - 1) + data.tokensUsed) / currentStats.total;
    }

    currentStats.lastUpdated = Date.now();
    this.eventStats.set(key, currentStats);
  }

  private storeEventLocally(category: string, action: string, data: any, timestamp: number): void {
    // Fallback storage when InfluxDB is unavailable
    const event: TelemetryEvent = {
      category,
      action,
      data,
      timestamp,
    };

    // Store in appropriate local array based on category
    if (category === 'training') {
      this.trainingEvents.push(event as any);
    } else if (category === 'consensus') {
      this.consensusEvents.push(event as any);
    }

    this.logger.warn(`Event stored locally due to InfluxDB unavailability: ${category}.${action}`);
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

  async logEvent(event: any): Promise<void> {
    this.logger.log(`Logging UX event: ${event.event} - ${event.component}`);
    
    // Store UX events for analytics
    await this.logEvent('ux', event.event, {
      component: event.component,
      data: event.data,
      timestamp: Date.now(),
    });
  }

  async onModuleDestroy(): Promise<void> {
    // Clean up InfluxDB connection
    if (this.writeApi) {
      await this.writeApi.close();
    }
  }
} 