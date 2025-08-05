// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  ParseIntPipe,
  DefaultValuePipe
} from '@nestjs/common';
import { AgentStateService, CreateAgentStateDto, UpdateAgentStateDto, AgentStateQuery } from '../services/agent-state.service.js';
import { AgentState } from '../entities/agent-state.entity.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { SynthientGuard } from '../guards/synthient.guard.js';

@Controller('agent-states')
@UseGuards(JwtAuthGuard, SynthientGuard)
export class AgentStateController {
  constructor(private readonly agentStateService: AgentStateService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAgentState(@Body(ValidationPipe) dto: CreateAgentStateDto): Promise<AgentState> {
    return this.agentStateService.createAgentState(dto);
  }

  @Get(':agentId')
  async getAgentState(@Param('agentId') agentId: string): Promise<AgentState> {
    return this.agentStateService.getAgentState(agentId);
  }

  @Put(':agentId')
  async updateAgentState(
    @Param('agentId') agentId: string,
    @Body(ValidationPipe) dto: UpdateAgentStateDto
  ): Promise<AgentState> {
    return this.agentStateService.updateAgentState(agentId, dto);
  }

  @Delete(':agentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAgentState(@Param('agentId') agentId: string): Promise<void> {
    return this.agentStateService.deleteAgentState(agentId);
  }

  @Get()
  async queryAgentStates(
    @Query('status') status?: string,
    @Query('ethicalRating') ethicalRating?: string,
    @Query('trustLevel') trustLevel?: 'high' | 'medium' | 'low',
    @Query('performanceStatus') performanceStatus?: 'excellent' | 'good' | 'fair' | 'poor',
    @Query('tags') tags?: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number
  ): Promise<{ agents: AgentState[]; total: number }> {
    const query: AgentStateQuery = {
      status,
      ethicalRating,
      trustLevel,
      performanceStatus,
      tags: tags ? tags.split(',') : undefined,
      limit,
      offset
    };

    return this.agentStateService.queryAgentStates(query);
  }

  @Get('active/list')
  async getActiveAgents(): Promise<AgentState[]> {
    return this.agentStateService.getActiveAgents();
  }

  @Get('ethical/:rating')
  async getAgentsByEthicalRating(@Param('rating') rating: 'aligned' | 'warn' | 'reject'): Promise<AgentState[]> {
    return this.agentStateService.getAgentsByEthicalRating(rating);
  }

  @Get('attention/required')
  async getAgentsRequiringAttention(): Promise<AgentState[]> {
    return this.agentStateService.getAgentsRequiringAttention();
  }

  @Post(':agentId/interactions')
  async recordInteraction(
    @Param('agentId') agentId: string,
    @Body() body: {
      type: string;
      input: string;
      output: string;
      xpGained: number;
      ethicalCheck: boolean;
    }
  ): Promise<AgentState> {
    return this.agentStateService.recordInteraction(
      agentId,
      body.type,
      body.input,
      body.output,
      body.xpGained,
      body.ethicalCheck
    );
  }

  @Post(':agentId/training')
  async recordTrainingCycle(
    @Param('agentId') agentId: string,
    @Body() body: {
      cycle: string;
      xpGained: number;
      improvements: string[];
      ethicalAlignment: boolean;
    }
  ): Promise<AgentState> {
    return this.agentStateService.recordTrainingCycle(
      agentId,
      body.cycle,
      body.xpGained,
      body.improvements,
      body.ethicalAlignment
    );
  }

  @Post(':agentId/performance')
  async recordPerformanceMetric(
    @Param('agentId') agentId: string,
    @Body() body: {
      metric: string;
      value: number;
      threshold: number;
    }
  ): Promise<AgentState> {
    return this.agentStateService.recordPerformanceMetric(
      agentId,
      body.metric,
      body.value,
      body.threshold
    );
  }

  @Post(':agentId/errors')
  async recordError(
    @Param('agentId') agentId: string,
    @Body() body: {
      error: string;
      context: string;
    }
  ): Promise<AgentState> {
    return this.agentStateService.recordError(agentId, body.error, body.context);
  }

  @Post(':agentId/violations')
  async recordEthicalViolation(
    @Param('agentId') agentId: string,
    @Body() body: {
      violation: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      context: string;
    }
  ): Promise<AgentState> {
    return this.agentStateService.recordEthicalViolation(
      agentId,
      body.violation,
      body.severity,
      body.context
    );
  }

  @Post(':agentId/reflections')
  async addReflection(
    @Param('agentId') agentId: string,
    @Body() body: {
      content: string;
      tags?: string[];
    }
  ): Promise<AgentState> {
    return this.agentStateService.addReflection(agentId, body.content, body.tags || []);
  }

  @Post(':agentId/learnings')
  async addLearning(
    @Param('agentId') agentId: string,
    @Body() body: {
      concept: string;
      application: string;
      confidence: number;
    }
  ): Promise<AgentState> {
    return this.agentStateService.addLearning(
      agentId,
      body.concept,
      body.application,
      body.confidence
    );
  }

  @Get('statistics/overview')
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
    return this.agentStateService.getAgentStatistics();
  }
} 