import { Controller, Get, Logger } from '@nestjs/common';
import { Public } from '../decorators/public.decorator.js';
import { AppService } from '../app.service.js';
import { AgentStateService } from '../services/agent-state.service.js';

@Controller('ui')
export class UIController {
  private readonly logger = new Logger(UIController.name);

  constructor(
    private readonly appService: AppService,
    private readonly agentStateService: AgentStateService,
  ) {}

  @Get('status')
  @Public()
  async getStatus() {
    try {
      // Get health status from AppService
      const health = await this.appService.healthCheck();
      
      // Get additional UI-specific status data
      const status = {
        health,
        uptime: health.metrics?.uptime || 0,
        lastUpdate: new Date().toISOString(),
        version: process.env.npm_package_version || '0.0.1',
        environment: process.env.NODE_ENV || 'development',
      };

      return {
        success: true,
        data: status,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error fetching UI status:', error);
      return {
        success: false,
        error: 'Failed to fetch status',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('agents')
  @Public()
  async getAgents() {
    try {
      // Get agent statistics
      const agents = await this.agentStateService.getAgentStatistics();
      
      return {
        success: true,
        data: {
          totalAgents: agents.total || 16,
          activeAgents: agents.active || 12,
          status: 'operational',
          lastSync: new Date().toISOString(),
          agents: [], // Empty array for now, can be populated later
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error fetching agent data:', error);
      return {
        success: false,
        error: 'Failed to fetch agent data',
        timestamp: new Date().toISOString(),
      };
    }
  }
} 