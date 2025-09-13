import { NextRequest, NextResponse } from 'next/server'
import { featureFlags } from '../../../../lib/feature-flags'

export const dynamic = 'force-dynamic'

interface ConsensusProposal {
  id: string
  prompt: string
  rationale: string
  synthiantId: string
  state: 'pending' | 'approved' | 'vetoed'
  synthiantVotes: { [synthiantId: string]: 'approve' | 'veto' }
  humanVotes: { [userId: string]: 'approve' | 'veto' }
  synthiantConsensus: boolean
  humanConsensus: boolean
  createdAt: string
  updatedAt: string
  evidence: string[]
  trainingSignal: {
    dataset: string
    expectedOutcome: string
    confidence: number
  }
}

interface ConsensusHistoryItem {
  id: string
  proposalId: string
  prompt: string
  state: 'pending' | 'approved' | 'vetoed'
  synthiantVotes: { [synthiantId: string]: 'approve' | 'veto' }
  humanVotes: { [userId: string]: 'approve' | 'veto' }
  synthiantConsensus: boolean
  humanConsensus: boolean
  createdAt: string
  resolvedAt?: string
  resolutionTime?: number
  evidence: string[]
  trainingSignal: {
    dataset: string
    expectedOutcome: string
    confidence: number
  }
}

interface HistoryResponse {
  history: ConsensusHistoryItem[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
  summary: {
    total: number
    pending: number
    approved: number
    vetoed: number
    avgResolutionTime: number
    successRate: number
  }
}

// In-memory storage for proposals (shared with other consensus routes)
// In production, this would be a database
declare global {
  var consensusProposals: Map<string, ConsensusProposal>
}

if (!global.consensusProposals) {
  global.consensusProposals = new Map()
}

const proposals = global.consensusProposals

// Check if consensus is enabled
function checkConsensusEnabled(): boolean {
  return featureFlags.isEnabled('CONSENSUS_ENABLED')
}

// Calculate resolution time in minutes
function calculateResolutionTime(createdAt: string, resolvedAt?: string): number | undefined {
  if (!resolvedAt) return undefined
  const created = new Date(createdAt).getTime()
  const resolved = new Date(resolvedAt).getTime()
  return Math.round((resolved - created) / (1000 * 60)) // Convert to minutes
}

// Calculate success rate
function calculateSuccessRate(history: ConsensusHistoryItem[]): number {
  if (history.length === 0) return 0
  const approved = history.filter(item => item.state === 'approved').length
  return Math.round((approved / history.length) * 100)
}

// Calculate average resolution time
function calculateAvgResolutionTime(history: ConsensusHistoryItem[]): number {
  const resolvedItems = history.filter(item => item.resolutionTime !== undefined)
  if (resolvedItems.length === 0) return 0
  
  const totalTime = resolvedItems.reduce((sum, item) => sum + (item.resolutionTime || 0), 0)
  return Math.round(totalTime / resolvedItems.length)
}

export async function GET(request: NextRequest) {
  if (!checkConsensusEnabled()) {
    return NextResponse.json(
      { error: 'Consensus system is disabled' },
      { status: 503 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const state = searchParams.get('state')
    const synthiantId = searchParams.get('synthiantId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let filteredProposals = Array.from(proposals.values())

    // Filter by state if specified
    if (state && ['pending', 'approved', 'vetoed'].includes(state)) {
      filteredProposals = filteredProposals.filter(p => p.state === state)
    }

    // Filter by synthiant if specified
    if (synthiantId) {
      filteredProposals = filteredProposals.filter(p => 
        p.synthiantId === synthiantId || 
        Object.keys(p.synthiantVotes).includes(synthiantId)
      )
    }

    // Filter by date range if specified
    if (startDate) {
      const start = new Date(startDate)
      filteredProposals = filteredProposals.filter(p => new Date(p.createdAt) >= start)
    }
    if (endDate) {
      const end = new Date(endDate)
      filteredProposals = filteredProposals.filter(p => new Date(p.createdAt) <= end)
    }

    // Sort by creation date (newest first)
    filteredProposals.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    // Calculate resolution times for resolved proposals
    const historyWithResolution = filteredProposals.map(proposal => {
      const resolutionTime = calculateResolutionTime(proposal.createdAt, proposal.updatedAt)
      return {
        ...proposal,
        proposalId: proposal.id, // Add the missing proposalId field
        resolvedAt: proposal.state !== 'pending' ? proposal.updatedAt : undefined,
        resolutionTime
      }
    })

    // Apply pagination
    const paginatedHistory = historyWithResolution.slice(offset, offset + limit)

    // Calculate summary statistics
    const summary = {
      total: filteredProposals.length,
      pending: filteredProposals.filter(p => p.state === 'pending').length,
      approved: filteredProposals.filter(p => p.state === 'approved').length,
      vetoed: filteredProposals.filter(p => p.state === 'vetoed').length,
      avgResolutionTime: calculateAvgResolutionTime(historyWithResolution),
      successRate: calculateSuccessRate(historyWithResolution)
    }

    const response: HistoryResponse = {
      history: paginatedHistory,
      pagination: {
        total: filteredProposals.length,
        limit,
        offset,
        hasMore: offset + limit < filteredProposals.length
      },
      summary
    }

    return NextResponse.json(response, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Total-Count': filteredProposals.length.toString(),
        'X-Success-Rate': summary.successRate.toString(),
        'X-Avg-Resolution-Time': summary.avgResolutionTime.toString()
      }
    })
  } catch (error) {
    console.error('Error fetching consensus history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch consensus history' },
      { status: 500 }
    )
  }
}
