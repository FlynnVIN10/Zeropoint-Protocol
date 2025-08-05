import { Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import OpenAI from 'openai';

interface RAGSource {
  id: string;
  title: string;
  content: string;
  relevance: number;
  source: string;
  metadata?: any;
}

interface RAGContext {
  sources: RAGSource[];
  query: string;
  embedding: number[];
  timestamp: number;
}

@Injectable()
export class RAGService {
  private readonly logger = new Logger(RAGService.name);
  private openai: OpenAI;
  private dbPool: Pool;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.dbPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'zeropoint',
      password: process.env.DB_PASS || 'zeropointpass',
      database: process.env.DB_NAME || 'zeropointdb',
    });

    this.initializeTables();
  }

  private async initializeTables(): Promise<void> {
    try {
      // Enable pgvector extension
      await this.dbPool.query('CREATE EXTENSION IF NOT EXISTS vector;');

      // Create legal_docs table with vector support
      await this.dbPool.query(`
        CREATE TABLE IF NOT EXISTS legal_docs (
          id SERIAL PRIMARY KEY,
          title VARCHAR(500) NOT NULL,
          content TEXT NOT NULL,
          embedding vector(1536),
          source VARCHAR(200),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create manufacturing_data table with vector support
      await this.dbPool.query(`
        CREATE TABLE IF NOT EXISTS manufacturing_data (
          id SERIAL PRIMARY KEY,
          title VARCHAR(500) NOT NULL,
          content TEXT NOT NULL,
          embedding vector(1536),
          category VARCHAR(100),
          source VARCHAR(200),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create indexes for vector similarity search
      await this.dbPool.query(`
        CREATE INDEX IF NOT EXISTS legal_docs_embedding_idx ON legal_docs USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
      `);

      await this.dbPool.query(`
        CREATE INDEX IF NOT EXISTS manufacturing_data_embedding_idx ON manufacturing_data USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
      `);

      this.logger.log('RAG tables and indexes initialized successfully');
    } catch (error) {
      this.logger.error(`Failed to initialize RAG tables: ${error.message}`);
    }
  }

  async retrieveContext(query: string, topK: number = 5): Promise<RAGContext> {
    const startTime = Date.now();
    this.logger.log(`Retrieving context for query: ${query}`);

    try {
      // Generate embedding for the query
      const embedding = await this.generateEmbedding(query);

      // Search both legal_docs and manufacturing_data tables
      const [legalResults, manufacturingResults] = await Promise.all([
        this.searchLegalDocs(embedding, topK),
        this.searchManufacturingData(embedding, topK),
      ]);

      // Combine and rank results
      const allSources = [...legalResults, ...manufacturingResults];
      const rankedSources = this.rankSources(allSources, query);

      const context: RAGContext = {
        sources: rankedSources.slice(0, topK),
        query,
        embedding,
        timestamp: Date.now(),
      };

      const latency = Date.now() - startTime;
      this.logger.log(`RAG context retrieved in ${latency}ms with ${context.sources.length} sources`);

      return context;

    } catch (error) {
      this.logger.error(`Failed to retrieve RAG context: ${error.message}`);
      return {
        sources: [],
        query,
        embedding: [],
        timestamp: Date.now(),
      };
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float',
      });

      return response.data[0].embedding;
    } catch (error) {
      this.logger.error(`Failed to generate embedding: ${error.message}`);
      throw error;
    }
  }

  private async searchLegalDocs(embedding: number[], topK: number): Promise<RAGSource[]> {
    try {
      const query = `
        SELECT 
          id,
          title,
          content,
          source,
          created_at,
          1 - (embedding <=> $1) as similarity
        FROM legal_docs 
        WHERE embedding IS NOT NULL
        ORDER BY embedding <=> $1
        LIMIT $2;
      `;

      const result = await this.dbPool.query(query, [embedding, topK]);
      
      return result.rows.map(row => ({
        id: row.id.toString(),
        title: row.title,
        content: row.content,
        relevance: row.similarity,
        source: row.source,
        metadata: {
          createdAt: row.created_at,
          table: 'legal_docs',
        },
      }));
    } catch (error) {
      this.logger.error(`Failed to search legal docs: ${error.message}`);
      return [];
    }
  }

  private async searchManufacturingData(embedding: number[], topK: number): Promise<RAGSource[]> {
    try {
      const query = `
        SELECT 
          id,
          title,
          content,
          category,
          source,
          created_at,
          1 - (embedding <=> $1) as similarity
        FROM manufacturing_data 
        WHERE embedding IS NOT NULL
        ORDER BY embedding <=> $1
        LIMIT $2;
      `;

      const result = await this.dbPool.query(query, [embedding, topK]);
      
      return result.rows.map(row => ({
        id: row.id.toString(),
        title: row.title,
        content: row.content,
        relevance: row.similarity,
        source: row.source,
        metadata: {
          category: row.category,
          createdAt: row.created_at,
          table: 'manufacturing_data',
        },
      }));
    } catch (error) {
      this.logger.error(`Failed to search manufacturing data: ${error.message}`);
      return [];
    }
  }

  private rankSources(sources: RAGSource[], query: string): RAGSource[] {
    // Sort by relevance score (higher is better)
    return sources.sort((a, b) => b.relevance - a.relevance);
  }

  async addLegalDocument(title: string, content: string, source: string): Promise<void> {
    try {
      const embedding = await this.generateEmbedding(`${title} ${content}`);
      
      const query = `
        INSERT INTO legal_docs (title, content, embedding, source)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (title) DO UPDATE SET
          content = EXCLUDED.content,
          embedding = EXCLUDED.embedding,
          source = EXCLUDED.source,
          updated_at = CURRENT_TIMESTAMP;
      `;

      await this.dbPool.query(query, [title, content, embedding, source]);
      this.logger.log(`Added legal document: ${title}`);
    } catch (error) {
      this.logger.error(`Failed to add legal document: ${error.message}`);
      throw error;
    }
  }

  async addManufacturingData(title: string, content: string, category: string, source: string): Promise<void> {
    try {
      const embedding = await this.generateEmbedding(`${title} ${content}`);
      
      const query = `
        INSERT INTO manufacturing_data (title, content, embedding, category, source)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (title) DO UPDATE SET
          content = EXCLUDED.content,
          embedding = EXCLUDED.embedding,
          category = EXCLUDED.category,
          source = EXCLUDED.source,
          updated_at = CURRENT_TIMESTAMP;
      `;

      await this.dbPool.query(query, [title, content, embedding, category, source]);
      this.logger.log(`Added manufacturing data: ${title}`);
    } catch (error) {
      this.logger.error(`Failed to add manufacturing data: ${error.message}`);
      throw error;
    }
  }

  async getRAGStats(): Promise<any> {
    try {
      const [legalCount, manufacturingCount] = await Promise.all([
        this.dbPool.query('SELECT COUNT(*) as count FROM legal_docs'),
        this.dbPool.query('SELECT COUNT(*) as count FROM manufacturing_data'),
      ]);

      return {
        legalDocuments: parseInt(legalCount.rows[0].count),
        manufacturingData: parseInt(manufacturingCount.rows[0].count),
        totalDocuments: parseInt(legalCount.rows[0].count) + parseInt(manufacturingCount.rows[0].count),
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to get RAG stats: ${error.message}`);
      return {
        legalDocuments: 0,
        manufacturingData: 0,
        totalDocuments: 0,
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  async seedSampleData(): Promise<void> {
    try {
      // Sample legal documents
      const legalDocs = [
        {
          title: 'Zeropoint Protocol Safety Guidelines',
          content: 'The Zeropoint Protocol implements comprehensive safety guidelines for AI systems, including ethical consensus mechanisms, federated learning protocols, and continuous monitoring requirements.',
          source: 'internal-policy',
        },
        {
          title: 'AI Ethics Framework',
          content: 'Our AI ethics framework ensures that all artificial intelligence systems remain aligned with human values through multi-layered validation processes and transparent decision-making.',
          source: 'ethics-committee',
        },
        {
          title: 'Consensus Mechanism Documentation',
          content: 'The consensus mechanism uses both sentient AI agents and human oversight to ensure decisions are made ethically and safely, with full transparency at every step.',
          source: 'technical-specs',
        },
      ];

      // Sample manufacturing data
      const manufacturingData = [
        {
          title: 'Production Line Optimization',
          content: 'Advanced manufacturing processes leverage AI-driven optimization to improve efficiency, reduce waste, and maintain quality standards across production lines.',
          category: 'optimization',
          source: 'manufacturing-ai',
        },
        {
          title: 'Quality Control Protocols',
          content: 'AI-powered quality control systems monitor production in real-time, detecting anomalies and ensuring consistent product quality through automated inspection.',
          category: 'quality-control',
          source: 'quality-systems',
        },
        {
          title: 'Supply Chain Management',
          content: 'Intelligent supply chain management uses predictive analytics to optimize inventory levels, reduce lead times, and improve overall operational efficiency.',
          category: 'supply-chain',
          source: 'logistics-ai',
        },
      ];

      // Add legal documents
      for (const doc of legalDocs) {
        await this.addLegalDocument(doc.title, doc.content, doc.source);
      }

      // Add manufacturing data
      for (const data of manufacturingData) {
        await this.addManufacturingData(data.title, data.content, data.category, data.source);
      }

      this.logger.log('Sample RAG data seeded successfully');
    } catch (error) {
      this.logger.error(`Failed to seed sample data: ${error.message}`);
    }
  }
} 