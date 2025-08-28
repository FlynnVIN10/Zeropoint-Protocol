import { NextRequest, NextResponse } from 'next/server'

interface Vote {
  id: string
  proposal_id: string
  voter_id: string
  voter_type: 'synthiant' | 'human'
  vote: 'approve' | 'veto'
  reason?: string
  timestamp: string
}

// In-memory storage for votes (in production, this would be a database)
let votes: Vote[] = []
let voteCounter = 1

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { proposal_id, voter_id, voter_type, vote, reason } = body

    if (!proposal_id || !voter_id || !voter_type || !vote) {
      return NextResponse.json(
        { error: 'Missing required fields: proposal_id, voter_id, voter_type, vote' },
        { status: 400 }
      )
    }

    if (!['synthiant', 'human'].includes(voter_type)) {
      return NextResponse.json(
        { error: 'Invalid voter_type. Must be "synthiant" or "human"' },
        { status: 400 }
      )
    }

    if (!['approve', 'veto'].includes(vote)) {
      return NextResponse.json(
        { error: 'Invalid vote. Must be "approve" or "veto"' },
        { status: 400 }
      )
    }

    // Create vote record
    const voteRecord: Vote = {
      id: `v-${voteCounter++}`,
      proposal_id,
      voter_id,
      voter_type,
      vote,
      reason,
      timestamp: new Date().toISOString()
    }

    votes.push(voteRecord)

    // Update proposal state based on vote
    // This would typically involve database transactions in production
    const proposal = await fetch(`${request.nextUrl.origin}/api/consensus/proposals`).then(r => r.json())
    const targetProposal = proposal.find((p: any) => p.id === proposal_id)
    
    if (!targetProposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      )
    }

    // Update proposal state logic
    let newState = targetProposal.state
    if (voter_type === 'synthiant') {
      if (vote === 'approve') {
        newState = 'synthiant_approved'
      } else {
        newState = 'synthiant_vetoed'
      }
    } else if (voter_type === 'human') {
      if (vote === 'approve') {
        newState = 'human_approved'
      } else {
        newState = 'human_vetoed'
      }
    }

    // In production, this would update the database
    // For now, we'll return the vote record and suggested state change

    return NextResponse.json({
      success: true,
      vote_id: voteRecord.id,
      proposal_id,
      new_state: newState,
      message: `${voter_type} ${vote} recorded successfully`
    }, {
      status: 201,
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
      { error: 'Failed to record vote' },
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
