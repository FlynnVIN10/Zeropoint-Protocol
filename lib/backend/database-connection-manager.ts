import { Pool } from 'pg'

export class DatabaseConnectionManager {
  private static instance: DatabaseConnectionManager
  private pools: Map<string, Pool> = new Map()

  private constructor() {}

  static getInstance(): DatabaseConnectionManager {
    if (!DatabaseConnectionManager.instance) {
      DatabaseConnectionManager.instance = new DatabaseConnectionManager()
    }
    return DatabaseConnectionManager.instance
  }

  async getConnection(service: string): Promise<Pool> {
    if (!this.pools.has(service)) {
      const config = this.getServiceConfig(service)
      const pool = new Pool({
        connectionString: config.databaseUrl,
        ssl: process.env.DATABASE_SSL === 'true',
        max: parseInt(process.env.DATABASE_POOL_SIZE || '10'),
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      })
      
      this.pools.set(service, pool)
    }
    
    return this.pools.get(service)!
  }

  private getServiceConfig(service: string) {
    const configs = {
      tinygrad: {
        databaseUrl: process.env.TINYGRAD_DATABASE_URL!,
        apiKey: process.env.TINYGRAD_API_KEY!,
        backendUrl: process.env.TINYGRAD_BACKEND_URL!
      },
      petals: {
        databaseUrl: process.env.PETALS_DATABASE_URL!,
        apiKey: process.env.PETALS_API_KEY!,
        backendUrl: process.env.PETALS_BACKEND_URL!
      },
      wondercraft: {
        databaseUrl: process.env.WONDERCRAFT_DATABASE_URL!,
        apiKey: process.env.WONDERCRAFT_API_KEY!,
        backendUrl: process.env.WONDERCRAFT_BACKEND_URL!
      },
      ml_pipeline: {
        databaseUrl: process.env.ML_PIPELINE_DATABASE_URL!,
        apiKey: process.env.ML_PIPELINE_API_KEY!,
        backendUrl: process.env.ML_PIPELINE_BACKEND_URL!
      },
      quantum: {
        databaseUrl: process.env.QUANTUM_DATABASE_URL!,
        apiKey: process.env.QUANTUM_API_KEY!,
        backendUrl: process.env.QUANTUM_BACKEND_URL!
      }
    }
    
    return configs[service as keyof typeof configs] || configs.tinygrad
  }

  async testConnection(service: string): Promise<boolean> {
    try {
      const pool = await this.getConnection(service)
      const client = await pool.connect()
      await client.query('SELECT 1')
      client.release()
      return true
    } catch (error) {
      console.error(`Database connection test failed for ${service}:`, error)
      return false
    }
  }

  async closeAllConnections(): Promise<void> {
    for (const [service, pool] of this.pools) {
      try {
        await pool.end()
        console.log(`Closed connection for ${service}`)
      } catch (error) {
        console.error(`Error closing connection for ${service}:`, error)
      }
    }
    this.pools.clear()
  }
}

export const dbConnectionManager = DatabaseConnectionManager.getInstance()
