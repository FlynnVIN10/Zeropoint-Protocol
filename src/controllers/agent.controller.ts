import { Controller, Get, Post, Body, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { AgentService } from '../services/agent.service.js';
import { TelemetryService } from '../services/telemetry.service.js';

interface AgentRequestDto {
  type: 'code-change' | 'training-job' | 'resource-allocation';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedImpact: 'low' | 'medium' | 'high';
  justification: string;
}

@Controller('agents')
@UseGuards(JwtAuthGuard)
export class AgentController {
  constructor(
    private readonly agentService: AgentService,
    private readonly telemetryService: TelemetryService
  ) {}

  @Get('me')
  async getAgentData(@Request() req): Promise<any> {
    try {
      const userId = req.user.id;
      const agentData = await this.agentService.getAgentData(userId);

      // Log telemetry
      await this.telemetryService.logEvent('agent', 'data_accessed', {
        userId,
        agentId: agentData.id,
        level: agentData.level,
        status: agentData.status,
        timestamp: Date.now(),
      });

      return agentData;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to retrieve agent data',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('request')
  async submitAgentRequest(@Request() req, @Body() requestDto: AgentRequestDto) {
    try {
      const userId = req.user.id;
      const result = await this.agentService.submitAgentRequest(userId, requestDto);

      // Log telemetry
      await this.telemetryService.logEvent('agent', 'request_submitted', {
        userId,
        requestId: result.requestId,
        requestType: requestDto.type,
        priority: requestDto.priority,
        estimatedImpact: requestDto.estimatedImpact,
        timestamp: Date.now(),
      });

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to submit agent request',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('requests')
  async getAgentRequests(@Request() req): Promise<any> {
    try {
      const userId = req.user.id;
      const requests = await this.agentService.getAgentRequests(userId);

      // Log telemetry
      await this.telemetryService.logEvent('agent', 'requests_accessed', {
        userId,
        pendingCount: requests.pending.length,
        approvedCount: requests.approved.length,
        rejectedCount: requests.rejected.length,
        timestamp: Date.now(),
      });

      return requests;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to retrieve agent requests',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('performance')
  async getAgentPerformance(@Request() req) {
    try {
      const userId = req.user.id;
      const performance = await this.agentService.getAgentPerformanceMetrics(userId);

      // Log telemetry
      await this.telemetryService.logEvent('agent', 'performance_accessed', {
        userId,
        efficiency: performance.efficiency,
        accuracy: performance.accuracy,
        reliability: performance.reliability,
        timestamp: Date.now(),
      });

      return performance;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to retrieve agent performance',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 