// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { Perplexity } from '@perplexity/ai';

export enum LLMProvider {
  OPENAI = 'openai',
  CLAUDE = 'claude',
  PERPLEXITY = 'perplexity',
  GROK = 'grok',
  PETALS = 'petals',
  TINYGRAD = 'tinygrad'
}

export interface LLMModel {
  id: string;
  name: string;
  provider: LLMProvider;
  capabilities: string[];
  maxTokens: number;
  costPerToken: number;
  latency: number;
  availability: number;
  lastUsed: Date;
  enabled: boolean;
  apiKey?: string;
}

export interface MultiLLMRequest {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  taskType?: string;
  priority?: 'low' | 'medium' | 'high';
  provider?: LLMProvider;
  fallbackProviders?: LLMProvider[];
}

export interface MultiLLMResponse {
  model: string;
  provider: LLMProvider;
  response: string;
  tokens: number;
  latency: number;
  cost: number;
  timestamp: Date;
  fallbackUsed: boolean;
  originalProvider?: LLMProvider;
}

export interface ProviderStatus {
  provider: LLMProvider;
  enabled: boolean;
  available: boolean;
  lastCheck: Date;
  errorCount: number;
  successRate: number;
}

@Injectable()
export class MultiLLMService {
  private readonly logger = new Logger(MultiLLMService.name);
  private models: Map<string, LLMModel> = new Map();
  private providers: Map<LLMProvider, any> = new Map();
  private providerStatus: Map<LLMProvider, ProviderStatus> = new Map();
  private requestQueue: MultiLLMRequest[] = [];
  private isProcessing = false;

  constructor(private configService: ConfigService) {
    this.initializeModels();
    this.initializeProviders();
  }

  private initializeModels() {
    // Initialize with comprehensive model definitions
    const defaultModels: LLMModel[] = [
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        provider: LLMProvider.OPENAI,
        capabilities: ['text-generation', 'code-generation', 'reasoning', 'analysis'],
        maxTokens: 128000,
        costPerToken: 0.00001,
        latency: 2000,
        availability: 0.99,
        lastUsed: new Date(),
        enabled: true
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        provider: LLMProvider.OPENAI,
        capabilities: ['text-generation', 'code-generation'],
        maxTokens: 16385,
        costPerToken: 0.000002,
        latency: 1000,
        availability: 0.99,
        lastUsed: new Date(),
        enabled: true
      },
      {
        id: 'claude-3-opus',
        name: 'Claude 3 Opus',
        provider: LLMProvider.CLAUDE,
        capabilities: ['text-generation', 'reasoning', 'analysis', 'vision'],
        maxTokens: 200000,
        costPerToken: 0.000015,
        latency: 1500,
        availability: 0.98,
        lastUsed: new Date(),
        enabled: true
      },
      {
        id: 'claude-3-sonnet',
        name: 'Claude 3 Sonnet',
        provider: LLMProvider.CLAUDE,
        capabilities: ['text-generation', 'reasoning', 'analysis'],
        maxTokens: 200000,
        costPerToken: 0.000003,
        latency: 1200,
        availability: 0.98,
        lastUsed: new Date(),
        enabled: true
      },
      {
        id: 'perplexity-sonar',
        name: 'Perplexity Sonar',
        provider: LLMProvider.PERPLEXITY,
        capabilities: ['text-generation', 'web-search', 'analysis'],
        maxTokens: 4096,
        costPerToken: 0.00001,
        latency: 800,
        availability: 0.97,
        lastUsed: new Date(),
        enabled: true
      },
      {
        id: 'grok-beta',
        name: 'Grok Beta',
        provider: LLMProvider.GROK,
        capabilities: ['text-generation', 'reasoning', 'real-time'],
        maxTokens: 8192,
        costPerToken: 0.000025,
        latency: 3000,
        availability: 0.95,
        lastUsed: new Date(),
        enabled: false
      },
      {
        id: 'petals-distributed',
        name: 'Petals Distributed',
        provider: LLMProvider.PETALS,
        capabilities: ['text-generation', 'distributed-training'],
        maxTokens: 2048,
        costPerToken: 0.0,
        latency: 5000,
        availability: 0.90,
        lastUsed: new Date(),
        enabled: false
      },
      {
        id: 'tinygrad-local',
        name: 'TinyGrad Local',
        provider: LLMProvider.TINYGRAD,
        capabilities: ['text-generation', 'local-inference'],
        maxTokens: 1024,
        costPerToken: 0.0,
        latency: 10000,
        availability: 0.85,
        lastUsed: new Date(),
        enabled: false
      }
    ];

    defaultModels.forEach(model => {
      this.models.set(model.id, model);
    });

    this.logger.log(`Initialized ${defaultModels.length} LLM models`);
  }

  private initializeProviders() {
    // Initialize provider clients
    try {
      const openaiKey = this.configService.get<string>('OPENAI_API_KEY');
      if (openaiKey) {
        this.providers.set(LLMProvider.OPENAI, new OpenAI({ apiKey: openaiKey }));
        this.logger.log('OpenAI provider initialized');
      }

      const claudeKey = this.configService.get<string>('ANTHROPIC_API_KEY');
      if (claudeKey) {
        this.providers.set(LLMProvider.CLAUDE, new Anthropic({ apiKey: claudeKey }));
        this.logger.log('Claude provider initialized');
      }

      const perplexityKey = this.configService.get<string>('PERPLEXITY_API_KEY');
      if (perplexityKey) {
        this.providers.set(LLMProvider.PERPLEXITY, new Perplexity({ apiKey: perplexityKey }));
        this.logger.log('Perplexity provider initialized');
      }

      // Initialize provider status
      Object.values(LLMProvider).forEach(provider => {
        this.providerStatus.set(provider, {
          provider,
          enabled: this.isProviderEnabled(provider),
          available: this.isProviderAvailable(provider),
          lastCheck: new Date(),
          errorCount: 0,
          successRate: 1.0
        });
      });

    } catch (error) {
      this.logger.error('Error initializing providers:', error);
    }
  }

  private isProviderEnabled(provider: LLMProvider): boolean {
    const models = Array.from(this.models.values()).filter(m => m.provider === provider);
    return models.some(m => m.enabled);
  }

  private isProviderAvailable(provider: LLMProvider): boolean {
    return this.providers.has(provider) && this.isProviderEnabled(provider);
  }

  async generateText(request: MultiLLMRequest): Promise<MultiLLMResponse> {
    this.logger.log(`Processing Multi-LLM request: ${request.taskType || 'general'}`);

    // Select primary provider
    let selectedProvider = request.provider || this.selectPrimaryProvider(request);
    let fallbackUsed = false;
    let originalProvider = selectedProvider;

    try {
      // Try primary provider
      const response = await this.generateWithProvider(request, selectedProvider);
      return {
        ...response,
        fallbackUsed: false,
        originalProvider: selectedProvider
      };
    } catch (error) {
      this.logger.warn(`Primary provider ${selectedProvider} failed: ${error.message}`);
      
      // Try fallback providers
      const fallbackProviders = request.fallbackProviders || this.getFallbackProviders(selectedProvider);
      
      for (const fallbackProvider of fallbackProviders) {
        try {
          this.logger.log(`Trying fallback provider: ${fallbackProvider}`);
          const response = await this.generateWithProvider(request, fallbackProvider);
          return {
            ...response,
            fallbackUsed: true,
            originalProvider: selectedProvider
          };
        } catch (fallbackError) {
          this.logger.warn(`Fallback provider ${fallbackProvider} failed: ${fallbackError.message}`);
          continue;
        }
      }

      // All providers failed
      throw new Error(`All LLM providers failed for request: ${error.message}`);
    }
  }

  private async generateWithProvider(request: MultiLLMRequest, provider: LLMProvider): Promise<MultiLLMResponse> {
    const startTime = Date.now();
    
    switch (provider) {
      case LLMProvider.OPENAI:
        return await this.generateWithOpenAI(request);
      case LLMProvider.CLAUDE:
        return await this.generateWithClaude(request);
      case LLMProvider.PERPLEXITY:
        return await this.generateWithPerplexity(request);
      case LLMProvider.GROK:
        return await this.generateWithGrok(request);
      case LLMProvider.PETALS:
        return await this.generateWithPetals(request);
      case LLMProvider.TINYGRAD:
        return await this.generateWithTinyGrad(request);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  private async generateWithOpenAI(request: MultiLLMRequest): Promise<MultiLLMResponse> {
    const openai = this.providers.get(LLMProvider.OPENAI);
    if (!openai) throw new Error('OpenAI provider not available');

    const model = request.model || 'gpt-4-turbo';
    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: request.prompt }],
      max_tokens: request.maxTokens || 1000,
      temperature: request.temperature || 0.7,
    });

    const response = completion.choices[0]?.message?.content || '';
    const tokens = completion.usage?.total_tokens || 0;
    const cost = tokens * 0.00001; // OpenAI GPT-4 Turbo cost

    return {
      model,
      provider: LLMProvider.OPENAI,
      response,
      tokens,
      latency: Date.now(),
      cost,
      timestamp: new Date(),
      fallbackUsed: false
    };
  }

  private async generateWithClaude(request: MultiLLMRequest): Promise<MultiLLMResponse> {
    const claude = this.providers.get(LLMProvider.CLAUDE);
    if (!claude) throw new Error('Claude provider not available');

    const model = request.model || 'claude-3-sonnet';
    const message = await claude.messages.create({
      model,
      max_tokens: request.maxTokens || 1000,
      messages: [{ role: 'user', content: request.prompt }],
    });

    const response = message.content[0]?.text || '';
    const tokens = message.usage?.input_tokens || 0;
    const cost = tokens * 0.000003; // Claude 3 Sonnet cost

    return {
      model,
      provider: LLMProvider.CLAUDE,
      response,
      tokens,
      latency: Date.now(),
      cost,
      timestamp: new Date(),
      fallbackUsed: false
    };
  }

  private async generateWithPerplexity(request: MultiLLMRequest): Promise<MultiLLMResponse> {
    const perplexity = this.providers.get(LLMProvider.PERPLEXITY);
    if (!perplexity) throw new Error('Perplexity provider not available');

    const model = request.model || 'perplexity-sonar';
    const completion = await perplexity.chat.completions.create({
      model,
      messages: [{ role: 'user', content: request.prompt }],
      max_tokens: request.maxTokens || 1000,
      temperature: request.temperature || 0.7,
    });

    const response = completion.choices[0]?.message?.content || '';
    const tokens = completion.usage?.total_tokens || 0;
    const cost = tokens * 0.00001; // Perplexity cost

    return {
      model,
      provider: LLMProvider.PERPLEXITY,
      response,
      tokens,
      latency: Date.now(),
      cost,
      timestamp: new Date(),
      fallbackUsed: false
    };
  }

  private async generateWithGrok(request: MultiLLMRequest): Promise<MultiLLMResponse> {
    // Grok integration placeholder - requires Grok API access
    throw new Error('Grok provider not yet implemented - requires API access');
  }

  private async generateWithPetals(request: MultiLLMRequest): Promise<MultiLLMResponse> {
    // Petals integration placeholder - requires distributed network setup
    throw new Error('Petals provider not yet implemented - requires distributed network setup');
  }

  private async generateWithTinyGrad(request: MultiLLMRequest): Promise<MultiLLMResponse> {
    // TinyGrad integration placeholder - requires local model setup
    throw new Error('TinyGrad provider not yet implemented - requires local model setup');
  }

  private selectPrimaryProvider(request: MultiLLMRequest): LLMProvider {
    const availableProviders = Array.from(this.providerStatus.values())
      .filter(status => status.enabled && status.available)
      .sort((a, b) => b.successRate - a.successRate);

    if (availableProviders.length === 0) {
      throw new Error('No available LLM providers');
    }

    // Select based on task type and capabilities
    if (request.taskType === 'reasoning') {
      const reasoningProviders = availableProviders.filter(p => 
        p.provider === LLMProvider.CLAUDE || p.provider === LLMProvider.OPENAI
      );
      return reasoningProviders[0]?.provider || availableProviders[0].provider;
    }

    if (request.taskType === 'code-generation') {
      const codeProviders = availableProviders.filter(p => 
        p.provider === LLMProvider.OPENAI || p.provider === LLMProvider.CLAUDE
      );
      return codeProviders[0]?.provider || availableProviders[0].provider;
    }

    // Default to highest success rate provider
    return availableProviders[0].provider;
  }

  private getFallbackProviders(primaryProvider: LLMProvider): LLMProvider[] {
    const fallbackOrder = [
      LLMProvider.OPENAI,
      LLMProvider.CLAUDE,
      LLMProvider.PERPLEXITY,
      LLMProvider.PETALS,
      LLMProvider.TINYGRAD,
      LLMProvider.GROK
    ];

    return fallbackOrder.filter(p => p !== primaryProvider && this.isProviderAvailable(p));
  }

  async getProviderStatus(): Promise<Record<LLMProvider, ProviderStatus>> {
    // Update status for all providers
    for (const [provider, status] of this.providerStatus) {
      status.available = this.isProviderAvailable(provider);
      status.lastCheck = new Date();
    }

    return Object.fromEntries(this.providerStatus);
  }

  async getProviderCosts(): Promise<Record<LLMProvider, { costPerToken: number; enabled: boolean }>> {
    const costs: Record<LLMProvider, { costPerToken: number; enabled: boolean }> = {} as any;
    
    for (const [provider, status] of this.providerStatus) {
      const models = Array.from(this.models.values()).filter(m => m.provider === provider);
      const avgCost = models.reduce((sum, m) => sum + m.costPerToken, 0) / models.length;
      
      costs[provider] = {
        costPerToken: avgCost,
        enabled: status.enabled
      };
    }

    return costs;
  }

  async enableProvider(provider: LLMProvider, apiKey?: string): Promise<void> {
    const models = Array.from(this.models.values()).filter(m => m.provider === provider);
    
    if (models.length === 0) {
      throw new Error(`No models found for provider: ${provider}`);
    }

    // Enable all models for this provider
    models.forEach(model => {
      model.enabled = true;
      if (apiKey) model.apiKey = apiKey;
    });

    // Update provider status
    const status = this.providerStatus.get(provider);
    if (status) {
      status.enabled = true;
    }

    this.logger.log(`Provider ${provider} enabled`);
  }

  async disableProvider(provider: LLMProvider): Promise<void> {
    const models = Array.from(this.models.values()).filter(m => m.provider === provider);
    
    // Disable all models for this provider
    models.forEach(model => {
      model.enabled = false;
      delete model.apiKey;
    });

    // Update provider status
    const status = this.providerStatus.get(provider);
    if (status) {
      status.enabled = false;
    }

    this.logger.log(`Provider ${provider} disabled`);
  }

  getMetrics() {
    const models = Array.from(this.models.values());
    const enabledModels = models.filter(m => m.enabled);
    
    return {
      totalModels: models.length,
      enabledModels: enabledModels.length,
      availableModels: enabledModels.filter(m => m.availability > 0.95).length,
      averageLatency: enabledModels.reduce((sum, m) => sum + m.latency, 0) / enabledModels.length,
      averageCost: enabledModels.reduce((sum, m) => sum + m.costPerToken, 0) / enabledModels.length,
      providers: Object.fromEntries(this.providerStatus),
      lastUpdated: new Date()
    };
  }
} 