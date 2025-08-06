import { Controller, Post, Body, Sse, MessageEvent, Res, Get } from '@nestjs/common';
import { Response } from 'express';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { GenerateService } from '../services/generate.service.js';

// Import the response type
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

interface GenerateTextRequest {
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

@Controller('generate')
export class GenerateController {
  constructor(private readonly generateService: GenerateService) {}

  @Post('text')
  async generateText(@Body() request: GenerateTextRequest): Promise<GenerationResponse> {
    return this.generateService.generateText(request);
  }

  @Sse('text/stream')
  streamText(@Body() request: GenerateTextRequest): Observable<MessageEvent> {
    return this.generateService.streamText(request).pipe(
      map(token => ({
        data: JSON.stringify(token),
      }))
    );
  }

  @Post('image')
  async generateImage(@Body() body: { prompt: string; style?: string }) {
    return this.generateService.generateImage(body.prompt, body.style);
  }

  @Post('code')
  async generateCode(@Body() body: { prompt: string; language?: string }) {
    return this.generateService.generateCode(body.prompt, body.language);
  }

  @Get('stats')
  async getGenerationStats() {
    return this.generateService.getGenerationStats();
  }
} 