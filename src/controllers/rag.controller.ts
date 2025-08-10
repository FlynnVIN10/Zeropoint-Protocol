import { Controller, Post, Body, Get, Put, Query, HttpException, HttpStatus } from '@nestjs/common';
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

interface LegalDocumentRequest {
  title: string;
  content: string;
  category: string;
  source: string;
}

interface ManufacturingDocumentRequest {
  title: string;
  content: string;
  category: string;
  source: string;
}

@Controller('rag')
export class RAGController {
  constructor(private readonly ragService: RAGService) {}

  @Post('query')
  async queryContext(@Body() request: RAGQueryRequest): Promise<any> {
    try {
      const response = await this.ragService.queryRAG(request.query, request.topK || 5);
      
      return {
        status: 'success',
        data: {
          query: request.query,
          answer: response.answer,
          sources: request.includeSources ? response.sources : response.sources.map(s => ({
            title: s.title,
            relevance: s.relevance,
            id: s.id
          })),
          confidence: response.confidence,
          nDCG: response.nDCG,
          responseTime: response.responseTime,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        `Error processing query: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('legal/query')
  async queryLegal(@Body() request: RAGQueryRequest): Promise<any> {
    try {
      const response = await this.ragService.queryLegal(request.query);
      
      return {
        status: 'success',
        data: response,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        `Error querying legal documents: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('manufacturing/query')
  async queryManufacturing(@Body() request: RAGQueryRequest): Promise<any> {
    try {
      const response = await this.ragService.queryManufacturing(request.query);
      
      return {
        status: 'success',
        data: response,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        `Error querying manufacturing documents: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('sources')
  async getSources(): Promise<any> {
    try {
      const sources = await this.ragService.getSources();
      
      return {
        status: 'success',
        data: sources,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        `Error retrieving sources: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('legal/document')
  async addLegalDocument(@Body() request: LegalDocumentRequest): Promise<any> {
    try {
      const document = await this.ragService.addLegalDocument(request);
      
      return {
        status: 'success',
        data: document,
        message: 'Legal document added successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        `Error adding legal document: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('manufacturing/document')
  async addManufacturingDocument(@Body() request: ManufacturingDocumentRequest): Promise<any> {
    try {
      const document = await this.ragService.addManufacturingDocument(request);
      
      return {
        status: 'success',
        data: document,
        message: 'Manufacturing document added successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        `Error adding manufacturing document: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('performance')
  async getPerformanceMetrics(): Promise<any> {
    try {
      const metrics = await this.ragService.getPerformanceMetrics();
      
      return {
        status: 'success',
        data: metrics,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        `Error retrieving performance metrics: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('stats')
  async getRAGStats(): Promise<any> {
    try {
      const sources = await this.ragService.getSources();
      
      return {
        status: 'success',
        data: {
          documents: sources.totalDocuments,
          legalDocuments: sources.legal.length,
          manufacturingDocuments: sources.manufacturing.length,
          lastUpdated: sources.lastUpdated,
          message: 'RAG service is running with enhanced domain-specific capabilities'
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        `Error retrieving RAG stats: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('evaluate')
  async runEvaluation(): Promise<any> {
    try {
      const evaluation = await this.ragService.runGoldenSetEvaluation();
      
      return {
        status: 'success',
        data: {
          evaluation,
          targetMet: evaluation.averageNDCG >= 0.65,
          message: evaluation.averageNDCG >= 0.65 
            ? '✅ Golden set evaluation target MET (≥0.65 nDCG)'
            : `⚠️  Target NOT MET. Current: ${evaluation.averageNDCG.toFixed(3)}, Target: 0.65`
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        `Error running evaluation: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('evaluate/history')
  async getEvaluationHistory(): Promise<any> {
    try {
      const history = await this.ragService.getEvaluationHistory();
      
      return {
        status: 'success',
        data: {
          history,
          totalEvaluations: history.length,
          latestEvaluation: history.length > 0 ? history[history.length - 1] : null
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        `Error getting evaluation history: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('evaluate/latest')
  async getLatestEvaluation(): Promise<any> {
    try {
      const evaluation = await this.ragService.getLatestEvaluation();
      
      return {
        status: 'success',
        data: {
          evaluation,
          hasEvaluations: evaluation !== null
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        `Error getting latest evaluation: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 