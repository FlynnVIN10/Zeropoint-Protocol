import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from '../src/app.service.js';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { checkIntent } from '../src/guards/synthient.guard.js';
import * as fs from 'fs/promises';

// Mock the synthient guard
jest.mock('../src/guards/synthient.guard.js');
const mockCheckIntent = checkIntent as jest.MockedFunction<typeof checkIntent>;

// Mock fs for config loading
jest.mock('fs/promises');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('Production Scaling Integration - Phase 10', () => {
  let service: AppService;
  let configService: ConfigService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              const config = {
                'ZEROPOINT_SERVICE_URL': 'http://localhost:8000',
                'NODE_ENV': 'test',
                'ENABLE_SCALING': true
              };
              return config[key] || defaultValue;
            }),
          },
        },
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
    configService = module.get<ConfigService>(ConfigService);
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Scaling Configuration Loading', () => {
    it('should load scaling configuration with correct structure', async () => {
      const mockConfig = {
        maxAgents: 100,
        maxConcurrency: 25,
        maxRequestsPerSec: 50,
        scalingThresholds: {
          cpu: 80,
          memory: 85,
          responseTime: 2000,
          errorRate: 5
        },
        autoScaling: {
          enabled: true,
          minNodes: 1,
          maxNodes: 10,
          scaleUpThreshold: 75,
          scaleDownThreshold: 25,
          cooldownPeriod: 300
        },
        loadBalancing: {
          algorithm: 'round-robin',
          healthCheckInterval: 30,
          failoverEnabled: true
        },
        monitoring: {
          metricsCollection: true,
          alerting: true,
          logRetention: 30
        },
        soulchain: {
          logScalingEvents: true,
          consensusRequired: true,
          minStakeForScaling: 100
        }
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockConfig));
      const logSpy = jest.spyOn(service, 'logConsensusToSoulchain').mockResolvedValue();

      const result = await service.loadScalingConfig();

      expect(result).toEqual(mockConfig);
      expect(result.maxAgents).toBe(100);
      expect(result.maxConcurrency).toBe(25);
      expect(result.maxRequestsPerSec).toBe(50);
      expect(result.autoScaling.enabled).toBe(true);
      expect(result.autoScaling.maxNodes).toBe(10);
      expect(result.soulchain.logScalingEvents).toBe(true);
      
      expect(logSpy).toHaveBeenCalledWith('SCALING_CONFIG_LOADED', expect.objectContaining({
        maxAgents: 100,
        maxConcurrency: 25,
        autoScalingEnabled: true
      }));
    });

    it('should handle missing scaling configuration file', async () => {
      mockFs.readFile.mockRejectedValue(new Error('File not found'));

      const result = await service.loadScalingConfig();

      expect(result.maxAgents).toBe(100);
      expect(result.maxConcurrency).toBe(25);
      expect(result.maxRequestsPerSec).toBe(50);
      expect(result.autoScaling.enabled).toBe(true);
      expect(result.autoScaling.minNodes).toBe(1);
      expect(result.autoScaling.maxNodes).toBe(10);
    });

    it('should handle malformed JSON in scaling configuration', async () => {
      mockFs.readFile.mockResolvedValue('invalid json');

      await expect(service.loadScalingConfig()).rejects.toThrow();
    });
  });

  describe('Scaling Prediction (SOULSCALE:PREDICT)', () => {
    it('should predict scaling with traffic heuristics', async () => {
      mockCheckIntent.mockReturnValue(true);
      
      const mockConfig = {
        scalingThresholds: { cpu: 80, memory: 85 },
        autoScaling: { maxNodes: 10 }
      };
      
      jest.spyOn(service, 'loadScalingConfig').mockResolvedValue(mockConfig);
      const logSpy = jest.spyOn(service, 'logConsensusToSoulchain').mockResolvedValue();

      const result = await service.predictScaling(600, {
        pattern: 'spike',
        timeOfDay: 'peak',
        dayOfWeek: 'monday'
      });

      expect(result.success).toBe(true);
      expect(result.prediction).toBeDefined();
      expect(result.prediction.currentLoad).toBeGreaterThanOrEqual(0);
      expect(result.prediction.currentLoad).toBeLessThanOrEqual(100);
      expect(result.prediction.predictedLoad).toBeGreaterThanOrEqual(0);
      expect(result.prediction.shouldScale).toBeDefined();
      expect(result.prediction.recommendedNodes).toBeGreaterThan(0);
      expect(result.prediction.confidence).toBeGreaterThanOrEqual(0.7);
      expect(result.prediction.confidence).toBeLessThanOrEqual(1.0);
      expect(result.timeWindow).toBe(600);
      expect(result.timestamp).toBeDefined();
      
      expect(logSpy).toHaveBeenCalledWith('SOULSCALE:PREDICT', expect.objectContaining({
        timeWindow: 600,
        trafficPattern: {
          pattern: 'spike',
          timeOfDay: 'peak',
          dayOfWeek: 'monday'
        },
        scalingDecision: expect.objectContaining({
          currentLoad: expect.any(Number),
          predictedLoad: expect.any(Number),
          shouldScale: expect.any(Boolean),
          recommendedNodes: expect.any(Number),
          confidence: expect.any(Number)
        }),
        config: mockConfig
      }));
    });

    it('should use default time window when not specified', async () => {
      mockCheckIntent.mockReturnValue(true);
      
      const mockConfig = { scalingThresholds: { cpu: 80 } };
      jest.spyOn(service, 'loadScalingConfig').mockResolvedValue(mockConfig);
      jest.spyOn(service, 'logConsensusToSoulchain').mockResolvedValue();

      const result = await service.predictScaling();

      expect(result.timeWindow).toBe(300); // 5 minutes default
    });

    it('should block scaling prediction with invalid intent', async () => {
      mockCheckIntent.mockReturnValue(false);

      await expect(service.predictScaling()).rejects.toThrow('Zeroth violation: Scaling prediction blocked.');
    });

    it('should handle scaling prediction errors gracefully', async () => {
      mockCheckIntent.mockReturnValue(true);
      jest.spyOn(service, 'loadScalingConfig').mockRejectedValue(new Error('Config error'));

      await expect(service.predictScaling()).rejects.toThrow('Config error');
    });
  });

  describe('Scaling Expansion (SOULSCALE:EXPAND)', () => {
    it('should expand scaling with node addition simulation', async () => {
      mockCheckIntent.mockReturnValue(true);
      
      const mockConfig = {
        autoScaling: { maxNodes: 10 }
      };
      
      jest.spyOn(service, 'loadScalingConfig').mockResolvedValue(mockConfig);
      const logSpy = jest.spyOn(service, 'logConsensusToSoulchain').mockResolvedValue();

      const result = await service.expandScaling(3, 'Traffic spike detected');

      expect(result.success).toBe(true);
      expect(result.expansion.nodesAdded).toBe(3);
      expect(result.expansion.totalNodes).toBeLessThanOrEqual(10);
      expect(result.expansion.estimatedCost).toBe(0.15); // 3 * 0.05
      expect(result.expansion.estimatedPerformance).toBeGreaterThan(0);
      expect(result.expansion.reason).toBe('Traffic spike detected');
      expect(result.timestamp).toBeDefined();
      
      expect(logSpy).toHaveBeenCalledWith('SOULSCALE:EXPAND', expect.objectContaining({
        expansionResult: expect.objectContaining({
          nodesAdded: 3,
          totalNodes: expect.any(Number),
          estimatedCost: 0.15,
          estimatedPerformance: expect.any(Number),
          reason: 'Traffic spike detected'
        }),
        config: mockConfig
      }));
    });

    it('should use default node count when not specified', async () => {
      mockCheckIntent.mockReturnValue(true);
      
      const mockConfig = { autoScaling: { maxNodes: 10 } };
      jest.spyOn(service, 'loadScalingConfig').mockResolvedValue(mockConfig);
      jest.spyOn(service, 'logConsensusToSoulchain').mockResolvedValue();

      const result = await service.expandScaling();

      expect(result.expansion.nodesAdded).toBe(1);
      expect(result.expansion.reason).toBe('Load increase detected');
    });

    it('should respect maximum node limit', async () => {
      mockCheckIntent.mockReturnValue(true);
      
      const mockConfig = { autoScaling: { maxNodes: 5 } };
      jest.spyOn(service, 'loadScalingConfig').mockResolvedValue(mockConfig);
      jest.spyOn(service, 'logConsensusToSoulchain').mockResolvedValue();

      const result = await service.expandScaling(10);

      expect(result.expansion.totalNodes).toBeLessThanOrEqual(5);
    });

    it('should block scaling expansion with invalid intent', async () => {
      mockCheckIntent.mockReturnValue(false);

      await expect(service.expandScaling()).rejects.toThrow('Zeroth violation: Scaling expansion blocked.');
    });

    it('should handle scaling expansion errors gracefully', async () => {
      mockCheckIntent.mockReturnValue(true);
      jest.spyOn(service, 'loadScalingConfig').mockRejectedValue(new Error('Config error'));

      await expect(service.expandScaling()).rejects.toThrow('Config error');
    });
  });

  describe('Soulchain Integration', () => {
    it('should log all scaling events to Soulchain', async () => {
      mockCheckIntent.mockReturnValue(true);
      
      const mockConfig = { scalingThresholds: { cpu: 80 } };
      jest.spyOn(service, 'loadScalingConfig').mockResolvedValue(mockConfig);
      const logSpy = jest.spyOn(service, 'logConsensusToSoulchain').mockResolvedValue();

      // Test prediction logging
      await service.predictScaling(300);
      expect(logSpy).toHaveBeenCalledWith('SOULSCALE:PREDICT', expect.any(Object));

      // Test expansion logging
      await service.expandScaling(2);
      expect(logSpy).toHaveBeenCalledWith('SOULSCALE:EXPAND', expect.any(Object));

      // Verify total calls
      expect(logSpy).toHaveBeenCalledTimes(3); // 1 for config load, 1 for predict, 1 for expand
    });

    it('should include comprehensive metadata in Soulchain logs', async () => {
      mockCheckIntent.mockReturnValue(true);
      
      const mockConfig = {
        scalingThresholds: { cpu: 80 },
        autoScaling: { maxNodes: 10 },
        soulchain: { logScalingEvents: true }
      };
      
      jest.spyOn(service, 'loadScalingConfig').mockResolvedValue(mockConfig);
      const logSpy = jest.spyOn(service, 'logConsensusToSoulchain').mockResolvedValue();

      await service.predictScaling(300, { pattern: 'test' });

      expect(logSpy).toHaveBeenCalledWith('SOULSCALE:PREDICT', expect.objectContaining({
        timestamp: expect.any(String),
        timeWindow: 300,
        trafficPattern: { pattern: 'test' },
        scalingDecision: expect.objectContaining({
          currentLoad: expect.any(Number),
          predictedLoad: expect.any(Number),
          shouldScale: expect.any(Boolean),
          recommendedNodes: expect.any(Number),
          confidence: expect.any(Number)
        }),
        config: mockConfig
      }));
    });
  });

  describe('Performance Metrics', () => {
    it('should calculate performance improvements correctly', async () => {
      mockCheckIntent.mockReturnValue(true);
      
      const mockConfig = { autoScaling: { maxNodes: 10 } };
      jest.spyOn(service, 'loadScalingConfig').mockResolvedValue(mockConfig);
      jest.spyOn(service, 'logConsensusToSoulchain').mockResolvedValue();

      const result = await service.expandScaling(5);

      expect(result.expansion.estimatedPerformance).toBeGreaterThan(0);
      expect(result.expansion.estimatedPerformance).toBeLessThanOrEqual(100);
      expect(result.expansion.estimatedCost).toBe(0.25); // 5 * 0.05
    });

    it('should provide realistic cost estimates', async () => {
      mockCheckIntent.mockReturnValue(true);
      
      const mockConfig = { autoScaling: { maxNodes: 10 } };
      jest.spyOn(service, 'loadScalingConfig').mockResolvedValue(mockConfig);
      jest.spyOn(service, 'logConsensusToSoulchain').mockResolvedValue();

      const result1 = await service.expandScaling(1);
      const result2 = await service.expandScaling(2);
      const result3 = await service.expandScaling(3);

      expect(result1.expansion.estimatedCost).toBe(0.05);
      expect(result2.expansion.estimatedCost).toBe(0.10);
      expect(result3.expansion.estimatedCost).toBe(0.15);
    });
  });
}); 