import { Controller, Post, Body, Sse, MessageEvent, Res, Get } from '@nestjs/common';
import { Response } from 'express';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { GenerateService } from '../services/generate.service.js';

interface GenerateTextRequest {
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

@Controller('generate')
export class GenerateController {
  constructor(private readonly generateService: GenerateService) {}

  @Post('text')
  async generateText(@Body() request: GenerateTextRequest) {
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

  @Get('stats')
  async getGenerationStats() {
    return this.generateService.getGenerationStats();
  }
} 