import { Controller, Get, Post, Body, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AgentService } from '../services/agent.service';
import { TelemetryService } from '../services/telemetry.service';

interface AgentRequestDto {
  type: 'code-change' | 'training-job' | 'resource-allocation';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedImpact: 'low' | 'medium' | 'high';
  justification: string;
}

@Controller('v1/agents')
@UseGuards(JwtAuthGuard)
export class AgentController {
  constructor(
    private readonly agentService: AgentService,
    private readonly telemetryService: TelemetryService
  ) {}

  @Get('me')
  async getAgentData(@Request() req) {
    try {
      const userId = req.user.id;
      const agentData = await this.agentService.getAgentData(userId);

      // Log telemetry
      await this.telemetryService.logEvent({
        event: 'agent_data_accessed',
        type: 'agent_interaction',
        userId,
        timestamp: Date.now(),
        data: {
          agentId: agentData.id,
          level: agentData.level,
          status: agentData.status
        }
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
      await this.telemetryService.logEvent({
        event: 'agent_request_submitted',
        type: 'agent_interaction',
        userId,
        timestamp: Date.now(),
        data: {
          requestId: result.requestId,
          requestType: requestDto.type,
          priority: requestDto.priority,
          estimatedImpact: requestDto.estimatedImpact
        }
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
  async getAgentRequests(@Request() req) {
    try {
      const userId = req.user.id;
      const requests = await this.agentService.getAgentRequests(userId);

      // Log telemetry
      await this.telemetryService.logEvent({
        event: 'agent_requests_accessed',
        type: 'agent_interaction',
        userId,
        timestamp: Date.now(),
        data: {
          pendingCount: requests.pending.length,
          approvedCount: requests.approved.length,
          rejectedCount: requests.rejected.length
        }
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
      await this.telemetryService.logEvent({
        event: 'agent_performance_accessed',
        type: 'agent_interaction',
        userId,
        timestamp: Date.now(),
        data: {
          efficiency: performance.efficiency,
          accuracy: performance.accuracy,
          reliability: performance.reliability
        }
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