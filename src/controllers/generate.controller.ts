// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { Controller, Get, Post, Sse, MessageEvent, Res, Body, Param } from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GenerateService } from '../services/generate.service.js';
import { MultiLLMService, MultiLLMRequest, LLMProvider } from '../services/multi-llm.service.js';

@Controller('generate')
export class GenerateController {
  constructor(
    private readonly generateService: GenerateService,
    private readonly multiLLMService: MultiLLMService
  ) {}

  @Post('text')
  async generateText(@Body() request: any): Promise<any> {
    return this.generateService.generateText(request);
  }

  @Sse('text/stream')
  streamText(@Body() request: any): Observable<MessageEvent> {
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

  @Post('multi-llm')
  async generateWithMultiLLM(@Body() request: MultiLLMRequest) {
    return this.multiLLMService.generateText(request);
  }

  @Get('providers')
  async getProviderStatus() {
    return this.multiLLMService.getProviderStatus();
  }

  @Get('providers/costs')
  async getProviderCosts() {
    return this.multiLLMService.getProviderCosts();
  }

  @Post('providers/:provider/enable')
  async enableProvider(
    @Param('provider') provider: LLMProvider,
    @Body() body: { apiKey?: string }
  ) {
    await this.multiLLMService.enableProvider(provider, body.apiKey);
    return { success: true, message: `Provider ${provider} enabled` };
  }

  @Post('providers/:provider/disable')
  async disableProvider(@Param('provider') provider: LLMProvider) {
    await this.multiLLMService.disableProvider(provider);
    return { success: true, message: `Provider ${provider} disabled` };
  }

  @Get('stats')
  async getGenerationStats() {
    return this.generateService.getGenerationStats();
  }

  @Get('multi-llm/metrics')
  async getMultiLLMMetrics() {
    return this.multiLLMService.getMetrics();
  }
} 