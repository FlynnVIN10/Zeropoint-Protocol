import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from '../src/app.service.js';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { soulchain } from '../src/agents/soulchain/soulchain.ledger.js';

describe('Advanced AI Integration', () => {
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
            get: jest.fn((key: string) => {
              switch (key) {
                case 'PYTHON_BACKEND_URL':
                  return 'http://localhost:8000';
                default:
                  return 'test-value';
              }
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

  describe('textSummarization', () => {
    it('should summarize text with ethical validation', async () => {
      const mockResponse = {
        data: {
          summary: 'This is a test summary',
          key_points: ['Point 1', 'Point 2'],
          confidence: 0.95
        }
      };

      jest.spyOn(httpService, 'post').mockResolvedValue(mockResponse as any);
      jest.spyOn(soulchain, 'addXPTransaction').mockResolvedValue('test-cid');

      const result = await service.textSummarization('This is a test text for summarization', {
        maxLength: 100,
        style: 'concise'
      });

      expect(result.summary).toBe('This is a test summary');
      expect(result.key_points).toEqual(['Point 1', 'Point 2']);
      expect(result.confidence).toBe(0.95);
      expect(result.metadata.ethical_validation).toBe('passed');
      expect(result.metadata.soulchain_logged).toBe(true);
    });

    it('should handle ethical validation failures', async () => {
      jest.spyOn(soulchain, 'addXPTransaction').mockResolvedValue('test-cid');

      // Mock the checkIntent to return false (ethical violation)
      jest.spyOn(require('../src/guards/synthient.guard.js'), 'checkIntent').mockReturnValue(false);

      await expect(
        service.textSummarization('harmful content', { maxLength: 100 })
      ).rejects.toThrow('Zeroth-gate blocked: Ethical validation failed');
    });

    it('should log errors to soulchain', async () => {
      jest.spyOn(httpService, 'post').mockRejectedValue(new Error('Backend error'));
      jest.spyOn(soulchain, 'addXPTransaction').mockResolvedValue('test-cid');

      await expect(
        service.textSummarization('Test text', { maxLength: 100 })
      ).rejects.toThrow('Backend error');

      expect(soulchain.addXPTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          agentId: 'consensus-bridge',
          rationale: expect.stringContaining('ADVANCED_SUMMARIZATION_ERROR')
        })
      );
    });
  });

  describe('contextPrompting', () => {
    it('should process context-aware prompts with ethical validation', async () => {
      const mockResponse = {
        data: {
          response: 'This is a context-aware response',
          context_used: 'relevant context',
          confidence: 0.88
        }
      };

      jest.spyOn(httpService, 'post').mockResolvedValue(mockResponse as any);
      jest.spyOn(soulchain, 'addXPTransaction').mockResolvedValue('test-cid');

      const result = await service.contextPrompting(
        'What is the answer?',
        'This is the context',
        { temperature: 0.7, maxTokens: 500 }
      );

      expect(result.response).toBe('This is a context-aware response');
      expect(result.context_used).toBe('relevant context');
      expect(result.confidence).toBe(0.88);
      expect(result.metadata.ethical_validation).toBe('passed');
      expect(result.metadata.soulchain_logged).toBe(true);
    });

    it('should handle context prompting ethical validation failures', async () => {
      jest.spyOn(soulchain, 'addXPTransaction').mockResolvedValue('test-cid');

      // Mock the checkIntent to return false (ethical violation)
      jest.spyOn(require('../src/guards/synthient.guard.js'), 'checkIntent').mockReturnValue(false);

      await expect(
        service.contextPrompting('harmful prompt', 'context', { temperature: 0.7 })
      ).rejects.toThrow('Zeroth-gate blocked: Ethical validation failed');
    });

    it('should log thought processes to soulchain', async () => {
      const mockResponse = {
        data: {
          response: 'Test response',
          context_used: 'Test context',
          confidence: 0.9
        }
      };

      jest.spyOn(httpService, 'post').mockResolvedValue(mockResponse as any);
      jest.spyOn(soulchain, 'addXPTransaction').mockResolvedValue('test-cid');

      await service.contextPrompting('Test prompt', 'Test context');

      expect(soulchain.addXPTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          agentId: 'advanced-ai',
          rationale: expect.stringContaining('context_prompting')
        })
      );
    });
  });

  describe('loadScalingConfig', () => {
    it('should load scaling configuration successfully', async () => {
      jest.spyOn(soulchain, 'addXPTransaction').mockResolvedValue('test-cid');

      const config = await service.loadScalingConfig();

      expect(config.maxAgents).toBe(100);
      expect(config.maxConcurrency).toBe(25);
      expect(config.maxRequestsPerSec).toBe(50);
      expect(config.autoScaling.enabled).toBe(true);
    });

    it('should return default config if file not found', async () => {
      jest.spyOn(require('fs').promises, 'readFile').mockRejectedValue(new Error('File not found'));
      jest.spyOn(soulchain, 'addXPTransaction').mockResolvedValue('test-cid');

      const config = await service.loadScalingConfig();

      expect(config.maxAgents).toBe(100);
      expect(config.maxConcurrency).toBe(25);
      expect(config.maxRequestsPerSec).toBe(50);
      expect(config.autoScaling.enabled).toBe(true);
    });
  });
}); 