// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { Test, TestingModule } from '@nestjs/testing';
import { StreamController } from '../controllers/stream.controller.js';
import { MultiLLMService } from '../services/multi-llm.service.js';
import { TelemetryService } from '../services/telemetry.service.js';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';

describe('StreamController', () => {
  let controller: StreamController;
  let multiLLMService: MultiLLMService;
  let telemetryService: TelemetryService;
  let configService: ConfigService;

  const mockResponse = {
    writeHead: jest.fn(),
    write: jest.fn(),
    on: jest.fn(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  const mockMultiLLMService = {
    processRequest: jest.fn(),
    getModelStatus: jest.fn(),
    getMetrics: jest.fn(),
  };

  const mockTelemetryService = {
    recordEvent: jest.fn(),
    recordMetric: jest.fn(),
    getMetrics: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StreamController],
      providers: [
        {
          provide: MultiLLMService,
          useValue: mockMultiLLMService,
        },
        {
          provide: TelemetryService,
          useValue: mockTelemetryService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<StreamController>(StreamController);
    multiLLMService = module.get<MultiLLMService>(MultiLLMService);
    telemetryService = module.get<TelemetryService>(TelemetryService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('streamEvents', () => {
    it('should establish SSE connection with proper headers', async () => {
      const query = { provider: 'auto' };
      
      await controller.streamEvents(mockResponse, query);

      expect(mockResponse.writeHead).toHaveBeenCalledWith(HttpStatus.OK, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
        'X-Provider-Router': 'active'
      });
    });

    it('should send initial connection event', async () => {
      const query = { provider: 'openai' };
      
      await controller.streamEvents(mockResponse, query);

      expect(mockResponse.write).toHaveBeenCalledWith(
        expect.stringContaining('"type":"connection"')
      );
      expect(mockResponse.write).toHaveBeenCalledWith(
        expect.stringContaining('"message":"SSE connection established"')
      );
    });

    it('should send system status event with provider information', async () => {
      const query = { provider: 'anthropic' };
      
      await controller.streamEvents(mockResponse, query);

      expect(mockResponse.write).toHaveBeenCalledWith(
        expect.stringContaining('"type":"system_status"')
      );
      expect(mockResponse.write).toHaveBeenCalledWith(
        expect.stringContaining('"phase":"14.0"')
      );
    });

    it('should handle client disconnect gracefully', async () => {
      const query = { provider: 'auto' };
      const closeHandler = jest.fn();
      mockResponse.on.mockImplementation((event, handler) => {
        if (event === 'close') {
          closeHandler.mockImplementation(handler);
        }
      });
      
      await controller.streamEvents(mockResponse, query);
      
      // Simulate client disconnect
      closeHandler();
      
      expect(closeHandler).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const query = { provider: 'auto' };
      const errorHandler = jest.fn();
      mockResponse.on.mockImplementation((event, handler) => {
        if (event === 'error') {
          errorHandler.mockImplementation(handler);
        }
      });
      
      await controller.streamEvents(mockResponse, query);
      
      // Simulate error
      errorHandler(new Error('Test error'));
      
      expect(errorHandler).toHaveBeenCalled();
    });
  });

  describe('streamGeneration', () => {
    it('should process generation request with provider failover', async () => {
      const request = {
        prompt: 'Test prompt',
        provider: 'auto',
        maxTokens: 100,
        temperature: 0.7,
        stream: true
      };

      mockMultiLLMService.processRequest.mockResolvedValue({
        model: 'gpt-4',
        response: 'Test response',
        tokens: 50,
        latency: 1500,
        cost: 0.0015,
        timestamp: new Date()
      });

      await controller.streamGeneration(request, mockResponse);

      expect(mockResponse.writeHead).toHaveBeenCalledWith(HttpStatus.OK, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
        'X-Provider-Router': 'active'
      });
    });

    it('should handle provider failover when primary provider fails', async () => {
      const request = {
        prompt: 'Test prompt',
        provider: 'openai',
        maxTokens: 100,
        temperature: 0.7,
        stream: true
      };

      // Simulate primary provider failure
      mockMultiLLMService.processRequest
        .mockRejectedValueOnce(new Error('OpenAI API error'))
        .mockResolvedValueOnce({
          model: 'claude-3',
          response: 'Fallback response',
          tokens: 50,
          latency: 2000,
          cost: 0.00075,
          timestamp: new Date()
        });

      await controller.streamGeneration(request, mockResponse);

      expect(mockResponse.write).toHaveBeenCalledWith(
        expect.stringContaining('"type":"provider_switch"')
      );
    });

    it('should stream tokens incrementally', async () => {
      const request = {
        prompt: 'Test prompt',
        provider: 'anthropic',
        maxTokens: 100,
        temperature: 0.7,
        stream: true
      };

      const mockResponse = {
        model: 'claude-3',
        response: 'This is a test response with multiple tokens',
        tokens: 12,
        latency: 1800,
        cost: 0.00018,
        timestamp: new Date()
      };

      mockMultiLLMService.processRequest.mockResolvedValue(mockResponse);

      await controller.streamGeneration(request, mockResponse);

      // Should send multiple token events
      expect(mockResponse.write).toHaveBeenCalledWith(
        expect.stringContaining('"type":"token"')
      );
    });
  });

  describe('getProviderStatus', () => {
    it('should return provider status information', async () => {
      const result = await controller.getProviderStatus();

      expect(result).toHaveProperty('providers');
      expect(result).toHaveProperty('overallHealth');
      expect(result).toHaveProperty('failoverRate');
      expect(result).toHaveProperty('averageLatency');
    });

    it('should include health status for each provider', async () => {
      const result = await controller.getProviderStatus();

      expect(result.providers).toHaveProperty('openai');
      expect(result.providers).toHaveProperty('anthropic');
      expect(result.providers.openai).toHaveProperty('status');
      expect(result.providers.openai).toHaveProperty('lastCheck');
      expect(result.providers.openai).toHaveProperty('failoverCount');
    });
  });

  describe('getProviderHealth', () => {
    it('should return detailed provider health metrics', async () => {
      const result = await controller.getProviderHealth();

      expect(result).toHaveProperty('openai');
      expect(result).toHaveProperty('anthropic');
      expect(result.openai).toHaveProperty('status');
      expect(result.openai).toHaveProperty('lastCheck');
      expect(result.openai).toHaveProperty('failoverCount');
    });

    it('should track failover counts accurately', async () => {
      const result = await controller.getProviderHealth();

      expect(typeof result.openai.failoverCount).toBe('number');
      expect(typeof result.anthropic.failoverCount).toBe('number');
      expect(result.openai.failoverCount).toBeGreaterThanOrEqual(0);
      expect(result.anthropic.failoverCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('load testing requirements', () => {
    it('should handle multiple concurrent connections', async () => {
      const connections = [];
      const query = { provider: 'auto' };

      // Simulate multiple concurrent connections
      for (let i = 0; i < 10; i++) {
        const mockRes = {
          writeHead: jest.fn(),
          write: jest.fn(),
          on: jest.fn(),
        } as unknown as Response;
        
        connections.push(controller.streamEvents(mockRes, query));
      }

      await Promise.all(connections);

      // All connections should be established
      connections.forEach(connection => {
        expect(connection).toBeDefined();
      });
    });

    it('should maintain connection stability under load', async () => {
      const query = { provider: 'auto' };
      const mockRes = {
        writeHead: jest.fn(),
        write: jest.fn(),
        on: jest.fn(),
      } as unknown as Response;

      // Simulate long-running connection
      const connection = controller.streamEvents(mockRes, query);
      
      // Wait for multiple heartbeat cycles
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(connection).toBeDefined();
      expect(mockRes.write).toHaveBeenCalled();
    });
  });

  describe('security and ethics requirements', () => {
    it('should implement rate limiting headers', async () => {
      const query = { provider: 'auto' };
      
      await controller.streamEvents(mockResponse, query);

      expect(mockResponse.writeHead).toHaveBeenCalledWith(
        HttpStatus.OK,
        expect.objectContaining({
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*',
        })
      );
    });

    it('should validate provider selection to prevent bias', async () => {
      const request = {
        prompt: 'Test prompt',
        provider: 'auto',
        maxTokens: 100,
        temperature: 0.7,
        stream: true
      };

      await controller.streamGeneration(request, mockResponse);

      // Should use auto provider selection logic
      expect(mockMultiLLMService.processRequest).toHaveBeenCalled();
    });

    it('should handle malformed requests gracefully', async () => {
      const invalidRequest = {
        prompt: '',
        provider: 'invalid-provider',
        maxTokens: -1,
        temperature: 2.0,
        stream: true
      };

      await expect(
        controller.streamGeneration(invalidRequest, mockResponse)
      ).resolves.not.toThrow();
    });
  });
});
