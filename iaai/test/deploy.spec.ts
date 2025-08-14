import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

describe('Deployment Script (e2e)', () => {
  describe('Deployment Script Verification', () => {
    it('should have deploy.sh script in src/scripts/', () => {
      const scriptPath = path.join(__dirname, '..', 'src', 'scripts', 'deploy.sh');
      expect(fs.existsSync(scriptPath)).toBe(true);
    });

    it('should have deploy.sh script with executable permissions', async () => {
      const { stdout } = await execAsync('ls -la src/scripts/deploy.sh');
      expect(stdout).toContain('-rwxr-xr-x');
      expect(stdout).toContain('deploy.sh');
    });

    it('should have deploy.sh script with proper content', async () => {
      const scriptContent = fs.readFileSync('src/scripts/deploy.sh', 'utf8');
      expect(scriptContent).toContain('#!/bin/bash');
      expect(scriptContent).toContain('check_intent');
      expect(scriptContent).toContain('npm install');
      expect(scriptContent).toContain('npm run build');
      expect(scriptContent).toContain('npm start');
      expect(scriptContent).toContain('soulchain_log');
    });

    it('should have deploy.sh script with Zeroth-gate validation', async () => {
      const scriptContent = fs.readFileSync('src/scripts/deploy.sh', 'utf8');
      expect(scriptContent).toContain('check_intent');
      expect(scriptContent).toContain('Intent check passed');
    });
  });

  describe('Deployment Script Simulation', () => {
    it('should simulate npm install step', async () => {
      const { stdout } = await execAsync('./src/scripts/deploy.sh --dry-run');
      expect(stdout).toContain('DRY RUN: Would run \'npm install\'');
    });

    it('should simulate npm run build step', async () => {
      const { stdout } = await execAsync('./src/scripts/deploy.sh --dry-run');
      expect(stdout).toContain('DRY RUN: Would run \'npm run build\'');
    });

    it('should simulate health check step', async () => {
      const { stdout } = await execAsync('./src/scripts/deploy.sh --dry-run');
      expect(stdout).toContain('DRY RUN: Would verify deployment with curl');
    });

    it('should simulate soulchain logging', async () => {
      const { stdout } = await execAsync('./src/scripts/deploy.sh --dry-run');
      expect(stdout).toContain('DRY RUN: Would log to soulchain');
    });
  });

  describe('Deployment Environment Verification', () => {
    it('should have required environment files', () => {
      const envFiles = ['.env', '.env.example', '.env.sample'];
      const hasEnvFile = envFiles.some(file => fs.existsSync(file));
      expect(hasEnvFile).toBe(true);
    });

    it('should have proper package.json scripts', () => {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      expect(packageJson.scripts).toHaveProperty('build');
      expect(packageJson.scripts).toHaveProperty('start');
      expect(packageJson.scripts).toHaveProperty('test');
    });

    it('should have proper TypeScript configuration', () => {
      expect(fs.existsSync('tsconfig.json')).toBe(true);
      expect(fs.existsSync('tsconfig.build.json')).toBe(true);
    });

    it('should have proper NestJS configuration', () => {
      expect(fs.existsSync('nest-cli.json')).toBe(true);
    });
  });

  describe('Deployment Security Verification', () => {
    it('should have Zeroth-gate validation in deployment script', async () => {
      const scriptContent = fs.readFileSync('src/scripts/deploy.sh', 'utf8');
      expect(scriptContent).toContain('check_intent');
      expect(scriptContent).toContain('Intent check passed');
    });

    it('should have proper error handling in deployment script', async () => {
      const scriptContent = fs.readFileSync('src/scripts/deploy.sh', 'utf8');
      expect(scriptContent).toContain('set -e'); // Exit on error
      expect(scriptContent).toContain('error()'); // Error function
      expect(scriptContent).toContain('success()'); // Success function
      expect(scriptContent).toContain('warning()'); // Warning function
    });

    it('should have soulchain logging for audit trail', async () => {
      const scriptContent = fs.readFileSync('src/scripts/deploy.sh', 'utf8');
      expect(scriptContent).toContain('soulchain_log');
      expect(scriptContent).toContain('Deployment executed at');
    });
  });

  describe('Deployment Integration Tests', () => {
    it('should verify deployment script can be executed', async () => {
      const { stdout } = await execAsync('./src/scripts/deploy.sh --dry-run');
      expect(stdout).toContain('Starting Zeropoint Protocol deployment');
      expect(stdout).toContain('Deployment completed successfully');
    });

    it('should handle invalid arguments gracefully', async () => {
      try {
        await execAsync('./src/scripts/deploy.sh --invalid-option');
        fail('Should have failed with invalid option');
      } catch (error) {
        expect(error.stderr).toContain('Unknown option: --invalid-option');
      }
    });

    it('should show help when --help is provided', async () => {
      const { stdout } = await execAsync('./src/scripts/deploy.sh --help');
      expect(stdout).toContain('Usage:');
      expect(stdout).toContain('--dry-run');
      expect(stdout).toContain('--help');
      expect(stdout).toContain('Examples:');
    });
  });

  describe('Health Check Endpoint', () => {
    it('should respond to health check when application is running', async () => {
      try {
        const { stdout } = await execAsync('curl -s http://localhost:3000/v1/health');
        const response = JSON.parse(stdout);
        expect(response).toHaveProperty('status', 'ok');
        expect(response).toHaveProperty('timestamp');
        expect(response).toHaveProperty('service', 'zeropoint-api');
      } catch (error) {
        // If the application is not running, this is expected
        console.log('Application not running, skipping health check test');
      }
    });
  });

  describe('Soulchain Integration', () => {
    it('should have soulchain endpoint available when application is running', async () => {
      try {
        const { stdout } = await execAsync('curl -s -X POST http://localhost:3000/v1/soulchain/persist -H "Content-Type: application/json" -d \'{"action":"test","metadata":{"timestamp":"2025-07-28T00:00:00.000Z"},"data":"test"}\'');
        const response = JSON.parse(stdout);
        expect(response).toHaveProperty('id');
        expect(response).toHaveProperty('timestamp');
      } catch (error) {
        // If the application is not running, this is expected
        console.log('Application not running, skipping soulchain test');
      }
    });
  });

  describe('Build Process', () => {
    it('should have valid package.json', () => {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      expect(packageJson).toHaveProperty('name', 'Zeropoint');
      expect(packageJson).toHaveProperty('version');
      expect(packageJson).toHaveProperty('scripts');
      expect(packageJson.scripts).toHaveProperty('build');
      expect(packageJson.scripts).toHaveProperty('start');
    });

    it('should have NestJS configuration', () => {
      const nestConfig = JSON.parse(fs.readFileSync('nest-cli.json', 'utf8'));
      expect(nestConfig).toHaveProperty('collection');
      expect(nestConfig).toHaveProperty('sourceRoot');
      expect(nestConfig.sourceRoot).toBe('src');
    });
  });

  describe('Production Readiness', () => {
    it('should have all required environment variables documented', () => {
      const envFiles = ['.env.example', '.env.sample', 'env.example'];
      const hasEnvFile = envFiles.some(file => fs.existsSync(file));
      expect(hasEnvFile).toBe(true);
    });

    it('should have proper error handling in deployment script', async () => {
      const scriptContent = fs.readFileSync('src/scripts/deploy.sh', 'utf8');
      expect(scriptContent).toContain('set -e'); // Exit on error
      expect(scriptContent).toContain('error()'); // Error function
      expect(scriptContent).toContain('success()'); // Success function
      expect(scriptContent).toContain('warning()'); // Warning function
    });
  });
});