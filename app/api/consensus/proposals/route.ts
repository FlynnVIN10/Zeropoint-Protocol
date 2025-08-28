import { NextRequest, NextResponse } from 'next/server'

interface Proposal {
  id: string
  prompt: string
  synthiant_id: string
  created_at: string
  state: 'pending' | 'synthiant_approved' | 'synthiant_vetoed' | 'human_approved' | 'human_vetoed'
  synthiant_reason?: string
  human_reason?: string
  training_signal?: any
  evidence_links: string[]
}

// In-memory storage for proposals (in production, this would be a database)
let proposals: Proposal[] = []
let proposalCounter = 1

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, synthiant_id, training_signal, evidence_links = [] } = body

    if (!prompt || !synthiant_id) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt and synthiant_id' },
        { status: 400 }
      )
    }

    const proposal: Proposal = {
      id: `p-${proposalCounter++}`,
      prompt,
      synthiant_id,
      created_at: new Date().toISOString(),
      state: 'pending',
      training_signal,
      evidence_links
    }

    proposals.push(proposal)

    return NextResponse.json({
      success: true,
      proposal_id: proposal.id,
      message: 'Proposal created successfully'
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
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const state = searchParams.get('state')
    
    let filteredProposals = proposals
    
    if (state) {
      filteredProposals = proposals.filter(p => p.state === state)
    }

    return NextResponse.json(filteredProposals, {
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
      { error: 'Failed to fetch proposals' },
      { status: 500 }
    )
  }
}
