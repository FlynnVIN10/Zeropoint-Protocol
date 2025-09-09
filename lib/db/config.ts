// Database configuration for Zeropoint Protocol
// Supports PostgreSQL for production and SQLite for development

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  maxConnections: number;
}

export const dbConfig: DatabaseConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'zeropoint_iaai',
  username: process.env.DATABASE_USER || 'zeropoint_user',
  password: process.env.DATABASE_PASSWORD || '',
  ssl: process.env.NODE_ENV === 'production',
  maxConnections: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '10')
};

// Mock database for development/testing when PostgreSQL is not available
export class MockDatabase {
  private connected: boolean = false;
  private lastHealthCheck: Date = new Date();

  async connect(): Promise<void> {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 100));
    this.connected = true;
    this.lastHealthCheck = new Date();
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  async healthCheck(): Promise<{
    connected: boolean;
    lastHealthCheck: Date;
    tables: string[];
  }> {
    this.lastHealthCheck = new Date();

    // Simulate some database tables
    const tables = [
      'users',
      'sessions',
      'ai_models',
      'training_jobs'
    ];

    return {
      connected: this.connected,
      lastHealthCheck: this.lastHealthCheck,
      tables
    };
  }

  async query(table: string, conditions?: any): Promise<any[]> {
    // Mock query results for development
    const mockData: { [key: string]: any[] } = {
      ai_models: [
        { id: 1, name: 'tinygrad', version: '1.0.0', model_type: 'training', status: 'active' },
        { id: 2, name: 'petals', version: '1.0.0', model_type: 'proposal', status: 'active' },
        { id: 3, name: 'wondercraft', version: '1.0.0', model_type: 'asset', status: 'active' }
      ],
      training_jobs: [
        { id: 1, model_id: 1, status: 'completed', started_at: new Date().toISOString() }
      ]
    };

    return mockData[table] || [];
  }
}

// Database connection manager
export class DatabaseManager {
  private mockDb: MockDatabase;
  private isProduction: boolean;
  private pool: any | null;

  constructor() {
    this.mockDb = new MockDatabase();
    this.isProduction = process.env.NODE_ENV === 'production';
    this.pool = null;
  }

  async initialize(): Promise<void> {
    const useRealDb = !!process.env.DATABASE_URL && process.env.MOCKS_DISABLED === '1';
    if (useRealDb && !this.pool) {
      try {
        const { Pool } = await import('pg');
        this.pool = new Pool({ connectionString: process.env.DATABASE_URL });
        await this.pool.query('SELECT 1');
        return;
      } catch (err) {
        console.warn('PostgreSQL connect failed, falling back to mock DB:', err);
        this.pool = null;
      }
    }
    await this.mockDb.connect();
  }

  async healthCheck(): Promise<{
    databaseConnected: boolean;
    lastHealthCheck: Date;
    tables: string[];
    environment: string;
  }> {
    if (this.pool) {
      try {
        const res = await this.pool.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname NOT IN ('pg_catalog','information_schema')");
        const tables = res.rows.map((r: any) => r.tablename);
        return { databaseConnected: true, lastHealthCheck: new Date(), tables, environment: 'production' };
      } catch (e) {
        console.warn('DB health check failed, using mock:', e);
      }
    }
    const health = await this.mockDb.healthCheck();
    return {
      databaseConnected: health.connected,
      lastHealthCheck: health.lastHealthCheck,
      tables: health.tables,
      environment: this.isProduction ? 'production' : 'development'
    };
  }

  async query(table: string, conditions?: any): Promise<any[]> {
    if (this.pool) {
      // Simple dispatcher for proposals table; extend as needed
      if (table === 'proposals') {
        const res = await this.pool.query('SELECT id, title, description as body, status, timestamp FROM proposals ORDER BY timestamp DESC');
        return res.rows;
      }
      // Fallback to mock-style until other tables are implemented
      return this.mockDb.query(table, conditions);
    }
    return this.mockDb.query(table, conditions);
  }

  async insertProposal(data: { id: string; title: string; body: string; status: string; timestamp: string }): Promise<void> {
    if (this.pool) {
      await this.pool.query(
        'INSERT INTO proposals (id, title, description, status, timestamp) VALUES ($1,$2,$3,$4,$5)',
        [data.id, data.title, data.body, data.status, data.timestamp]
      );
      return;
    }
    // mock insert: no-op
  }
}

// Global database instance
export const dbManager = new DatabaseManager();
