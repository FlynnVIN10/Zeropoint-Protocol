import { Injectable, Logger } from '@nestjs/common';
import { TelemetryService } from './telemetry.service.js';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);
  private agentXP = {
    'agent-alpha': { xp: 1250, level: 'Initiate', trust: 0.85, ethical: 0.92 },
    'agent-beta': { xp: 890, level: 'Initiate', trust: 0.78, ethical: 0.88 },
    'agent-gamma': { xp: 2100, level: 'Adept', trust: 0.91, ethical: 0.95 }
  };

  constructor(private readonly telemetryService: TelemetryService) {}

  getDashboardUpdates() {
    return {
      timestamp: new Date().toISOString(),
      agents: this.agentXP,
      systemHealth: {
        database: 'connected',
        ipfs: 'ready',
        python_backend: 'not_configured'
      },
      uptime: process.uptime(),
      activeConnections: 3
    };
  }

  getAgentXP() {
    return {
      status: 'success',
      data: this.agentXP,
      timestamp: new Date().toISOString()
    };
  }

  getDashboardStatus() {
    return {
      status: 'success',
      data: {
        lastUpdate: new Date().toISOString(),
        totalAgents: Object.keys(this.agentXP).length,
        systemStatus: 'operational',
        streaming: true
      }
    };
  }

  async logUXInteraction(interaction: any) {
    this.logger.log(`UX Interaction: ${interaction.type} - ${interaction.component}`);
    
    // Log to telemetry service
    await this.telemetryService.logEvent({
      event: 'ux_interaction',
      component: interaction.component,
      action: interaction.type,
      timestamp: Date.now(),
      metadata: interaction.metadata || {}
    });

    return {
      status: 'logged',
      timestamp: new Date().toISOString()
    };
  }

  updateAgentXP(agentId: string, delta: number) {
    if (this.agentXP[agentId]) {
      this.agentXP[agentId].xp = Math.max(0, this.agentXP[agentId].xp + delta);
      
      // Update level based on XP
      if (this.agentXP[agentId].xp >= 2000) {
        this.agentXP[agentId].level = 'Adept';
      } else if (this.agentXP[agentId].xp >= 1000) {
        this.agentXP[agentId].level = 'Initiate';
      } else {
        this.agentXP[agentId].level = 'Novice';
      }
    }
  }
} 