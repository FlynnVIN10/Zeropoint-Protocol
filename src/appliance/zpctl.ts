#!/usr/bin/env node

import { Command } from 'commander';
import { zpctlDiag } from './zpctl.diag.ts';
import { zpctlHealth } from './zpctl.health.ts';

const program = new Command();

program
  .name('zpctl')
  .description('Zeropoint Protocol Appliance Control Tool')
  .version('1.0.0');

// Diag command
program
  .command('diag')
  .description('Run system diagnostics and output JSON')
  .option('-v, --verbose', 'Verbose output')
  .action(async (options) => {
    try {
      const diagnostics = await zpctlDiag(options.verbose);
      console.log(JSON.stringify(diagnostics, null, 2));
    } catch (error) {
      console.error('Diagnostics failed:', error);
      process.exit(1);
    }
  });

// Health command
program
  .command('health')
  .description('Check system health and return status')
  .option('-j, --json', 'Output JSON format')
  .action(async (options) => {
    try {
      const health = await zpctlHealth();
      if (options.json) {
        console.log(JSON.stringify(health, null, 2));
      } else {
        if (health.status === 'green') {
          console.log('✅ HEALTHY');
        } else if (health.status === 'yellow') {
          console.log('⚠️  WARNING');
        } else {
          console.log('❌ UNHEALTHY');
        }
        console.log(`Status: ${health.status}`);
        console.log(`Checks: ${health.checks.passed}/${health.checks.total}`);
      }
    } catch (error) {
      console.error('Health check failed:', error);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();
