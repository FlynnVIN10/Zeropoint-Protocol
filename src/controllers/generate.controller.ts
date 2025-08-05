import { Controller, Post, Body, Sse, MessageEvent, Res } from '@nestjs/common';
import { Response } from 'express';
import { Observable, interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { GenerateService } from '../services/generate.service.js';

@Controller('generate')
export class GenerateController {
  constructor(private readonly generateService: GenerateService) {}

  @Post('text')
  async generateText(@Body() body: { prompt: string; context?: any }) {
    return this.generateService.generateText(body.prompt, body.context);
  }

  @Sse('text/stream')
  streamText(@Body() body: { prompt: string; context?: any }): Observable<MessageEvent> {
    return this.generateService.streamText(body.prompt, body.context);
  }

  @Post('image')
  async generateImage(@Body() body: { prompt: string; style?: string }) {
    return this.generateService.generateImage(body.prompt, body.style);
  }
} 