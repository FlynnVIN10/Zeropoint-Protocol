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

// In-memory storage for proposals (shared across consensus routes)
// In production, this would be a database
declare global {
  var consensusProposals: Map<string, ConsensusProposal>
}

if (!global.consensusProposals) {
  global.consensusProposals = new Map()
}

const proposals = global.consensusProposals

// Generate unique ID
function generateId(): string {
  return `proposal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Check if consensus is enabled
function checkConsensusEnabled(): boolean {
  return featureFlags.isEnabled('CONSENSUS_ENABLED')
}

export async function POST(request: NextRequest) {
  if (!checkConsensusEnabled()) {
    return NextResponse.json(
      { error: 'Consensus system is disabled' },
      { status: 503 }
    )
  }

  try {
    const { prompt, rationale, synthiantId, trainingSignal } = await request.json()

    if (!prompt || !rationale || !synthiantId) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt, rationale, synthiantId' },
        { status: 400 }
      )
    }

    // Zeroth principle check
    if (prompt.toLowerCase().includes('bypass') || 
        prompt.toLowerCase().includes('hack') ||
        prompt.toLowerCase().includes('exploit')) {
      return NextResponse.json(
        { error: 'Zeroth violation: Proposal violates ethical principles' },
        { status: 400 }
      )
    }

    const proposal: ConsensusProposal = {
      id: generateId(),
      prompt,
      rationale,
      synthiantId,
      state: 'pending',
      synthiantVotes: {},
      humanVotes: {},
      synthiantConsensus: false,
      humanConsensus: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      evidence: [],
      trainingSignal: trainingSignal || {
        dataset: 'default',
        expectedOutcome: 'improved reasoning',
        confidence: 0.7
      }
    }

    proposals.set(proposal.id, proposal)

    return NextResponse.json(proposal, {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Proposal-ID': proposal.id
      }
    })
  } catch (error) {
    console.error('Error creating proposal:', error)
    return NextResponse.json(
      { error: 'Failed to create proposal' },
      { status: 500 }
    )
  }
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
    const state = searchParams.get('state')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let filteredProposals = Array.from(proposals.values())

    // Filter by state if specified
    if (state && ['pending', 'approved', 'vetoed'].includes(state)) {
      filteredProposals = filteredProposals.filter(p => p.state === state)
    }

    // Sort by creation date (newest first)
    filteredProposals.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    // Apply pagination
    const paginatedProposals = filteredProposals.slice(offset, offset + limit)

    const response = {
      proposals: paginatedProposals,
      pagination: {
        total: filteredProposals.length,
        limit,
        offset,
        hasMore: offset + limit < filteredProposals.length
      },
      summary: {
        pending: filteredProposals.filter(p => p.state === 'pending').length,
        approved: filteredProposals.filter(p => p.state === 'approved').length,
        vetoed: filteredProposals.filter(p => p.state === 'vetoed').length
      }
    }

    return NextResponse.json(response, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Total-Count': filteredProposals.length.toString()
      }
    })
  } catch (error) {
    console.error('Error fetching proposals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch proposals' },
      { status: 500 }
    )
  }
}
