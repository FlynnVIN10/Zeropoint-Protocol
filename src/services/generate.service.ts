import { Injectable, Logger } from '@nestjs/common';
import { Observable, interval, from } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { TelemetryService } from './telemetry.service.js';
import { RAGService } from './rag.service.js';
import OpenAI from 'openai';
import { Pool } from 'pg';

interface GenerationRequest {
  prompt: string;
  context?: {
    conversation?: Array<{ role: string; content: string }>;
    timestamp?: string;
    sessionId?: string;
    userAgent?: string;
  };
  stream?: boolean;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

interface GenerationResponse {
  text: string;
  confidence: number;
  type: string;
  metadata: {
    prompt: string;
    context?: any;
    timestamp: string;
    model: string;
    ragSources?: Array<{ title: string; content: string; relevance: number }>;
    tokensUsed: number;
    latency: number;
  };
}

interface StreamToken {
  type: 'token' | 'complete' | 'error';
  content?: string;
  confidence?: number;
  metadata?: any;
  error?: string;
}

@Injectable()
export class GenerateService {
  private readonly logger = new Logger(GenerateService.name);
  private openai: OpenAI;
  private ragService: RAGService;
  private dbPool: Pool;

  constructor(private readonly telemetryService: TelemetryService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID,
    });

    this.ragService = new RAGService();
    
    this.dbPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'zeropoint',
      password: process.env.DB_PASS || 'zeropointpass',
      database: process.env.DB_NAME || 'zeropointdb',
    });
  }

  async generateText(request: GenerationRequest): Promise<GenerationResponse> {
    const startTime = Date.now();
    this.logger.log(`Generating text for prompt: ${request.prompt}`);

    try {
      // Emit generation start event
      await this.telemetryService.logEvent('generation', 'text_started', {
        prompt: request.prompt,
        model: request.model || 'gpt-4-turbo',
        timestamp: startTime,
      });

      // Retrieve relevant context using RAG
      const ragContext = await this.ragService.retrieveContext(request.prompt);
      
      // Build enhanced prompt with RAG context
      const enhancedPrompt = this.buildEnhancedPrompt(request.prompt, ragContext, request.context);
      
      // Generate response using OpenAI
      const completion = await this.openai.chat.completions.create({
        model: request.model || 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant powered by the Zeropoint Protocol, an advanced AI safety framework. Provide helpful, accurate, and ethically-aligned responses. When referencing information, cite your sources clearly.',
          },
          ...(request.context?.conversation || []),
          {
            role: 'user',
            content: enhancedPrompt,
          },
        ],
        max_tokens: request.maxTokens || 1000,
        temperature: request.temperature || 0.7,
        stream: false,
      });

      const response = completion.choices[0]?.message?.content || '';
      const latency = Date.now() - startTime;

      // Calculate confidence based on response quality
      const confidence = this.calculateConfidence(response, ragContext);

      const result: GenerationResponse = {
        text: response,
        confidence,
        type: this.classifyResponseType(request.prompt, response),
        metadata: {
          prompt: request.prompt,
          context: request.context,
          timestamp: new Date().toISOString(),
          model: request.model || 'gpt-4-turbo',
          ragSources: ragContext.sources,
          tokensUsed: completion.usage?.total_tokens || 0,
          latency,
        },
      };

      // Emit generation completion event
      await this.telemetryService.logEvent('generation', 'text_completed', {
        prompt: request.prompt,
        responseLength: response.length,
        confidence,
        latency,
        tokensUsed: result.metadata.tokensUsed,
        timestamp: Date.now(),
      });

      return result;

    } catch (error) {
      this.logger.error(`Text generation failed: ${error.message}`);
      
      // Emit generation failure event
      await this.telemetryService.logEvent('generation', 'text_failed', {
        prompt: request.prompt,
        error: error.message,
        timestamp: Date.now(),
      });

      throw error;
    }
  }

  streamText(request: GenerationRequest): Observable<StreamToken> {
    const startTime = Date.now();
    this.logger.log(`Starting streaming text generation for prompt: ${request.prompt}`);

    return from(this.streamTextGeneration(request, startTime));
  }

  private async *streamTextGeneration(request: GenerationRequest, startTime: number): AsyncGenerator<StreamToken> {
    try {
      // Emit streaming start event
      await this.telemetryService.logEvent('generation', 'stream_started', {
        prompt: request.prompt,
        model: request.model || 'gpt-4-turbo',
        timestamp: startTime,
      });

      // Retrieve RAG context
      const ragContext = await this.ragService.retrieveContext(request.prompt);
      const enhancedPrompt = this.buildEnhancedPrompt(request.prompt, ragContext, request.context);

      // Create streaming completion
      const stream = await this.openai.chat.completions.create({
        model: request.model || 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant powered by the Zeropoint Protocol. Provide helpful, accurate, and ethically-aligned responses. Stream your response token by token.',
          },
          ...(request.context?.conversation || []),
          {
            role: 'user',
            content: enhancedPrompt,
          },
        ],
        max_tokens: request.maxTokens || 1000,
        temperature: request.temperature || 0.7,
        stream: true,
      });

      let fullResponse = '';
      let tokenCount = 0;

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          fullResponse += content;
          tokenCount++;
          
          yield {
            type: 'token',
            content,
            metadata: {
              tokenIndex: tokenCount,
              timestamp: Date.now(),
            },
          };
        }
      }

      const latency = Date.now() - startTime;
      const confidence = this.calculateConfidence(fullResponse, ragContext);

      // Emit streaming completion event
      await this.telemetryService.logEvent('generation', 'stream_completed', {
        prompt: request.prompt,
        responseLength: fullResponse.length,
        confidence,
        latency,
        tokensUsed: tokenCount,
        timestamp: Date.now(),
      });

      yield {
        type: 'complete',
        content: fullResponse,
        confidence,
        metadata: {
          prompt: request.prompt,
          context: request.context,
          timestamp: new Date().toISOString(),
          model: request.model || 'gpt-4-turbo',
          ragSources: ragContext.sources,
          tokensUsed: tokenCount,
          latency,
        },
      };

    } catch (error) {
      this.logger.error(`Streaming text generation failed: ${error.message}`);
      
      // Emit streaming failure event
      await this.telemetryService.logEvent('generation', 'stream_failed', {
        prompt: request.prompt,
        error: error.message,
        timestamp: Date.now(),
      });

      yield {
        type: 'error',
        error: error.message,
        metadata: {
          timestamp: Date.now(),
        },
      };
    }
  }

  async generateImage(prompt: string, style?: string): Promise<any> {
    const startTime = Date.now();
    this.logger.log(`Generating image for prompt: ${prompt} with style: ${style}`);

    try {
      // Emit image generation start event
      await this.telemetryService.logEvent('generation', 'image_started', {
        prompt,
        style,
        timestamp: startTime,
      });

      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: `${prompt} ${style ? `in ${style} style` : ''}`,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      });

      const imageUrl = response.data[0]?.url;
      const latency = Date.now() - startTime;

      if (!imageUrl) {
        throw new Error('Failed to generate image');
      }

      // Emit image generation completion event
      await this.telemetryService.logEvent('generation', 'image_completed', {
        prompt,
        style,
        latency,
        timestamp: Date.now(),
      });

      return {
        status: 'success',
        data: {
          imageUrl,
          prompt,
          style: style || 'realistic',
          metadata: {
            timestamp: new Date().toISOString(),
            model: 'dall-e-3',
            latency,
          },
        },
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      this.logger.error(`Image generation failed: ${error.message}`);
      
      // Emit image generation failure event
      await this.telemetryService.logEvent('generation', 'image_failed', {
        prompt,
        style,
        error: error.message,
        timestamp: Date.now(),
      });

      throw error;
    }
  }

  private buildEnhancedPrompt(prompt: string, ragContext: any, conversationContext?: any): string {
    let enhancedPrompt = prompt;

    // Add RAG context if available
    if (ragContext.sources && ragContext.sources.length > 0) {
      enhancedPrompt += '\n\nRelevant context:\n';
      ragContext.sources.forEach((source: any, index: number) => {
        enhancedPrompt += `${index + 1}. ${source.title}: ${source.content}\n`;
      });
      enhancedPrompt += '\nPlease use this context to provide an accurate and informed response.';
    }

    // Add conversation context if available
    if (conversationContext?.conversation && conversationContext.conversation.length > 0) {
      enhancedPrompt += '\n\nConversation history:\n';
      conversationContext.conversation.forEach((msg: any) => {
        enhancedPrompt += `${msg.role}: ${msg.content}\n`;
      });
    }

    return enhancedPrompt;
  }

  private calculateConfidence(response: string, ragContext: any): number {
    let confidence = 0.8; // Base confidence

    // Increase confidence if RAG sources were found and used
    if (ragContext.sources && ragContext.sources.length > 0) {
      confidence += 0.1;
    }

    // Increase confidence for longer, more detailed responses
    if (response.length > 100) {
      confidence += 0.05;
    }

    // Decrease confidence for responses that seem uncertain
    const uncertaintyIndicators = ['i think', 'maybe', 'possibly', 'not sure', 'uncertain'];
    const lowerResponse = response.toLowerCase();
    if (uncertaintyIndicators.some(indicator => lowerResponse.includes(indicator))) {
      confidence -= 0.1;
    }

    return Math.min(Math.max(confidence, 0.1), 0.99);
  }

  private classifyResponseType(prompt: string, response: string): string {
    const lowerPrompt = prompt.toLowerCase();
    const lowerResponse = response.toLowerCase();

    if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi')) {
      return 'greeting';
    } else if (lowerPrompt.includes('zeropoint') || lowerPrompt.includes('protocol')) {
      return 'informational';
    } else if (lowerPrompt.includes('ai') || lowerPrompt.includes('artificial intelligence')) {
      return 'educational';
    } else if (lowerPrompt.includes('consensus') || lowerPrompt.includes('agreement')) {
      return 'technical';
    } else if (lowerResponse.includes('error') || lowerResponse.includes('failed')) {
      return 'error';
    } else {
      return 'general';
    }
  }

  async getGenerationStats(): Promise<any> {
    const stats = await this.telemetryService.getEventStats('generation');
    return {
      totalGenerations: stats.total || 0,
      successfulGenerations: stats.successful || 0,
      failedGenerations: stats.failed || 0,
      averageLatency: stats.avgLatency || 0,
      averageTokensUsed: stats.avgTokens || 0,
      lastUpdated: new Date().toISOString(),
    };
  }
} 