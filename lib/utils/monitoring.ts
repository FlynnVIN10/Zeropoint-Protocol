import { dbManager } from '../db/config'

export class MonitoringUtils {
  static async logPerformance(operation: string, duration: number, context: string = 'api'): Promise<void> {
    try {
      await dbManager.query(
        `INSERT INTO performance_metrics (operation, duration_ms, context, recorded_at) 
         VALUES ($1, $2, $3, NOW())`,
        [operation, duration, context]
      )
    } catch (error) {
      console.error('Failed to log performance metric:', error)
    }
  }

  static async logError(error: Error, context: string, requestId: string): Promise<void> {
    try {
      await dbManager.query(
        `INSERT INTO error_logs (error_message, error_stack, context, request_id, recorded_at) 
         VALUES ($1, $2, $3, $4, NOW())`,
        [error.message, error.stack, context, requestId]
      )
    } catch (dbError) {
      console.error('Failed to log error:', dbError)
    }
  }

  static async logRequest(method: string, path: string, statusCode: number, duration: number): Promise<void> {
    try {
      await dbManager.query(
        `INSERT INTO request_logs (method, path, status_code, duration_ms, recorded_at) 
         VALUES ($1, $2, $3, $4, NOW())`,
        [method, path, statusCode, duration]
      )
    } catch (error) {
      console.error('Failed to log request:', error)
    }
  }

  static async getSystemHealth(): Promise<any> {
    try {
      const dbHealth = await this.checkDatabaseHealth()
      const serviceHealth = await this.checkServiceHealth()
      
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: dbHealth,
        services: serviceHealth
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      }
    }
  }

  private static async checkDatabaseHealth(): Promise<any> {
    try {
      const result = await dbManager.query('SELECT 1 as health_check')
      return { status: 'healthy', response_time: Date.now() }
    } catch (error) {
      return { status: 'unhealthy', error: error.message }
    }
  }

  private static async checkServiceHealth(): Promise<any> {
    // Check external service health
    const services = ['tinygrad', 'petals', 'wondercraft']
    const health = {}
    
    for (const service of services) {
      try {
        const response = await fetch(`${process.env[`${service.toUpperCase()}_API_URL`]}/health`, {
          timeout: 5000
        })
        health[service] = { status: response.ok ? 'healthy' : 'unhealthy' }
      } catch (error) {
        health[service] = { status: 'unhealthy', error: error.message }
      }
    }
    
    return health
  }
}