import { NextRequest, NextResponse } from 'next/server'
import { featureFlags } from '../../../../lib/feature-flags'

export const dynamic = 'force-dynamic'

interface VoteRequest {
  proposalId: string
  voterId: string
  vote: 'approve' | 'veto'
  rationale: string
  voterType: 'synthiant' | 'human'
}

interface VoteResponse {
  success: boolean
  proposalId: string
  vote: 'approve' | 'veto'
  voterId: string
  voterType: 'synthiant' | 'human'
  rationale: string
  timestamp: string
  consensusReached: boolean
  nextAction?: string
}

// In-memory storage for proposals (shared with proposals route)
// In production, this would be a database
declare global {
  var consensusProposals: Map<string, any>
}

if (!global.consensusProposals) {
  global.consensusProposals = new Map()
}

const proposals = global.consensusProposals

// Check if consensus is enabled
function checkConsensusEnabled(): boolean {
  return featureFlags.isEnabled('CONSENSUS_ENABLED')
}

// Calculate consensus based on votes
function calculateConsensus(proposal: any, voterType: 'synthiant' | 'human'): boolean {
  const votes = voterType === 'synthiant' ? proposal.synthiantVotes : proposal.humanVotes
  const totalVotes = Object.keys(votes).length
  
  if (totalVotes === 0) return false
  
  const approveVotes = Object.values(votes).filter(vote => vote === 'approve').length
  const vetoVotes = Object.values(votes).filter(vote => vote === 'veto').length
  
  // Consensus requires 2/3 majority for approval, or any veto for rejection
  if (vetoVotes > 0) return false
  return approveVotes >= Math.ceil(totalVotes * 0.67)
}

// Update proposal state based on consensus
function updateProposalState(proposal: any): string | undefined {
  if (proposal.synthiantConsensus && proposal.humanConsensus) {
    proposal.state = 'approved'
    return 'Proposal approved by both synthiant and human consensus'
  } else if (proposal.synthiantConsensus && !proposal.humanConsensus) {
    proposal.state = 'pending'
    return 'Waiting for human consensus'
  } else if (!proposal.synthiantConsensus) {
    proposal.state = 'vetoed'
    return 'Proposal vetoed by synthiant consensus'
  }
  return undefined
}

export async function POST(request: NextRequest) {
  if (!checkConsensusEnabled()) {
    return NextResponse.json(
      { error: 'Consensus system is disabled' },
      { status: 503 }
    )
  }

  try {
    const { proposalId, voterId, vote, rationale, voterType }: VoteRequest = await request.json()

    // Validate required fields
    if (!proposalId || !voterId || !vote || !rationale || !voterType) {
      return NextResponse.json(
        { error: 'Missing required fields: proposalId, voterId, vote, rationale, voterType' },
        { status: 400 }
      )
    }

    // Validate vote value
    if (!['approve', 'veto'].includes(vote)) {
      return NextResponse.json(
        { error: 'Invalid vote value. Must be "approve" or "veto"' },
        { status: 400 }
      )
    }

    // Validate voter type
    if (!['synthiant', 'human'].includes(voterType)) {
      return NextResponse.json(
        { error: 'Invalid voter type. Must be "synthiant" or "human"' },
        { status: 400 }
      )
    }

    // Get proposal
    const proposal = proposals.get(proposalId)
    if (!proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      )
    }

    // Check if proposal is still pending
    if (proposal.state !== 'pending') {
      return NextResponse.json(
        { error: 'Cannot vote on proposal that is not pending' },
        { status: 400 }
      )
    }

    // Check if voter has already voted
    const votes = voterType === 'synthiant' ? proposal.synthiantVotes : proposal.humanVotes
    if (votes[voterId]) {
      return NextResponse.json(
        { error: 'Voter has already voted on this proposal' },
        { status: 400 }
      )
    }

    // Record the vote
    votes[voterId] = vote
    proposal.updatedAt = new Date().toISOString()

    // Calculate consensus
    if (voterType === 'synthiant') {
      proposal.synthiantConsensus = calculateConsensus(proposal, 'synthiant')
    } else {
      proposal.humanConsensus = calculateConsensus(proposal, 'human')
    }

    // Update proposal state
    const nextAction = updateProposalState(proposal)

    // Save updated proposal
    proposals.set(proposalId, proposal)

    const response: VoteResponse = {
      success: true,
      proposalId,
      vote,
      voterId,
      voterType,
      rationale,
      timestamp: new Date().toISOString(),
      consensusReached: proposal.synthiantConsensus && proposal.humanConsensus,
      nextAction
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Proposal-State': proposal.state,
        'X-Consensus-Reached': response.consensusReached.toString()
      }
    })
  } catch (error) {
    console.error('Error processing vote:', error)
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const proposal_id = searchParams.get('proposal_id')
    
    let filteredVotes = votes
    
    if (proposal_id) {
      filteredVotes = votes.filter(v => v.proposal_id === proposal_id)
    }

    return NextResponse.json(filteredVotes, {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'content-disposition': 'inline',
        'access-control-allow-origin': '*'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch votes' },
      { status: 500 }
    )
  }
}
