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
    contributor: string
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
        `INSERT INTO contributions 
         (contribution_id, title, description, asset_type, content, metadata, contributor, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [result.contributionId, contributionData.title, contributionData.description, 
         contributionData.assetType, contributionData.content, JSON.stringify(contributionData.metadata),
         contributionData.contributor, 'pending']
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

      const result = await response.json()
      
      // Store diff in database
      await dbManager.query(
        `INSERT INTO contribution_diffs (asset_id, diff_content, changes) 
         VALUES ($1, $2, $3)`,
        [assetId, result.diff, JSON.stringify(result.changes)]
      )

      return result
    } catch (error) {
      console.error('Wondercraft API error:', error)
      throw error
    }
  }

  async getContributionStatus(contributionId: string): Promise<{ status: string; review: any; approved: boolean }> {
    try {
      const result = await dbManager.query(
        'SELECT * FROM contributions WHERE contribution_id = $1',
        [contributionId]
      )

      if (result.rows.length === 0) {
        throw new Error('Contribution not found')
      }

      const contribution = result.rows[0]

      return {
        status: contribution.status,
        review: {
          reviewer: contribution.reviewer,
          review_notes: contribution.review_notes,
          reviewed_at: contribution.reviewed_at
        },
        approved: contribution.status === 'approved'
      }
    } catch (error) {
      console.error('Database error:', error)
      throw error
    }
  }

  async getContributionHistory(limit: number = 100): Promise<any[]> {
    try {
      const result = await dbManager.query(
        `SELECT * FROM contributions 
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

export const wondercraftClient = new WondercraftClient()
