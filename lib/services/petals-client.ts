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
    proposer: string
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
      
      // Store proposal in database with enhanced tracking
      await dbManager.query(
        `INSERT INTO consensus_proposals 
         (proposal_id, title, description, type, data, proposer, status, voting_start) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [result.proposalId, proposalData.title, proposalData.description, proposalData.type, 
         JSON.stringify(proposalData.data), proposalData.proposer, 'active']
      )

      // Log proposal creation
      await dbManager.query(
        `INSERT INTO consensus_history (proposal_id, action, actor, details) 
         VALUES ($1, $2, $3, $4)`,
        [result.proposalId, 'created', proposalData.proposer, JSON.stringify({ title: proposalData.title })]
      )

      return result
    } catch (error) {
      console.error('Petals API error:', error)
      throw error
    }
  }

  async voteOnProposal(proposalId: string, vote: { 
    voter: string; 
    choice: string; 
    weight: number 
  }): Promise<{ success: boolean }> {
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
        `INSERT INTO consensus_votes (proposal_id, voter, choice, weight) 
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (proposal_id, voter) 
         DO UPDATE SET choice = EXCLUDED.choice, weight = EXCLUDED.weight`,
        [proposalId, vote.voter, vote.choice, vote.weight]
      )

      // Update proposal vote counts
      await dbManager.query(
        `UPDATE consensus_proposals 
         SET votes_for = (SELECT COUNT(*) FROM consensus_votes WHERE proposal_id = $1 AND choice = 'for'),
             votes_against = (SELECT COUNT(*) FROM consensus_votes WHERE proposal_id = $1 AND choice = 'against'),
             votes_abstain = (SELECT COUNT(*) FROM consensus_votes WHERE proposal_id = $1 AND choice = 'abstain')
         WHERE proposal_id = $1`,
        [proposalId]
      )

      // Log vote
      await dbManager.query(
        `INSERT INTO consensus_history (proposal_id, action, actor, details) 
         VALUES ($1, $2, $3, $4)`,
        [proposalId, 'voted', vote.voter, JSON.stringify({ choice: vote.choice, weight: vote.weight })]
      )

      return result
    } catch (error) {
      console.error('Petals API error:', error)
      throw error
    }
  }

  async getProposalStatus(proposalId: string): Promise<{ status: string; votes: any[]; tally: any }> {
    try {
      // Get proposal details
      const proposalResult = await dbManager.query(
        'SELECT * FROM consensus_proposals WHERE proposal_id = $1',
        [proposalId]
      )

      if (proposalResult.rows.length === 0) {
        throw new Error('Proposal not found')
      }

      const proposal = proposalResult.rows[0]

      // Get votes
      const votesResult = await dbManager.query(
        'SELECT * FROM consensus_votes WHERE proposal_id = $1 ORDER BY created_at DESC',
        [proposalId]
      )

      // Get history
      const historyResult = await dbManager.query(
        'SELECT * FROM consensus_history WHERE proposal_id = $1 ORDER BY created_at DESC',
        [proposalId]
      )

      return {
        status: proposal.status,
        votes: votesResult.rows,
        tally: {
          for: proposal.votes_for,
          against: proposal.votes_against,
          abstain: proposal.votes_abstain,
          total: proposal.votes_for + proposal.votes_against + proposal.votes_abstain
        },
        history: historyResult.rows
      }
    } catch (error) {
      console.error('Database error:', error)
      throw error
    }
  }

  async getProposalHistory(limit: number = 100): Promise<any[]> {
    try {
      const result = await dbManager.query(
        `SELECT p.*, 
                (SELECT COUNT(*) FROM consensus_votes WHERE proposal_id = p.proposal_id) as vote_count
         FROM consensus_proposals p 
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

export const petalsClient = new PetalsClient()
