import { Controller, Post, Body, Get, Put } from '@nestjs/common';
import { RAGService } from '../services/rag.service.js';

interface RAGQueryRequest {
  query: string;
  topK?: number;
  includeSources?: boolean;
}

interface DocumentRequest {
  title: string;
  content: string;
  source: string;
  category?: string;
}

@Controller('rag')
export class RAGController {
  constructor(private readonly ragService: RAGService) {}

  @Post('query')
  async queryContext(@Body() request: RAGQueryRequest): Promise<any> {
    const sources = await this.ragService.searchContext(request.query);
    const context = { sources: sources.slice(0, request.topK || 5) };
    
    return {
      status: 'success',
      data: {
        query: request.query,
        context: request.includeSources ? context : {
          sources: context.sources.map(s => ({
            title: s.title,
            relevance: s.relevance,
          })),
        },
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('stats')
  async getRAGStats(): Promise<any> {
    return {
      status: 'success',
      data: {
        documents: 0,
        lastUpdated: new Date().toISOString(),
        message: 'RAG service is running in development mode'
      },
      timestamp: new Date().toISOString(),
    };
  }
} 