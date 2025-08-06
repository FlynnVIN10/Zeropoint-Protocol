import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, interval, from } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { TelemetryService } from './telemetry.service.js';
import { RAGService } from './rag.service.js';
import OpenAI from 'openai';
import { Pool } from 'pg';

interface GenerationRequest {
  prompt: string;
  context?: {
    conversation?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
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

  constructor(
    private readonly telemetryService: TelemetryService,
    private readonly configService: ConfigService
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey: apiKey,
        organization: process.env.OPENAI_ORG_ID,
      });
      this.logger.log('OpenAI client initialized with API key');
    } else {
      this.logger.warn('OPENAI_API_KEY not provided, using fallback responses');
      this.openai = null;
    }

    this.ragService = new RAGService(this.configService);
    
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
      const ragSources = await this.ragService.searchContext(request.prompt);
      const ragContext = { sources: ragSources };
      
      // Build enhanced prompt with RAG context
      const enhancedPrompt = this.buildEnhancedPrompt(request.prompt, ragContext, request.context);
      
      // Generate response using OpenAI or fallback
      let response = '';
      let tokensUsed = 0;
      
      if (this.openai) {
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

        response = completion.choices[0]?.message?.content || '';
        tokensUsed = completion.usage?.total_tokens || 0;
      } else {
        // Fallback response when OpenAI is not available
        response = `Hello! I'm an AI assistant powered by the Zeropoint Protocol. I'm here to help you understand our ethical AI framework and answer any questions you might have about AI safety and consensus mechanisms.`;
        tokensUsed = 50; // Mock token count
      }
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
          tokensUsed: tokensUsed,
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
              const ragSources = await this.ragService.searchContext(request.prompt);
        const ragContext = { sources: ragSources };
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

      if (!this.openai) {
        // Fallback response when OpenAI is not available
        const latency = Date.now() - startTime;
        
        await this.telemetryService.logEvent('generation', 'image_completed', {
          prompt,
          style,
          latency,
          timestamp: Date.now(),
        });

        return {
          status: 'success',
          data: {
            imageUrl: 'https://via.placeholder.com/1024x1024/0066cc/ffffff?text=AI+Generated+Image',
            prompt,
            style: style || 'realistic',
            metadata: {
              timestamp: new Date().toISOString(),
              model: 'fallback',
              latency,
              note: 'OpenAI API not configured, using placeholder image',
            },
          },
          timestamp: new Date().toISOString(),
        };
      }

      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: `${prompt} ${style ? `in ${style} style` : ''}`,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      });

      if (!response || !response.data || !response.data[0]) {
        throw new Error('Failed to generate image: Invalid response from OpenAI');
      }

      const imageUrl = response.data[0].url;
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

  async generateCode(prompt: string, language?: string): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Emit code generation start event
      await this.telemetryService.logEvent('generation', 'code_started', {
        prompt,
        language,
        timestamp: startTime,
      });

      if (!this.openai) {
        // Fallback response when OpenAI is not available
        const latency = Date.now() - startTime;
        
        await this.telemetryService.logEvent('generation', 'code_completed', {
          prompt,
          language,
          latency,
          timestamp: Date.now(),
        });

        return {
          status: 'success',
          data: {
            code: `// Fallback code generation - OpenAI API not configured
// ${prompt}
function example() {
  console.log("Hello from Zeropoint Protocol");
  return "This is a fallback response when OpenAI is not available";
}`,
            prompt,
            language: language || 'JavaScript',
            metadata: {
              timestamp: new Date().toISOString(),
              model: 'fallback',
              latency,
              tokensUsed: 0,
              note: 'OpenAI API not configured, using fallback code',
            },
          },
          timestamp: new Date().toISOString(),
        };
      }

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an expert software developer. Generate clean, well-documented code in ${language || 'JavaScript'}. Always include comments explaining the logic and provide a brief description of what the code does.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3,
      });

      const code = response.choices[0]?.message?.content;
      const latency = Date.now() - startTime;

      if (!code) {
        throw new Error('Failed to generate code');
      }

      // Emit code generation completion event
      await this.telemetryService.logEvent('generation', 'code_completed', {
        prompt,
        language,
        latency,
        timestamp: Date.now(),
      });

      return {
        status: 'success',
        data: {
          code,
          prompt,
          language: language || 'JavaScript',
          metadata: {
            timestamp: new Date().toISOString(),
            model: 'gpt-4-turbo',
            latency,
            tokensUsed: response.usage?.total_tokens || 0,
          },
        },
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      this.logger.error(`Code generation failed: ${error.message}`);
      
      // Emit code generation failure event
      await this.telemetryService.logEvent('generation', 'code_failed', {
        prompt,
        language,
        error: error.message,
        timestamp: Date.now(),
      });

      throw error;
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