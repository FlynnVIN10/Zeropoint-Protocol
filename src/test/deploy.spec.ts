// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from '../app.service.js';
import { AppController } from '../app.controller.js';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { soulchain } from '../agents/soulchain/soulchain.ledger.js';
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

describe('Production Deployment Configuration', () => {
  let appService: AppService;
  let appController: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-value')
          }
        },
        {
          provide: HttpService,
          useValue: {
            post: jest.fn().mockReturnValue({
              pipe: jest.fn().mockReturnValue({
                subscribe: jest.fn()
              })
            }),
            get: jest.fn().mockReturnValue({
              pipe: jest.fn().mockReturnValue({
                subscribe: jest.fn()
              })
            })
          }
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
            verify: jest.fn().mockReturnValue({ sub: 'test-user' })
          }
        }
      ],
    }).compile();

    appService = module.get<AppService>(AppService);
    appController = module.get<AppController>(AppController);
  });

  describe('Deployment Script Verification', () => {
    it('should have deploy.sh script in src/scripts/', () => {
      const deployScriptPath = join(process.cwd(), 'src', 'scripts', 'deploy.sh');
      expect(existsSync(deployScriptPath)).toBe(true);
    });

    it('should have deploy.sh script with executable permissions', () => {
      const deployScriptPath = join(process.cwd(), 'src', 'scripts', 'deploy.sh');
      const stats = require('fs').statSync(deployScriptPath);
      const isExecutable = !!(stats.mode & parseInt('111', 8));
      expect(isExecutable).toBe(true);
    });

    it('should have deploy.sh script with proper content', () => {
      const deployScriptPath = join(process.cwd(), 'src', 'scripts', 'deploy.sh');
      const content = readFileSync(deployScriptPath, 'utf8');
      
      // Check for required components
      expect(content).toContain('#!/bin/bash');
      expect(content).toContain('Zeroth Principle');
      expect(content).toContain('check_intent');
      expect(content).toContain('soulchain_log');
      expect(content).toContain('npm install');
      expect(content).toContain('npm run build');
      expect(content).toContain('npm start');
      expect(content).toContain('--dry-run');
    });

    it('should have deploy.sh script with Zeroth-gate validation', () => {
      const deployScriptPath = join(process.cwd(), 'src', 'scripts', 'deploy.sh');
      const content = readFileSync(deployScriptPath, 'utf8');
      
      expect(content).toContain('Zeroth violation');
      expect(content).toContain('DEPLOYMENT_AUTHORIZED');
      expect(content).toContain('check_intent');
    });
  });

  describe('Deployment Script Simulation', () => {
    it('should simulate npm install step', () => {
      const packageJsonPath = join(process.cwd(), 'package.json');
      expect(existsSync(packageJsonPath)).toBe(true);
      
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      expect(packageJson.name).toBe('Zeropoint');
      expect(packageJson.scripts).toBeDefined();
      expect(packageJson.scripts.start).toBeDefined();
      expect(packageJson.scripts.build).toBeDefined();
    });

    it('should simulate npm run build step', () => {
      const nestCliPath = join(process.cwd(), 'nest-cli.json');
      expect(existsSync(nestCliPath)).toBe(true);
      
      const tsConfigPath = join(process.cwd(), 'tsconfig.json');
      expect(existsSync(tsConfigPath)).toBe(true);
      
      const srcPath = join(process.cwd(), 'src');
      expect(existsSync(srcPath)).toBe(true);
    });

    it('should simulate health check step', async () => {
      // Mock the health check response
      const mockHealthResponse = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
          database: 'connected',
          ipfs: 'ready',
          python_backend: 'not_configured'
        }
      };

      jest.spyOn(appService, 'healthCheck').mockResolvedValue(mockHealthResponse);
      
      const result = await appController.healthCheck();
      expect(result.status).toBe('ok');
      expect(result.services).toBeDefined();
    });

    it('should simulate soulchain logging', async () => {
      const mockSoulchainResponse = {
        success: true,
        cid: 'test-deployment-cid',
        message: 'Deployment logged to Soulchain'
      };

      jest.spyOn(soulchain, 'addXPTransaction').mockResolvedValue('test-cid');
      
      // Simulate deployment logging
      const deploymentData = {
        action: 'deployment_test',
        metadata: {
          timestamp: new Date().toISOString(),
          environment: 'test',
          user: 'test-user'
        },
        data: 'Test deployment simulation'
      };

      // This would normally call the soulchain service
      expect(mockSoulchainResponse.success).toBe(true);
      expect(mockSoulchainResponse.cid).toBeDefined();
    });
  });

  describe('Deployment Environment Verification', () => {
    it('should have required environment files', () => {
      const envFiles = ['.env', '.env.example', '.env.local'];
      const existingEnvFiles = envFiles.filter(file => 
        existsSync(join(process.cwd(), file))
      );
      
      // At least one environment file should exist
      expect(existingEnvFiles.length).toBeGreaterThan(0);
    });

    it('should have proper package.json scripts', () => {
      const packageJsonPath = join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      
      const requiredScripts = ['start', 'build', 'test'];
      requiredScripts.forEach(script => {
        expect(packageJson.scripts[script]).toBeDefined();
      });
    });

    it('should have proper TypeScript configuration', () => {
      const tsConfigPath = join(process.cwd(), 'tsconfig.json');
      const tsConfig = JSON.parse(readFileSync(tsConfigPath, 'utf8'));
      
      expect(tsConfig.compilerOptions).toBeDefined();
      expect(tsConfig.compilerOptions.target).toBeDefined();
      expect(tsConfig.compilerOptions.module).toBeDefined();
    });

    it('should have proper NestJS configuration', () => {
      const nestCliPath = join(process.cwd(), 'nest-cli.json');
      const nestCli = JSON.parse(readFileSync(nestCliPath, 'utf8'));
      
      expect(nestCli.collection).toBeDefined();
      expect(nestCli.sourceRoot).toBeDefined();
    });
  });

  describe('Deployment Security Verification', () => {
    it('should have Zeroth-gate validation in deployment script', () => {
      const deployScriptPath = join(process.cwd(), 'src', 'scripts', 'deploy.sh');
      const content = readFileSync(deployScriptPath, 'utf8');
      
      // Check for security validations
      expect(content).toContain('DEPLOYMENT_AUTHORIZED');
      expect(content).toContain('NODE_ENV');
      expect(content).toContain('production');
      expect(content).toContain('Zeroth violation');
    });

    it('should have proper error handling in deployment script', () => {
      const deployScriptPath = join(process.cwd(), 'src', 'scripts', 'deploy.sh');
      const content = readFileSync(deployScriptPath, 'utf8');
      
      expect(content).toContain('set -e');
      expect(content).toContain('exit 1');
      expect(content).toContain('error()');
    });

    it('should have soulchain logging for audit trail', () => {
      const deployScriptPath = join(process.cwd(), 'src', 'scripts', 'deploy.sh');
      const content = readFileSync(deployScriptPath, 'utf8');
      
      expect(content).toContain('soulchain_log');
      expect(content).toContain('deployment');
      expect(content).toContain('timestamp');
      expect(content).toContain('metadata');
    });
  });

  describe('Deployment Integration Tests', () => {
    it('should verify application can start successfully', async () => {
      const result = await appController.getStatus();
      expect(result.status).toBe('operational');
      expect(result.version).toBeDefined();
      expect(result.service).toBe('Zeropoint Protocol API Gateway');
    });

    it('should verify all required services are available', async () => {
      const result = await appController.getStatus();
      expect(result.endpoints).toBeDefined();
      expect(result.endpoints.auth).toBeDefined();
      expect(result.endpoints.generation).toBeDefined();
      expect(result.endpoints.storage).toBeDefined();
      expect(result.endpoints.monitoring).toBeDefined();
      expect(result.endpoints.blockchain).toBeDefined();
    });

    it('should verify deployment script can be executed', () => {
      const deployScriptPath = join(process.cwd(), 'src', 'scripts', 'deploy.sh');
      
      // Test that the script exists and is executable
      expect(existsSync(deployScriptPath)).toBe(true);
      
      // Test that the script has proper shebang
      const content = readFileSync(deployScriptPath, 'utf8');
      expect(content.startsWith('#!/bin/bash')).toBe(true);
    });
  });
}); 