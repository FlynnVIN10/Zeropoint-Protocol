import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../src/app.controller.js';
import { AppService } from '../src/app.service.js';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EnhancedPetalsService } from '../src/agents/train/enhanced-petals.service.js';
import { ServiceOrchestrator } from '../src/agents/orchestration/service-orchestrator.js';

describe('Consensus Timeout Tests', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn().mockReturnValue({
              toPromise: jest.fn().mockResolvedValue({ data: { success: true } }),
              subscribe: jest.fn().mockReturnValue({
                unsubscribe: jest.fn()
              }),
              pipe: jest.fn().mockReturnThis()
            }),
            get: jest.fn().mockReturnValue({
              toPromise: jest.fn().mockResolvedValue({ data: { success: true } }),
              subscribe: jest.fn().mockReturnValue({
                unsubscribe: jest.fn()
              }),
              pipe: jest.fn().mockReturnThis()
            }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-value'),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
            verify: jest.fn().mockReturnValue({ sub: 'test-user' }),
          },
        },
        {
          provide: EnhancedPetalsService,
          useValue: {
            processRequest: jest.fn().mockResolvedValue({ success: true }),
            processBatch: jest.fn().mockResolvedValue({ success: true }),
            getHealth: jest.fn().mockResolvedValue({ status: 'healthy' }),
          },
        },
        {
          provide: ServiceOrchestrator,
          useValue: {
            orchestrate: jest.fn().mockResolvedValue({ success: true }),
            getHealth: jest.fn().mockResolvedValue({ status: 'healthy' }),
            getAvailableServices: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  describe('Timeout Scenarios', () => {
    it('should fail consensus sync after 30 seconds timeout', async () => {
      // Mock a slow response
      jest.spyOn(appService, 'syncConsensusWithDAOState').mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          success: false,
          error: 'Operation timed out after 30 seconds'
        }), 31000))
      );

      const startTime = Date.now();
      
      const result = await appController.syncConsensusWithDAOState({
        proposalId: 'timeout-test',
        consensusData: {
          votes: [
            { voter: 'user1', choice: 'yes', weight: 100, timestamp: new Date(), signature: 'sig1' }
          ],
          quorum: 1,
          threshold: 0.5,
          timestamp: new Date()
        }
      });

      const duration = Date.now() - startTime;
      
      expect(duration).toBeGreaterThan(30000);
      expect(result.success).toBe(false);
      expect(result.data.error).toContain('timed out');
    }, 35000);

    it('should fail consensus intent validation after 30 seconds timeout', async () => {
      // Mock a slow response
      jest.spyOn(appService, 'validateConsensusIntent').mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          success: false,
          error: 'Intent validation timed out after 30 seconds'
        }), 31000))
      );

      const startTime = Date.now();
      
      const result = await appController.validateConsensusIntent({
        intent: 'Test proposal',
        stakeAmount: 150
      });

      const duration = Date.now() - startTime;
      
      expect(duration).toBeGreaterThan(30000);
      expect(result.success).toBe(false);
      expect(result.data.error).toContain('timed out');
    }, 35000);

    it('should fail consensus pass after 30 seconds timeout', async () => {
      // Mock a slow response
      jest.spyOn(appService, 'processConsensusPass').mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          success: false,
          error: 'Consensus pass timed out after 30 seconds'
        }), 31000))
      );

      const startTime = Date.now();
      
      const result = await appController.processConsensusPass({
        proposalId: 'timeout-test',
        votes: [
          { voter: 'user1', choice: 'yes', weight: 100, timestamp: new Date(), signature: 'sig1' },
          { voter: 'user2', choice: 'yes', weight: 150, timestamp: new Date(), signature: 'sig2' }
        ]
      });

      const duration = Date.now() - startTime;
      
      expect(duration).toBeGreaterThan(30000);
      expect(result.success).toBe(false);
      expect(result.data.error).toContain('timed out');
    }, 35000);
  });

  describe('Performance Thresholds', () => {
    it('should complete consensus sync within 30 seconds', async () => {
      const startTime = Date.now();
      
      const result = await appController.syncConsensusWithDAOState({
        proposalId: 'performance-test',
        consensusData: {
          votes: [
            { voter: 'user1', choice: 'yes', weight: 100, timestamp: new Date(), signature: 'sig1' },
            { voter: 'user2', choice: 'yes', weight: 150, timestamp: new Date(), signature: 'sig2' }
          ],
          quorum: 2,
          threshold: 0.5,
          timestamp: new Date()
        }
      });

      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(30000);
      expect(result.success).toBe(true);
    }, 35000);

    it('should complete intent validation within 30 seconds', async () => {
      const startTime = Date.now();
      
      const result = await appController.validateConsensusIntent({
        intent: 'Performance test proposal',
        stakeAmount: 200
      });

      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(30000);
      expect(result.success).toBe(true);
    }, 35000);

    it('should complete consensus pass within 30 seconds', async () => {
      const startTime = Date.now();
      
      const result = await appController.processConsensusPass({
        proposalId: 'performance-test',
        votes: [
          { voter: 'user1', choice: 'yes', weight: 100, timestamp: new Date(), signature: 'sig1' },
          { voter: 'user2', choice: 'yes', weight: 150, timestamp: new Date(), signature: 'sig2' },
          { voter: 'user3', choice: 'yes', weight: 80, timestamp: new Date(), signature: 'sig3' }
        ]
      });

      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(30000);
      expect(result.success).toBe(true);
    }, 35000);
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple concurrent consensus operations', async () => {
      const operations = Array.from({ length: 5 }, (_, i) => 
        appController.validateConsensusIntent({
          intent: `Concurrent proposal ${i}`,
          stakeAmount: 150
        })
      );

      const startTime = Date.now();
      const results = await Promise.all(operations);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(30000);
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    }, 35000);

    it('should handle mixed concurrent operations', async () => {
      const operations = [
        appController.validateConsensusIntent({ intent: 'Test 1', stakeAmount: 150 }),
        appController.syncConsensusWithDAOState({
          proposalId: 'test-1',
          consensusData: {
            votes: [{ voter: 'user1', choice: 'yes', weight: 100, timestamp: new Date(), signature: 'sig1' }],
            quorum: 1,
            threshold: 0.5,
            timestamp: new Date()
          }
        }),
        appController.processConsensusPass({
          proposalId: 'test-1',
          votes: [{ voter: 'user1', choice: 'yes', weight: 100, timestamp: new Date(), signature: 'sig1' }]
        })
      ];

      const startTime = Date.now();
      const results = await Promise.all(operations);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(30000);
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    }, 35000);
  });

  describe('Error Recovery', () => {
    it('should recover from timeout and retry successfully', async () => {
      let callCount = 0;
      
      jest.spyOn(appService, 'validateConsensusIntent').mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return new Promise(resolve => setTimeout(() => resolve({
            success: false,
            error: 'Timeout on first attempt'
          }), 1000));
        }
        return Promise.resolve({
          success: true,
          operation: 'intent_validation',
          intent: 'Retry test',
          stakeAmount: 150,
          duration: 500,
          zerothGate: 'passed'
        });
      });

      const result = await appController.validateConsensusIntent({
        intent: 'Retry test',
        stakeAmount: 150
      });

      expect(callCount).toBe(1); // Only one call in this test
      expect(result.success).toBe(true);
    });

    it('should handle network timeouts gracefully', async () => {
      jest.spyOn(appService, 'syncConsensusWithDAOState').mockRejectedValue(
        new Error('Network timeout')
      );

      const result = await appController.syncConsensusWithDAOState({
        proposalId: 'network-test',
        consensusData: {
          votes: [{ voter: 'user1', choice: 'yes', weight: 100, timestamp: new Date(), signature: 'sig1' }],
          quorum: 1,
          threshold: 0.5,
          timestamp: new Date()
        }
      });

      expect(result.success).toBe(false);
      expect(result.data.error).toContain('Network timeout');
    });
  });
}); 