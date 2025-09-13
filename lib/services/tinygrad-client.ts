import { dbManager } from '../db/config'

export class TinygradClient {
  private baseUrl: string
  private apiKey: string

  constructor() {
    this.baseUrl = process.env.TINYGRAD_API_URL || 'http://localhost:8000'
    this.apiKey = process.env.TINYGRAD_API_KEY || ''
  }

  async startTrainingJob(jobData: {
    modelName: string
    datasetPath: string
    hyperparameters: Record<string, any>
  }): Promise<{ jobId: string; status: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/training/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(jobData)
      })

      if (!response.ok) {
        throw new Error(`Tinygrad API error: ${response.status}`)
      }

      const result = await response.json()
      
      // Store job in database with enhanced tracking
      await dbManager.query(
        `INSERT INTO training_jobs (job_id, model_name, dataset_path, hyperparameters, status, started_at) 
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [result.jobId, jobData.modelName, jobData.datasetPath, JSON.stringify(jobData.hyperparameters), 'started']
      )

      return result
    } catch (error) {
      console.error('Tinygrad API error:', error)
      throw error
    }
  }

  async getJobStatus(jobId: string): Promise<{ status: string; progress: number; metrics?: any }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/training/status/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      if (!response.ok) {
        throw new Error(`Tinygrad API error: ${response.status}`)
      }

      const result = await response.json()
      
      // Update database with progress and metrics
      await dbManager.query(
        `UPDATE training_jobs 
         SET status = $1, progress_percentage = $2, metrics = $3, updated_at = NOW() 
         WHERE job_id = $4`,
        [result.status, result.progress || 0, JSON.stringify(result.metrics || {}), jobId]
      )

      // Store individual metrics
      if (result.metrics) {
        for (const [metricName, metricValue] of Object.entries(result.metrics)) {
          await dbManager.query(
            'INSERT INTO training_metrics (job_id, metric_name, metric_value) VALUES ($1, $2, $3)',
            [jobId, metricName, metricValue]
          )
        }
      }

      return result
    } catch (error) {
      console.error('Tinygrad API error:', error)
      throw error
    }
  }

  async getJobLogs(jobId: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/training/logs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      if (!response.ok) {
        throw new Error(`Tinygrad API error: ${response.status}`)
      }

      const logs = await response.json()
      
      // Store logs in database
      await dbManager.query(
        'UPDATE training_jobs SET logs = $1 WHERE job_id = $2',
        [logs, jobId]
      )

      return logs
    } catch (error) {
      console.error('Tinygrad API error:', error)
      throw error
    }
  }

  async getJobHistory(limit: number = 100): Promise<any[]> {
    try {
      const result = await dbManager.query(
        `SELECT * FROM training_jobs 
         ORDER BY created_at DESC 
         LIMIT $1`,
        [limit]
      )
      return result.rows
    } catch (error) {
      console.error('Database error:', error)
      throw error
    }
  }
}

export const tinygradClient = new TinygradClient()
