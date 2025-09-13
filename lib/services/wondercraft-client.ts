import { dbManager } from '../db/config'

export class WondercraftClient {
  private baseUrl: string
  private apiKey: string

  constructor() {
    this.baseUrl = process.env.WONDERCRAFT_API_URL || 'http://localhost:8002'
    this.apiKey = process.env.WONDERCRAFT_API_KEY || ''
  }

  async createContribution(contributionData: {
    title: string
    description: string
    assetType: string
    content: string
    metadata: Record<string, any>
  }): Promise<{ contributionId: string; status: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/contributions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(contributionData)
      })

      if (!response.ok) {
        throw new Error(`Wondercraft API error: ${response.status}`)
      }

      const result = await response.json()
      
      // Store contribution in database
      await dbManager.query(
        'INSERT INTO contributions (contribution_id, title, description, asset_type, content, metadata, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [result.contributionId, contributionData.title, contributionData.description, contributionData.assetType, contributionData.content, JSON.stringify(contributionData.metadata), 'pending']
      )

      return result
    } catch (error) {
      console.error('Wondercraft API error:', error)
      throw error
    }
  }

  async generateDiff(assetId: string, newContent: string): Promise<{ diff: string; changes: any[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/assets/${assetId}/diff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({ content: newContent })
      })

      if (!response.ok) {
        throw new Error(`Wondercraft API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Wondercraft API error:', error)
      throw error
    }
  }

  async getContributionStatus(contributionId: string): Promise<{ status: string; review: any; approved: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/contributions/${contributionId}/status`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      if (!response.ok) {
        throw new Error(`Wondercraft API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Wondercraft API error:', error)
      throw error
    }
  }
}

export const wondercraftClient = new WondercraftClient()
