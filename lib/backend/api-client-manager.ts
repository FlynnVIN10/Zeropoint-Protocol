import { dbConnectionManager } from './database-connection-manager'

export class BackendAPIClientManager {
  private static instance: BackendAPIClientManager
  private clients: Map<string, any> = new Map()

  private constructor() {}

  static getInstance(): BackendAPIClientManager {
    if (!BackendAPIClientManager.instance) {
      BackendAPIClientManager.instance = new BackendAPIClientManager()
    }
    return BackendAPIClientManager.instance
  }

  async getClient(service: string): Promise<any> {
    if (!this.clients.has(service)) {
      const client = await this.createClient(service)
      this.clients.set(service, client)
    }
    
    return this.clients.get(service)!
  }

  private async createClient(service: string): Promise<any> {
    const config = this.getServiceConfig(service)
    
    return {
      service,
      baseUrl: config.backendUrl,
      apiKey: config.apiKey,
      database: await dbConnectionManager.getConnection(service),
      
      async request(endpoint: string, options: RequestInit = {}) {
        const url = `${config.backendUrl}${endpoint}`
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
          ...options.headers
        }
        
        try {
          const response = await fetch(url, { ...options, headers })
          
          if (!response.ok) {
            throw new Error(`${service} API error: ${response.status} ${response.statusText}`)
          }
          
          return await response.json()
        } catch (error) {
          console.error(`${service} API request failed:`, error)
          throw error
        }
      },
      
      async healthCheck(): Promise<boolean> {
        try {
          await this.request('/health')
          return true
        } catch (error) {
          return false
        }
      }
    }
  }

  private getServiceConfig(service: string) {
    const configs = {
      tinygrad: {
        backendUrl: process.env.TINYGRAD_BACKEND_URL!,
        apiKey: process.env.TINYGRAD_API_KEY!
      },
      petals: {
        backendUrl: process.env.PETALS_BACKEND_URL!,
        apiKey: process.env.PETALS_API_KEY!
      },
      wondercraft: {
        backendUrl: process.env.WONDERCRAFT_BACKEND_URL!,
        apiKey: process.env.WONDERCRAFT_API_KEY!
      },
      ml_pipeline: {
        backendUrl: process.env.ML_PIPELINE_BACKEND_URL!,
        apiKey: process.env.ML_PIPELINE_API_KEY!
      },
      quantum: {
        backendUrl: process.env.QUANTUM_BACKEND_URL!,
        apiKey: process.env.QUANTUM_API_KEY!
      }
    }
    
    return configs[service as keyof typeof configs] || configs.tinygrad
  }

  async testAllConnections(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {}
    
    for (const service of Object.keys(BACKEND_INTEGRATIONS)) {
      try {
        const client = await this.getClient(service)
        results[service] = await client.healthCheck()
      } catch (error) {
        results[service] = false
      }
    }
    
    return results
  }
}

export const apiClientManager = BackendAPIClientManager.getInstance()
