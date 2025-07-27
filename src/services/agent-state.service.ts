// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOneOptions } from 'typeorm';
import { AgentState, AgentMetrics, AgentContext, AgentMemory } from '../entities/agent-state.entity.js';
import { checkIntent } from '../guards/synthient.guard.js';
import { soulchain } from '../agents/soulchain/soulchain.ledger.js';

export interface CreateAgentStateDto {
  agentId: string;
  name: string;
  did: string;
  handle: string;
  context: AgentContext;
  tags?: string[];
  notes?: string;
  metadata?: Record<string, any>;
}

export interface UpdateAgentStateDto {
  status?: 'active' | 'inactive' | 'training' | 'suspended' | 'terminated';
  metrics?: Partial<AgentMetrics>;
  context?: Partial<AgentContext>;
  memory?: Partial<AgentMemory>;
  tags?: string[];
  notes?: string;
  metadata?: Record<string, any>;
}

export interface AgentStateQuery {
  status?: string;
  ethicalRating?: string;
  trustLevel?: 'high' | 'medium' | 'low';
  performanceStatus?: 'excellent' | 'good' | 'fair' | 'poor';
  tags?: string[];
  limit?: number;
  offset?: number;
}

@Injectable()
export class AgentStateService {
  private readonly logger = new Logger(AgentStateService.name);

  constructor(
    @InjectRepository(AgentState)
    private agentStateRepository: Repository<AgentState>
  ) {}

  /**
   * Create a new agent state with Zeroth-gate validation
   */
  async createAgentState(dto: CreateAgentStateDto): Promise<AgentState> {
    // Zeroth-gate validation
    if (!checkIntent(dto.agentId + dto.name + dto.did)) {
      throw new BadRequestException('Zeroth violation: Agent creation blocked due to ethical concerns.');
    }

    // Check if agent already exists
    const existingAgent = await this.agentStateRepository.findOne({
      where: { agentId: dto.agentId }
    });

    if (existingAgent) {
      throw new BadRequestException(`Agent with ID ${dto.agentId} already exists.`);
    }

    // Initialize default metrics
    const defaultMetrics: AgentMetrics = {
      xp: 0,
      level: 'Initiate',
      trustScore: 0.5,
      ethicalRating: 'aligned',
      performanceScore: 0.5,
      lastTrainingCycle: new Date(),
      totalInteractions: 0,
      successfulInteractions: 0,
      failedInteractions: 0
    };

    // Initialize default memory
    const defaultMemory: AgentMemory = {
      reflections: [],
      experiences: [],
      learnings: []
    };

    const agentState = this.agentStateRepository.create({
      ...dto,
      metrics: defaultMetrics,
      memory: defaultMemory,
      tags: dto.tags || [],
      metadata: dto.metadata || {}
    });

    const savedAgent = await this.agentStateRepository.save(agentState);

    // Log to Soulchain
    await this.logToSoulchain(savedAgent, 'agent_created', 10, 'New agent state created');

    this.logger.log(`Created agent state for ${dto.agentId}`);
    return savedAgent;
  }

  /**
   * Get agent state by ID
   */
  async getAgentState(agentId: string): Promise<AgentState> {
    const agent = await this.agentStateRepository.findOne({
      where: { agentId }
    });

    if (!agent) {
      throw new NotFoundException(`Agent with ID ${agentId} not found.`);
    }

    return agent;
  }

  /**
   * Update agent state with Zeroth-gate validation
   */
  async updateAgentState(agentId: string, dto: UpdateAgentStateDto): Promise<AgentState> {
    // Zeroth-gate validation
    if (!checkIntent(agentId + JSON.stringify(dto))) {
      throw new BadRequestException('Zeroth violation: Agent state update blocked due to ethical concerns.');
    }

    const agent = await this.getAgentState(agentId);

    // Update fields
    Object.assign(agent, dto);

    const updatedAgent = await this.agentStateRepository.save(agent);

    // Log to Soulchain
    await this.logToSoulchain(updatedAgent, 'agent_updated', 5, 'Agent state updated');

    this.logger.log(`Updated agent state for ${agentId}`);
    return updatedAgent;
  }

  /**
   * Delete agent state (soft delete by setting status to terminated)
   */
  async deleteAgentState(agentId: string): Promise<void> {
    // Zeroth-gate validation
    if (!checkIntent(agentId + 'delete')) {
      throw new BadRequestException('Zeroth violation: Agent deletion blocked due to ethical concerns.');
    }

    const agent = await this.getAgentState(agentId);
    agent.status = 'terminated';

    await this.agentStateRepository.save(agent);

    // Log to Soulchain
    await this.logToSoulchain(agent, 'agent_terminated', -10, 'Agent state terminated');

    this.logger.log(`Terminated agent state for ${agentId}`);
  }

  /**
   * Query agent states with filters
   */
  async queryAgentStates(query: AgentStateQuery): Promise<{ agents: AgentState[]; total: number }> {
    const options: FindManyOptions<AgentState> = {
      skip: query.offset || 0,
      take: query.limit || 50,
      order: { lastActivityAt: 'DESC' }
    };

    const whereConditions: any = {};

    if (query.status) {
      whereConditions.status = query.status;
    }

    if (query.ethicalRating) {
      whereConditions['metrics.ethicalRating'] = query.ethicalRating;
    }

    if (query.tags && query.tags.length > 0) {
      whereConditions.tags = { $overlap: query.tags };
    }

    if (Object.keys(whereConditions).length > 0) {
      options.where = whereConditions;
    }

    const [agents, total] = await this.agentStateRepository.findAndCount(options);

    // Apply additional filters that can't be done at DB level
    let filteredAgents = agents;

    if (query.trustLevel) {
      filteredAgents = filteredAgents.filter(agent => agent.getTrustLevel() === query.trustLevel);
    }

    if (query.performanceStatus) {
      filteredAgents = filteredAgents.filter(agent => agent.getPerformanceStatus() === query.performanceStatus);
    }

    return {
      agents: filteredAgents,
      total: filteredAgents.length
    };
  }

  /**
   * Get active agents
   */
  async getActiveAgents(): Promise<AgentState[]> {
    return this.agentStateRepository.find({
      where: { status: 'active' },
      order: { lastActivityAt: 'DESC' }
    });
  }

  /**
   * Get agents by ethical rating
   */
  async getAgentsByEthicalRating(rating: 'aligned' | 'warn' | 'reject'): Promise<AgentState[]> {
    const agents = await this.agentStateRepository.find({
      order: { lastActivityAt: 'DESC' }
    });
    
    return agents.filter(agent => agent.metrics.ethicalRating === rating);
  }

  /**
   * Get agents requiring attention (warnings or rejections)
   */
  async getAgentsRequiringAttention(): Promise<AgentState[]> {
    const agents = await this.agentStateRepository.find({
      order: { lastActivityAt: 'DESC' }
    });
    
    return agents.filter(agent => 
      agent.metrics.ethicalRating === 'warn' || agent.metrics.ethicalRating === 'reject'
    );
  }

  /**
   * Record agent interaction
   */
  async recordInteraction(
    agentId: string,
    type: string,
    input: string,
    output: string,
    xpGained: number,
    ethicalCheck: boolean
  ): Promise<AgentState> {
    const agent = await this.getAgentState(agentId);
    
    agent.recordInteraction(type, input, output, xpGained, ethicalCheck);
    
    const updatedAgent = await this.agentStateRepository.save(agent);

    // Log to Soulchain
    await this.logToSoulchain(updatedAgent, 'interaction_recorded', xpGained, `Interaction: ${type}`);

    return updatedAgent;
  }

  /**
   * Record training cycle
   */
  async recordTrainingCycle(
    agentId: string,
    cycle: string,
    xpGained: number,
    improvements: string[],
    ethicalAlignment: boolean
  ): Promise<AgentState> {
    const agent = await this.getAgentState(agentId);
    
    agent.recordTrainingCycle(cycle, xpGained, improvements, ethicalAlignment);
    
    const updatedAgent = await this.agentStateRepository.save(agent);

    // Log to Soulchain
    await this.logToSoulchain(updatedAgent, 'training_cycle', xpGained, `Training cycle: ${cycle}`);

    return updatedAgent;
  }

  /**
   * Record performance metric
   */
  async recordPerformanceMetric(
    agentId: string,
    metric: string,
    value: number,
    threshold: number
  ): Promise<AgentState> {
    const agent = await this.getAgentState(agentId);
    
    agent.recordPerformanceMetric(metric, value, threshold);
    
    const updatedAgent = await this.agentStateRepository.save(agent);

    // Log to Soulchain
    await this.logToSoulchain(updatedAgent, 'performance_metric', 1, `Performance: ${metric} = ${value}`);

    return updatedAgent;
  }

  /**
   * Record error
   */
  async recordError(agentId: string, error: string, context: string): Promise<AgentState> {
    const agent = await this.getAgentState(agentId);
    
    agent.recordError(error, context);
    agent.metrics.failedInteractions++;
    
    const updatedAgent = await this.agentStateRepository.save(agent);

    // Log to Soulchain
    await this.logToSoulchain(updatedAgent, 'error_recorded', -1, `Error: ${error}`);

    return updatedAgent;
  }

  /**
   * Record ethical violation
   */
  async recordEthicalViolation(
    agentId: string,
    violation: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    context: string
  ): Promise<AgentState> {
    const agent = await this.getAgentState(agentId);
    
    agent.recordEthicalViolation(violation, severity, context);
    
    const updatedAgent = await this.agentStateRepository.save(agent);

    // Log to Soulchain
    const xpPenalty = severity === 'critical' ? -50 : severity === 'high' ? -25 : severity === 'medium' ? -10 : -5;
    await this.logToSoulchain(updatedAgent, 'ethical_violation', xpPenalty, `Violation: ${violation} (${severity})`);

    return updatedAgent;
  }

  /**
   * Add reflection to agent memory
   */
  async addReflection(agentId: string, content: string, tags: string[] = []): Promise<AgentState> {
    const agent = await this.getAgentState(agentId);
    
    agent.addReflection(content, tags);
    
    const updatedAgent = await this.agentStateRepository.save(agent);

    // Log to Soulchain
    await this.logToSoulchain(updatedAgent, 'reflection_added', 2, 'Reflection added to memory');

    return updatedAgent;
  }

  /**
   * Add learning to agent memory
   */
  async addLearning(
    agentId: string,
    concept: string,
    application: string,
    confidence: number
  ): Promise<AgentState> {
    const agent = await this.getAgentState(agentId);
    
    agent.addLearning(concept, application, confidence);
    
    const updatedAgent = await this.agentStateRepository.save(agent);

    // Log to Soulchain
    await this.logToSoulchain(updatedAgent, 'learning_added', 3, `Learning: ${concept}`);

    return updatedAgent;
  }

  /**
   * Get agent statistics
   */
  async getAgentStatistics(): Promise<{
    total: number;
    active: number;
    training: number;
    suspended: number;
    terminated: number;
    ethicalBreakdown: { aligned: number; warn: number; reject: number };
    trustBreakdown: { high: number; medium: number; low: number };
    performanceBreakdown: { excellent: number; good: number; fair: number; poor: number };
  }> {
    const agents = await this.agentStateRepository.find();

    const stats = {
      total: agents.length,
      active: agents.filter(a => a.status === 'active').length,
      training: agents.filter(a => a.status === 'training').length,
      suspended: agents.filter(a => a.status === 'suspended').length,
      terminated: agents.filter(a => a.status === 'terminated').length,
      ethicalBreakdown: {
        aligned: agents.filter(a => a.metrics.ethicalRating === 'aligned').length,
        warn: agents.filter(a => a.metrics.ethicalRating === 'warn').length,
        reject: agents.filter(a => a.metrics.ethicalRating === 'reject').length
      },
      trustBreakdown: {
        high: agents.filter(a => a.getTrustLevel() === 'high').length,
        medium: agents.filter(a => a.getTrustLevel() === 'medium').length,
        low: agents.filter(a => a.getTrustLevel() === 'low').length
      },
      performanceBreakdown: {
        excellent: agents.filter(a => a.getPerformanceStatus() === 'excellent').length,
        good: agents.filter(a => a.getPerformanceStatus() === 'good').length,
        fair: agents.filter(a => a.getPerformanceStatus() === 'fair').length,
        poor: agents.filter(a => a.getPerformanceStatus() === 'poor').length
      }
    };

    return stats;
  }

  /**
   * Log agent state changes to Soulchain
   */
  private async logToSoulchain(
    agent: AgentState,
    action: string,
    amount: number,
    rationale: string
  ): Promise<void> {
    try {
      await soulchain.addXPTransaction({
        agentId: agent.agentId,
        amount,
        rationale: `${action}: ${rationale}`,
        timestamp: new Date().toISOString(),
        previousCid: null,
        tags: [
          {
            type: '#who',
            name: agent.name,
            did: agent.did,
            handle: agent.handle
          },
          {
            type: '#intent',
            purpose: '#agent-state-persistence',
            validation: 'good-heart'
          },
          {
            type: '#thread',
            taskId: action,
            lineage: agent.context.lineage,
            swarmLink: agent.context.swarmLink
          },
          {
            type: '#layer',
            level: agent.context.layer
          },
          {
            type: '#domain',
            field: agent.context.domain
          }
        ]
      });
    } catch (error) {
      this.logger.error(`Failed to log to Soulchain: ${error.message}`);
    }
  }
} 