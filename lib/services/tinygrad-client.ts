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
      
      // Store job in database
      await dbManager.query(
        'INSERT INTO training_jobs (job_id, model_name, dataset_path, hyperparameters, status) VALUES ($1, $2, $3, $4, $5)',
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
      
      // Update database
      await dbManager.query(
        'UPDATE training_jobs SET status = $1, updated_at = NOW(), metrics = $2 WHERE job_id = $3',
        [result.status, JSON.stringify(result.metrics || {}), jobId]
      )

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

      return await response.json()
    } catch (error) {
      console.error('Tinygrad API error:', error)
      throw error
    }
  }
}

export const tinygradClient = new TinygradClient()
