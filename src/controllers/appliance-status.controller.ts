// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { Controller, Get } from '@nestjs/common';
import { ZPCTLDiagnostic } from '../appliance/zpctl.diag';
import { execSync } from 'child_process';

export interface ApplianceVersionResponse {
  appliance_id: string;
  commit: string;
  phase: string;
  version: string;
  timestamp: string;
  build_date: string;
  runtime: {
    node_version: string;
    platform: string;
    arch: string;
  };
  tinygrad_version: string;
  simulation_mode: boolean;
}

export interface ApplianceHealthResponse {
  status: string;
  timestamp: string;
  simulation_mode: boolean;
  simulation_status: string;
  checks: {
    database: boolean;
    tinygrad: boolean;
    simulation: boolean;
  };
}

export interface ApplianceDiagnosticsResponse {
  device_inventory: any;
  driver_hashes: any;
  tinygrad_parity: any;
  energy_checks: any;
  security_checks: any;
}

@Controller('api/status')
export class ApplianceStatusController {
  private readonly diagnostic: ZPCTLDiagnostic;

  constructor() {
    this.diagnostic = new ZPCTLDiagnostic();
  }

  @Get('version')
  async getVersion(): Promise<ApplianceVersionResponse> {
    const report = await this.diagnostic.generateFullReport();
    
    // Get runtime information
    const nodeVersion = process.version;
    const platform = process.platform;
    const arch = process.arch;
    
    // Get build date
    const buildDate = new Date().toISOString().split('T')[0];
    
    // Get tinygrad version (simulated for Phase A)
    const tinygradVersion = '0.1.0-simulated';

    return {
      appliance_id: report.applianceId,
      commit: report.commit,
      phase: report.phase,
      version: report.version,
      timestamp: report.timestamp,
      build_date: buildDate,
      runtime: {
        node_version: nodeVersion,
        platform,
        arch
      },
      tinygrad_version: tinygradVersion,
      simulation_mode: true
    };
  }

  @Get('health')
  async getHealth(): Promise<ApplianceHealthResponse> {
    const timestamp = new Date().toISOString();
    
    // Simulated health checks for Phase A
    const checks = {
      database: true, // Simulated database health
      tinygrad: true, // Simulated tinygrad health
      simulation: true // Simulation environment health
    };

    // Determine overall status
    const status = Object.values(checks).every(check => check) ? 'healthy' : 'degraded';

    return {
      status,
      timestamp,
      simulation_mode: true,
      simulation_status: 'ACTIVE',
      checks
    };
  }

  @Get('diag')
  async getDiagnostics(): Promise<ApplianceDiagnosticsResponse> {
    const report = await this.diagnostic.generateFullReport();
    
    // Convert camelCase to snake_case for API response
    return {
      device_inventory: {
        cpu: report.deviceInventory.cpu,
        memory: report.deviceInventory.memory,
        storage: report.deviceInventory.storage,
        network: report.deviceInventory.network,
        gpu: report.deviceInventory.gpu
      },
      driver_hashes: {
        cpu_driver: report.driverHashes.cpuDriver,
        gpu_driver: report.driverHashes.gpuDriver,
        network_driver: report.driverHashes.networkDriver,
        storage_driver: report.driverHashes.storageDriver
      },
      tinygrad_parity: {
        status: report.tinyGradParity.status,
        tolerance: report.tinyGradParity.tolerance,
        test_cases: report.tinyGradParity.testCases,
        execution_time: report.tinyGradParity.executionTime,
        details: report.tinyGradParity.details
      },
      energy_checks: {
        power_consumption: report.energyChecks.powerConsumption,
        energy_efficiency: report.energyChecks.energyEfficiency,
        carbon_footprint: report.energyChecks.carbonFootprint
      },
      security_checks: {
        container_isolation: report.securityChecks,
        threat_model: report.securityChecks.threatModel,
        vulnerabilities: report.securityChecks.vulnerabilities
      }
    };
  }
}
