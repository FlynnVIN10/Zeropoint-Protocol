// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../app.controller.js';
import { AppService } from '../app.service.js';
import { EnhancedPetalsService } from '../agents/train/enhanced-petals.service.js';
import { ServiceOrchestrator } from '../agents/orchestration/service-orchestrator.js';
import { JwtService } from '@nestjs/jwt';
import { soulchain } from '../agents/soulchain/soulchain.ledger.js';
import { TagBundle } from '../core/identity/tags.meta.js';

describe('Advanced Integration Features', () => {
  let appController: AppController;
  let petalsService: EnhancedPetalsService;
  let orchestrator: ServiceOrchestrator;

  const sampleTags: TagBundle = [
    {
      type: '#who',
      name: 'test-agent',
      did: 'did:zeropoint:test-agent',
      handle: '@test-agent'
    },
    {
      type: '#intent',
      purpose: '#integration-testing',
      validation: 'good-heart'
    },
    {
      type: '#thread',
      taskId: 'test-integration',
      lineage: ['test', 'integration'],
      swarmLink: 'integration-swarm'
    },
    {
      type: '#layer',
      level: '#live'
    },
    {
      type: '#domain',
      field: '#ai'
    }
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
            verify: jest.fn().mockReturnValue({ sub: 'test-user' })
          }
        },
        {
          provide: EnhancedPetalsService,
          useValue: {
            processRequest: jest.fn(),
            processBatchRequest: jest.fn(),
            getHealth: jest.fn()
          }
        },
        {
          provide: ServiceOrchestrator,
          useValue: {
            orchestrateServices: jest.fn(),
            getHealth: jest.fn(),
            getAvailableServices: jest.fn()
          }
        }
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
    petalsService = module.get<EnhancedPetalsService>(EnhancedPetalsService);
    orchestrator = module.get<ServiceOrchestrator>(ServiceOrchestrator);
  });

  describe('Enhanced Petals Service', () => {
    it('should process single Petals request', async () => {
      const mockResponse = {
        success: true,
        agentId: 'test-agent',
        rewrittenCode: '// improved code',
        trustScore: 0.95,
        ethicalRating: 'aligned',
        notes: ['Code improvement applied']
      };

      jest.spyOn(petalsService, 'processRequest').mockResolvedValue(mockResponse);

      const result = await appController.callPetalsSingle({
        agentId: 'test-agent',
        code: 'function test() { return true; }',
        tags: sampleTags
      });

      expect(result.success).toBe(true);
      expect(result.agentId).toBe('test-agent');
      expect(result.trustScore).toBe(0.95);
      expect(result.ethicalRating).toBe('aligned');
    });

    it('should process batch Petals requests', async () => {
      const mockResponse = {
        success: true,
        batchId: 'test-batch',
        results: [
          {
            agentId: 'agent-1',
            rewrittenCode: '// improved code 1',
            trustScore: 0.9,
            ethicalRating: 'aligned'
          },
          {
            agentId: 'agent-2',
            rewrittenCode: '// improved code 2',
            trustScore: 0.95,
            ethicalRating: 'aligned'
          }
        ],
        summary: {
          totalRequests: 2,
          successfulRequests: 2,
          averageTrustScore: 0.925
        }
      };

      jest.spyOn(petalsService, 'processBatchRequest').mockResolvedValue(mockResponse);

      const result = await appController.callPetalsBatch({
        requests: [
          {
            agentId: 'agent-1',
            code: 'function test1() { return true; }',
            tags: sampleTags
          },
          {
            agentId: 'agent-2',
            code: 'function test2() { return false; }',
            tags: sampleTags
          }
        ],
        batchId: 'test-batch',
        priority: 'medium',
        timeout: 30000
      });

      expect(result.success).toBe(true);
      expect(result.batchId).toBe('test-batch');
      expect(result.results).toHaveLength(2);
      expect(result.summary.totalRequests).toBe(2);
    });

    it('should return Petals health status', async () => {
      const mockHealth = {
        status: 'healthy',
        service: 'Enhanced Petals Service',
        version: '1.0.0',
        uptime: 3600,
        metrics: {
          totalRequests: 100,
          successfulRequests: 95,
          averageResponseTime: 150
        }
      };

      jest.spyOn(petalsService, 'getHealth').mockResolvedValue(mockHealth);

      const result = await appController.getPetalsHealth();

      expect(result.status).toBe('healthy');
      expect(result.service).toBe('Enhanced Petals Service');
      expect(result.metrics.totalRequests).toBe(100);
    });
  });

  describe('Service Orchestration', () => {
    it('should orchestrate multiple services', async () => {
      const mockResponse = {
        success: true,
        id: 'test-orchestration',
        results: [
          {
            operationId: '0',
            type: 'petals',
            status: 'completed',
            result: { trustScore: 0.95 }
          },
          {
            operationId: '1',
            type: 'ai-generation',
            status: 'completed',
            result: { generatedText: 'Generated content' }
          }
        ],
        summary: {
          totalOperations: 2,
          successfulOperations: 2,
          failedOperations: 0,
          totalDuration: 1500
        }
      };

      jest.spyOn(orchestrator, 'orchestrateServices').mockResolvedValue(mockResponse);

      const result = await appController.orchestrateServices({
        id: 'test-orchestration',
        agentId: 'test-agent',
        operations: [
          {
            type: 'petals',
            data: { code: 'function test() { return true; }' },
            tags: sampleTags
          },
          {
            type: 'ai-generation',
            data: { prompt: 'Generate content' },
            tags: sampleTags
          }
        ],
        priority: 'high',
        timeout: 30000
      });

      expect(result.success).toBe(true);
      expect(result.id).toBe('test-orchestration');
      expect(result.results).toHaveLength(2);
      expect(result.summary.totalOperations).toBe(2);
    });

    it('should handle orchestration with dependencies', async () => {
      const mockResponse = {
        success: true,
        id: 'test-deps',
        results: [
          {
            operationId: '0',
            type: 'validation',
            status: 'completed',
            result: { isValid: true }
          },
          {
            operationId: '1',
            type: 'ai-generation',
            status: 'completed',
            result: { generatedText: 'Validated content' }
          }
        ],
        summary: {
          totalOperations: 2,
          successfulOperations: 2,
          failedOperations: 0
        }
      };

      jest.spyOn(orchestrator, 'orchestrateServices').mockResolvedValue(mockResponse);

      const result = await appController.orchestrateServices({
        id: 'test-deps',
        agentId: 'test-agent',
        operations: [
          {
            type: 'validation',
            data: { data: 'test data' },
            tags: sampleTags,
            dependencies: []
          },
          {
            type: 'ai-generation',
            data: { prompt: 'Generate based on validation' },
            tags: sampleTags,
            dependencies: ['0']
          }
        ],
        priority: 'medium'
      });

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(2);
    });

    it('should return orchestration health status', async () => {
      const mockHealth = {
        status: 'healthy',
        service: 'Service Orchestrator',
        version: '1.0.0',
        uptime: 7200,
        metrics: {
          totalOrchestrations: 50,
          successfulOrchestrations: 48,
          averageOrchestrationTime: 2500
        }
      };

      jest.spyOn(orchestrator, 'getHealth').mockResolvedValue(mockHealth);

      const result = await appController.getOrchestrationHealth();

      expect(result.status).toBe('healthy');
      expect(result.service).toBe('Service Orchestrator');
      expect(result.metrics.totalOrchestrations).toBe(50);
    });

    it('should return available services', async () => {
      const mockServices = {
        services: [
          {
            name: 'petals',
            description: 'Code improvement service',
            status: 'available',
            version: '1.0.0'
          },
          {
            name: 'ai-generation',
            description: 'AI content generation',
            status: 'available',
            version: '1.0.0'
          },
          {
            name: 'validation',
            description: 'Data validation service',
            status: 'available',
            version: '1.0.0'
          }
        ]
      };

      jest.spyOn(orchestrator, 'getAvailableServices').mockResolvedValue(mockServices);

      const result = await appController.getAvailableServices();

      expect(result.services).toHaveLength(3);
      expect(result.services[0].name).toBe('petals');
      expect(result.services[1].name).toBe('ai-generation');
      expect(result.services[2].name).toBe('validation');
    });
  });

  describe('Error Handling', () => {
    it('should handle Petals service errors', async () => {
      jest.spyOn(petalsService, 'processRequest').mockRejectedValue(new Error('Petals service unavailable'));

      await expect(appController.callPetalsSingle({
        agentId: 'test-agent',
        code: 'function test() { return true; }',
        tags: sampleTags
      })).rejects.toThrow();
    });

    it('should handle orchestration errors', async () => {
      jest.spyOn(orchestrator, 'orchestrateServices').mockRejectedValue(new Error('Orchestration failed'));

      await expect(appController.orchestrateServices({
        id: 'test-error',
        agentId: 'test-agent',
        operations: [],
        priority: 'low'
      })).rejects.toThrow();
    });
  });

  describe('Soulchain Integration', () => {
    it('should log Petals operations to Soulchain', async () => {
      const mockAddXPTransaction = jest.spyOn(soulchain, 'addXPTransaction').mockResolvedValue({
        success: true,
        cid: 'test-cid',
        amount: 1
      });

      jest.spyOn(petalsService, 'processRequest').mockResolvedValue({
        success: true,
        agentId: 'test-agent',
        rewrittenCode: '// improved code',
        trustScore: 0.95,
        ethicalRating: 'aligned'
      });

      await appController.callPetalsSingle({
        agentId: 'test-agent',
        code: 'function test() { return true; }',
        tags: sampleTags
      });

      expect(mockAddXPTransaction).toHaveBeenCalled();
    });

    it('should log orchestration operations to Soulchain', async () => {
      const mockAddXPTransaction = jest.spyOn(soulchain, 'addXPTransaction').mockResolvedValue({
        success: true,
        cid: 'test-cid',
        amount: 1
      });

      jest.spyOn(orchestrator, 'orchestrateServices').mockResolvedValue({
        success: true,
        id: 'test-orchestration',
        results: [],
        summary: { totalOperations: 0, successfulOperations: 0, failedOperations: 0 }
      });

      await appController.orchestrateServices({
        id: 'test-orchestration',
        agentId: 'test-agent',
        operations: [],
        priority: 'low'
      });

      expect(mockAddXPTransaction).toHaveBeenCalled();
    });
  });

  describe('Zeroth-Gate Validation', () => {
    it('should block malicious Petals requests', async () => {
      await expect(appController.callPetalsSingle({
        agentId: 'test-agent',
        code: 'function harm() { destroy(); }',
        tags: sampleTags
      })).rejects.toThrow('Zeroth violation: Petals request blocked.');
    });

    it('should block malicious orchestration requests', async () => {
      await expect(appController.orchestrateServices({
        id: 'test-malicious',
        agentId: 'test-agent',
        operations: [
          {
            type: 'petals',
            data: { code: 'function destroy() { harm(); }' },
            tags: sampleTags
          }
        ],
        priority: 'high'
      })).rejects.toThrow('Zeroth violation: Orchestration blocked.');
    });
  });
}); 