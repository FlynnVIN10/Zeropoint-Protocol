// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { Controller, Get } from '@nestjs/common';
import { zpctlDiag } from '../appliance/zpctl.diag';

@Controller('api/status')
export class ApplianceStatusController {
  @Get('version')
  async getVersion() {
    try {
      const diagnostics = await zpctlDiag();
      
      return {
        appliance_id: diagnostics.appliance_id,
        platform: diagnostics.platform,
        commit: diagnostics.commit,
        phase: diagnostics.phase,
        timestamp: diagnostics.timestamp
      };
    } catch (error) {
      return {
        appliance_id: 'zp-local',
        platform: 'darwin-arm64',
        commit: 'unknown',
        phase: 'A',
        timestamp: new Date().toISOString(),
        error: 'Failed to get diagnostics'
      };
    }
  }

  @Get('health')
  async getHealth() {
    try {
      const { zpctlHealth } = await import('../appliance/zpctl.health');
      return await zpctlHealth();
    } catch (error) {
      return {
        status: 'red',
        checks: {
          total: 1,
          passed: 0,
          failed: 1,
          warnings: 0
        },
        details: {
          health_check: {
            status: 'fail',
            message: 'Health check failed to load',
            details: error instanceof Error ? error.message : 'Unknown error'
          }
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('diagnostics')
  async getDiagnostics() {
    try {
      return await zpctlDiag(true);
    } catch (error) {
      return {
        error: 'Failed to get diagnostics',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
}
