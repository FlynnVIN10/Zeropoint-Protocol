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

describe('Advanced AI Integration - Phase 9', () => {
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
                'NODE_ENV': 'test'
              };
              return config[key] || defaultValue;
            }),
          },
        },
        {
          provide: HttpService,
          useValue: {
            post: jest.fn().mockReturnValue({
              toPromise: jest.fn().mockResolvedValue({ data: { success: true } }),
              subscribe: jest.fn()
            }),
            get: jest.fn().mockReturnValue({
              toPromise: jest.fn().mockResolvedValue({ data: { success: true } }),
              subscribe: jest.fn()
            }),
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

  describe('Scaling Configuration', () => {
    it('should load scaling configuration from file', async () => {
      const mockConfig = {
        maxAgents: 100,
        maxConcurrency: 25,
        maxRequestsPerSec: 50
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockConfig));

      const result = await service.loadScalingConfig();

      expect(result).toEqual(mockConfig);
      expect(result.maxAgents).toBe(100);
      expect(result.maxConcurrency).toBe(25);
      expect(result.maxRequestsPerSec).toBe(50);
    });

    it('should return default config when file not found', async () => {
      mockFs.readFile.mockRejectedValue(new Error('File not found'));

      const result = await service.loadScalingConfig();

      expect(result.maxAgents).toBe(100);
      expect(result.maxConcurrency).toBe(25);
      expect(result.maxRequestsPerSec).toBe(50);
      expect(result.autoScaling.enabled).toBe(true);
      expect(result.autoScaling.minNodes).toBe(1);
      expect(result.autoScaling.maxNodes).toBe(10);
    });
  });

  describe('Production Scaling - Phase 10', () => {
    it('should predict scaling based on traffic patterns', async () => {
      mockCheckIntent.mockReturnValue(true);
      
      const mockConfig = {
        scalingThresholds: { cpu: 80 }
      };
      
      jest.spyOn(service, 'loadScalingConfig').mockResolvedValue(mockConfig);
      const logSpy = jest.spyOn(service, 'logConsensusToSoulchain').mockResolvedValue();

      const result = await service.predictScaling(300, { pattern: 'increasing' });

      expect(result.success).toBe(true);
      expect(result.prediction).toBeDefined();
      expect(result.prediction.currentLoad).toBeGreaterThanOrEqual(0);
      expect(result.prediction.predictedLoad).toBeGreaterThanOrEqual(0);
      expect(result.timeWindow).toBe(300);
      
      expect(logSpy).toHaveBeenCalledWith('SOULSCALE:PREDICT', expect.objectContaining({
        timeWindow: 300,
        trafficPattern: { pattern: 'increasing' }
      }));
    });

    it('should expand scaling with node addition', async () => {
      mockCheckIntent.mockReturnValue(true);
      
      const mockConfig = {
        autoScaling: { maxNodes: 10 }
      };
      
      jest.spyOn(service, 'loadScalingConfig').mockResolvedValue(mockConfig);
      const logSpy = jest.spyOn(service, 'logConsensusToSoulchain').mockResolvedValue();

      const result = await service.expandScaling(2, 'High load detected');

      expect(result.success).toBe(true);
      expect(result.expansion.nodesAdded).toBe(2);
      expect(result.expansion.reason).toBe('High load detected');
      expect(result.expansion.estimatedCost).toBe(0.1);
      
      expect(logSpy).toHaveBeenCalledWith('SOULSCALE:EXPAND', expect.objectContaining({
        expansionResult: expect.objectContaining({
          nodesAdded: 2,
          reason: 'High load detected'
        })
      }));
    });

    it('should block scaling prediction with invalid intent', async () => {
      mockCheckIntent.mockReturnValue(false);

      await expect(service.predictScaling()).rejects.toThrow('Zeroth violation: Scaling prediction blocked.');
    });

    it('should block scaling expansion with invalid intent', async () => {
      mockCheckIntent.mockReturnValue(false);

      await expect(service.expandScaling()).rejects.toThrow('Zeroth violation: Scaling expansion blocked.');
    });

    it('should use default time window when not specified', async () => {
      mockCheckIntent.mockReturnValue(true);
      
      const mockConfig = { scalingThresholds: { cpu: 80 } };
      jest.spyOn(service, 'loadScalingConfig').mockResolvedValue(mockConfig);
      jest.spyOn(service, 'logConsensusToSoulchain').mockResolvedValue();

      const result = await service.predictScaling();

      expect(result.timeWindow).toBe(300); // 5 minutes default
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