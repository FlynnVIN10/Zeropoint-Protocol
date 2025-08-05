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
    const context = await this.ragService.retrieveContext(request.query, request.topK || 5);
    
    return {
      status: 'success',
      data: {
        query: request.query,
        context: request.includeSources ? context : {
          sources: context.sources.map(s => ({
            title: s.title,
            relevance: s.relevance,
            source: s.source,
          })),
        },
        timestamp: context.timestamp,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Put('documents/legal')
  async addLegalDocument(@Body() document: DocumentRequest): Promise<any> {
    await this.ragService.addLegalDocument(
      document.title,
      document.content,
      document.source,
    );

    return {
      status: 'success',
      message: `Legal document "${document.title}" added successfully`,
      timestamp: new Date().toISOString(),
    };
  }

  @Put('documents/manufacturing')
  async addManufacturingData(@Body() document: DocumentRequest & { category: string }): Promise<any> {
    await this.ragService.addManufacturingData(
      document.title,
      document.content,
      document.category,
      document.source,
    );

    return {
      status: 'success',
      message: `Manufacturing data "${document.title}" added successfully`,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('stats')
  async getRAGStats(): Promise<any> {
    const stats = await this.ragService.getRAGStats();
    return {
      status: 'success',
      data: stats,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('seed')
  async seedSampleData(): Promise<any> {
    await this.ragService.seedSampleData();
    return {
      status: 'success',
      message: 'Sample RAG data seeded successfully',
      timestamp: new Date().toISOString(),
    };
  }
} 