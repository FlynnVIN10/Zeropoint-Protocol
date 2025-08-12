#!/usr/bin/env node

// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { ZPCTLDiagnostic } from './zpctl.diag.js';

class ZPCTL {
  private diagnostic: ZPCTLDiagnostic;

  constructor() {
    this.diagnostic = new ZPCTLDiagnostic();
  }

  async run(): Promise<void> {
    const args = process.argv.slice(2);
    const command = args[0];

    if (!command) {
      this.showHelp();
      return;
    }

    try {
      switch (command) {
        case 'diag':
          await this.runDiagnostics();
          break;
        case 'health':
          await this.runHealthCheck();
          break;
        case 'version':
          await this.showVersion();
          break;
        case 'help':
        case '--help':
        case '-h':
          this.showHelp();
          break;
        default:
          console.error(`Unknown command: ${command}`);
          this.showHelp();
          process.exit(1);
      }
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  }

  private async runDiagnostics(): Promise<void> {
    console.log('🔍 Running ZPCTL Diagnostics...\n');
    await this.diagnostic.printDiagnostics();
  }

  private async runHealthCheck(): Promise<void> {
    console.log('🏥 Running Health Check...\n');
    
    const report = await this.diagnostic.generateFullReport();
    
    console.log('=== Health Status ===');
    console.log(`Overall Status: ✅ HEALTHY`);
    console.log(`Simulation Mode: ${report.simulation_mode ? '✅ ACTIVE' : '❌ INACTIVE'}`);
    console.log(`TinyGrad Status: ${report.tinyGradParity.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Security Status: ${report.securityChecks.status === 'SECURE' ? '✅ SECURE' : '❌ VULNERABLE'}`);
    console.log(`Container Isolation: ${report.securityChecks.isolationLevel}`);
    console.log('');
    
    console.log('=== Quick Metrics ===');
    console.log(`CPU: ${report.deviceInventory.cpu.cores}C/${report.deviceInventory.cpu.threads}T ${report.deviceInventory.cpu.frequency}`);
    console.log(`Memory: ${report.deviceInventory.memory.total}`);
    console.log(`GPU: ${report.deviceInventory.gpu.model}`);
    console.log(`Storage: ${report.deviceInventory.storage.nvme.capacity} NVMe + ${report.deviceInventory.storage.hdd.capacity} HDD`);
    console.log('');
    
    console.log('=== Energy Status ===');
    console.log(`Idle Power: ${report.energyChecks.powerConsumption.idle}W`);
    console.log(`Load Power: ${report.energyChecks.powerConsumption.load}W`);
    console.log(`Peak Power: ${report.energyChecks.powerConsumption.peak}W`);
    console.log(`Efficiency: ${(report.energyChecks.energyEfficiency.opsPerWatt / 1e9).toFixed(2)} GOPS/W`);
  }

  private async showVersion(): Promise<void> {
    const report = await this.diagnostic.generateFullReport();
    
    console.log('=== ZPCTL Version Information ===');
    console.log(`ZPCTL Version: ${report.version}`);
    console.log(`Appliance ID: ${report.applianceId}`);
    console.log(`Phase: ${report.phase}`);
    console.log(`Commit: ${report.commit}`);
    console.log(`Build Date: ${new Date().toISOString().split('T')[0]}`);
    console.log(`Simulation Mode: ${report.simulation_mode ? 'Enabled' : 'Disabled'}`);
    console.log('');
    
    console.log('=== Runtime Information ===');
    console.log(`Node.js: ${process.version}`);
    console.log(`Platform: ${process.platform}`);
    console.log(`Architecture: ${process.arch}`);
    console.log(`TinyGrad: 0.1.0-simulated`);
  }

  private showHelp(): void {
    console.log('ZPCTL - Zeropoint Protocol Control Tool');
    console.log('');
    console.log('Usage: zpctl <command> [options]');
    console.log('');
    console.log('Commands:');
    console.log('  diag      Run full diagnostic report');
    console.log('  health    Run health check');
    console.log('  version   Show version information');
    console.log('  help      Show this help message');
    console.log('');
    console.log('Examples:');
    console.log('  zpctl diag');
    console.log('  zpctl health');
    console.log('  zpctl version');
    console.log('');
    console.log('Phase A - Simulation Mode Active');
    console.log('All hardware interactions are simulated for development purposes.');
  }
}

// Run the CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const zpctl = new ZPCTL();
  zpctl.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { ZPCTL };
