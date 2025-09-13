import { dbManager } from '../db/config'

export class PetalsClient {
  private baseUrl: string
  private apiKey: string

  constructor() {
    this.baseUrl = process.env.PETALS_API_URL || 'http://localhost:8001'
    this.apiKey = process.env.PETALS_API_KEY || ''
  }

  async createProposal(proposalData: {
    title: string
    description: string
    type: string
    data: Record<string, any>
  }): Promise<{ proposalId: string; status: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/proposals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(proposalData)
      })

      if (!response.ok) {
        throw new Error(`Petals API error: ${response.status}`)
      }

      const result = await response.json()
      
      // Store proposal in database
      await dbManager.query(
        'INSERT INTO consensus_proposals (proposal_id, title, description, type, data, status) VALUES ($1, $2, $3, $4, $5, $6)',
        [result.proposalId, proposalData.title, proposalData.description, proposalData.type, JSON.stringify(proposalData.data), 'active']
      )

      return result
    } catch (error) {
      console.error('Petals API error:', error)
      throw error
    }
  }

  async voteOnProposal(proposalId: string, vote: { voter: string; choice: string; weight: number }): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/proposals/${proposalId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(vote)
      })

      if (!response.ok) {
        throw new Error(`Petals API error: ${response.status}`)
      }

      const result = await response.json()
      
      // Store vote in database
      await dbManager.query(
        'INSERT INTO consensus_votes (proposal_id, voter, choice, weight, created_at) VALUES ($1, $2, $3, $4, NOW())',
        [proposalId, vote.voter, vote.choice, vote.weight]
      )

      return result
    } catch (error) {
      console.error('Petals API error:', error)
      throw error
    }
  }

  async getProposalStatus(proposalId: string): Promise<{ status: string; votes: any[]; tally: any }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/proposals/${proposalId}/status`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      if (!response.ok) {
        throw new Error(`Petals API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Petals API error:', error)
      throw error
    }
  }
}

export const petalsClient = new PetalsClient()
