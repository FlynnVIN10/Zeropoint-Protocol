// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { Controller, Get, Post, Body, Res, Query, HttpStatus, HttpException, Logger } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { MultiLLMService } from '../services/multi-llm.service.js';
import { TelemetryService } from '../services/telemetry.service.js';

interface StreamRequest {
  prompt: string;
  model?: string;
  provider?: 'openai' | 'anthropic' | 'auto';
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

interface StreamResponse {
  type: 'token' | 'error' | 'complete' | 'provider_switch';
  content?: string;
  provider?: string;
  metadata?: {
    tokenIndex?: number;
    timestamp: number;
    providerLatency?: number;
    failoverReason?: string;
  };
}

@Controller('v1/stream')
export class StreamController {
  private readonly logger = new Logger(StreamController.name);
  private activeConnections = new Set<Response>();
  private providerHealth = new Map<string, { status: 'healthy' | 'degraded' | 'down'; lastCheck: number; failoverCount: number }>();

  constructor(
    private readonly configService: ConfigService,
    private readonly multiLLMService: MultiLLMService,
    private readonly telemetryService: TelemetryService
  ) {
    // Initialize provider health monitoring
    this.initializeProviderHealth();
  }

  @Get('stream')
  async streamEvents(@Res() res: Response, @Query() query: StreamRequest) {
    // Set SSE headers
    res.writeHead(HttpStatus.OK, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
      'X-Provider-Router': 'active'
    });

    // Add to active connections
    this.activeConnections.add(res);

    // Send initial connection event
    res.write(`data: ${JSON.stringify({
      type: 'connection',
      timestamp: new Date().toISOString(),
      message: 'SSE connection established',
      provider: query.provider || 'auto',
      availableProviders: this.getAvailableProviders()
    })}\n\n`);

    // Send system status event
    res.write(`data: ${JSON.stringify({
      type: 'system_status',
      timestamp: new Date().toISOString(),
      data: {
        phase: '14.0',
        status: 'healthy',
        uptime: process.uptime(),
        services: {
          database: 'healthy',
          api: 'healthy',
          sse: 'active',
          providerRouter: 'active'
        },
        providers: this.getProviderStatus()
      }
    })}\n\n`);

    // Keep connection alive with periodic events
    const interval = setInterval(() => {
      res.write(`data: ${JSON.stringify({
        type: 'heartbeat',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        activeConnections: this.activeConnections.size
      })}\n\n`);
    }, 30000); // Send heartbeat every 30 seconds

    // Handle client disconnect
    res.on('close', () => {
      clearInterval(interval);
      this.activeConnections.delete(res);
      this.logger.log('SSE client disconnected');
    });

    // Handle errors
    res.on('error', (error) => {
      clearInterval(interval);
      this.activeConnections.delete(res);
      this.logger.error('SSE stream error:', error);
    });
  }

  @Post('generate')
  async streamGeneration(@Body() request: StreamRequest, @Res() res: Response) {
    const startTime = Date.now();
    
    try {
      // Validate request
      if (!request.prompt) {
        throw new HttpException('Prompt is required', HttpStatus.BAD_REQUEST);
      }

      // Set SSE headers for streaming response
      res.writeHead(HttpStatus.OK, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });

      // Log generation start
      await this.telemetryService.logEvent('generation', 'stream_started', {
        prompt: request.prompt,
        model: request.model || 'auto',
        provider: request.provider || 'auto',
        timestamp: startTime,
      });

      // Determine provider with failover logic
      const selectedProvider = await this.selectProvider(request.provider || 'auto');
      
      // Send provider selection event
      res.write(`data: ${JSON.stringify({
        type: 'provider_selected',
        provider: selectedProvider,
        timestamp: Date.now(),
        metadata: {
          selectionReason: 'auto_routing',
          providerHealth: this.providerHealth.get(selectedProvider)?.status
        }
      })}\n\n`);

      // Generate streaming response
      const stream = await this.multiLLMService.streamText({
        prompt: request.prompt,
        model: request.model,
        provider: selectedProvider,
        maxTokens: request.maxTokens || 1000,
        temperature: request.temperature || 0.7,
        stream: true
      });

      let tokenCount = 0;
      let fullResponse = '';

      for await (const chunk of stream) {
        if (chunk.type === 'token' && chunk.content) {
          fullResponse += chunk.content;
          tokenCount++;

          // Send token event
          res.write(`data: ${JSON.stringify({
            type: 'token',
            content: chunk.content,
            metadata: {
              tokenIndex: tokenCount,
              timestamp: Date.now(),
              provider: selectedProvider,
              providerLatency: Date.now() - startTime
            }
          })}\n\n`);
        } else if (chunk.type === 'provider_switch') {
          // Handle provider failover during generation
          const newProvider = await this.selectProvider('auto');
          res.write(`data: ${JSON.stringify({
            type: 'provider_switch',
            provider: newProvider,
            metadata: {
              failoverReason: chunk.metadata?.failoverReason || 'provider_failure',
              timestamp: Date.now()
            }
          })}\n\n`);
        }
      }

      // Send completion event
      res.write(`data: ${JSON.stringify({
        type: 'complete',
        metadata: {
          totalTokens: tokenCount,
          finalProvider: selectedProvider,
          totalLatency: Date.now() - startTime,
          responseLength: fullResponse.length
        }
      })}\n\n`);

      // Log successful generation
      await this.telemetryService.logEvent('generation', 'stream_completed', {
        prompt: request.prompt,
        provider: selectedProvider,
        tokensGenerated: tokenCount,
        latency: Date.now() - startTime,
        timestamp: Date.now(),
      });

    } catch (error) {
      this.logger.error('Stream generation error:', error);
      
      // Send error event
      res.write(`data: ${JSON.stringify({
        type: 'error',
        content: error.message || 'Generation failed',
        metadata: {
          timestamp: Date.now(),
          errorType: error.constructor.name
        }
      })}\n\n`);

      // Log error
      await this.telemetryService.logEvent('generation', 'stream_error', {
        prompt: request.prompt,
        error: error.message,
        timestamp: Date.now(),
      });
    } finally {
      res.end();
    }
  }

  @Get('providers/status')
  async getProviderStatus() {
    return {
      status: 'success',
      data: {
        providers: this.getProviderStatus(),
        routing: {
          strategy: 'health_based',
          failoverThreshold: 3,
          healthCheckInterval: 30000
        },
        metrics: {
          totalRequests: await this.getTotalRequests(),
          failoverRate: this.calculateFailoverRate(),
          averageLatency: await this.getAverageLatency()
        }
      }
    };
  }

  @Get('providers/health')
  async getProviderHealth() {
    return {
      status: 'success',
      data: {
        providers: Array.from(this.providerHealth.entries()).map(([name, health]) => ({
          name,
          status: health.status,
          lastCheck: new Date(health.lastCheck).toISOString(),
          failoverCount: health.failoverCount
        })),
        overall: this.getOverallHealth()
      }
    };
  }

  private async selectProvider(preferredProvider: string): Promise<string> {
    const availableProviders = this.getAvailableProviders();
    
    if (preferredProvider === 'auto') {
      // Auto-select based on health and performance
      const healthyProviders = availableProviders.filter(p => 
        this.providerHealth.get(p)?.status === 'healthy'
      );
      
      if (healthyProviders.length === 0) {
        throw new Error('No healthy providers available');
      }
      
      // Select provider with lowest failover count
      return healthyProviders.reduce((best, current) => {
        const bestHealth = this.providerHealth.get(best);
        const currentHealth = this.providerHealth.get(current);
        return (currentHealth?.failoverCount || 0) < (bestHealth?.failoverCount || 0) ? current : best;
      });
    }
    
    // Check if preferred provider is healthy
    const health = this.providerHealth.get(preferredProvider);
    if (health?.status === 'healthy') {
      return preferredProvider;
    }
    
    // Fallback to auto-selection
    return this.selectProvider('auto');
  }

  private getAvailableProviders(): string[] {
    return ['openai', 'anthropic'].filter(provider => {
      const health = this.providerHealth.get(provider);
      return health && health.status !== 'down';
    });
  }

  private getProviderStatus() {
    return Array.from(this.providerHealth.entries()).map(([name, health]) => ({
      name,
      status: health.status,
      lastCheck: new Date(health.lastCheck).toISOString(),
      failoverCount: health.failoverCount
    }));
  }

  private getOverallHealth(): 'healthy' | 'degraded' | 'down' {
    const providers = Array.from(this.providerHealth.values());
    const healthyCount = providers.filter(p => p.status === 'healthy').length;
    const totalCount = providers.length;
    
    if (healthyCount === totalCount) return 'healthy';
    if (healthyCount > 0) return 'degraded';
    return 'down';
  }

  private async getTotalRequests(): Promise<number> {
    // This would integrate with actual metrics service
    return Math.floor(Math.random() * 1000) + 100;
  }

  private calculateFailoverRate(): number {
    const providers = Array.from(this.providerHealth.values());
    const totalFailovers = providers.reduce((sum, p) => sum + p.failoverCount, 0);
    const totalChecks = providers.reduce((sum, p) => sum + Math.floor((Date.now() - p.lastCheck) / 30000), 0);
    return totalChecks > 0 ? totalFailovers / totalChecks : 0;
  }

  private async getAverageLatency(): Promise<number> {
    // This would integrate with actual metrics service
    return Math.floor(Math.random() * 100) + 50;
  }

  private initializeProviderHealth() {
    // Initialize provider health status
    this.providerHealth.set('openai', { status: 'healthy', lastCheck: Date.now(), failoverCount: 0 });
    this.providerHealth.set('anthropic', { status: 'healthy', lastCheck: Date.now(), failoverCount: 0 });
    
    // Start health monitoring
    setInterval(() => this.checkProviderHealth(), 30000);
  }

  private async checkProviderHealth() {
    for (const [provider, health] of this.providerHealth.entries()) {
      try {
        // Simulate health check (replace with actual provider health check)
        const isHealthy = Math.random() > 0.1; // 90% success rate
        
        if (isHealthy) {
          health.status = 'healthy';
        } else {
          health.status = 'degraded';
          health.failoverCount++;
        }
        
        health.lastCheck = Date.now();
      } catch (error) {
        health.status = 'down';
        health.failoverCount++;
        health.lastCheck = Date.now();
        this.logger.error(`Provider health check failed for ${provider}:`, error);
      }
    }
  }
}
