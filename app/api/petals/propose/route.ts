import { NextRequest, NextResponse } from 'next/server'

// Import the PetalsOrchestrator service
const PetalsOrchestrator = require('../../../../services/petals-orchestrator/index.js')

// Initialize the orchestrator service
const orchestrator = new PetalsOrchestrator()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.title || !body.description || !body.proposalType) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, proposalType' },
        { status: 400 }
      )
    }

    // Submit proposal
    const result = await orchestrator.submitProposal(
      body.title,
      body.description,
      body.proposalType,
      body.synthientApproval || false
    )

    return NextResponse.json(result, {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'content-disposition': 'inline'
      }
    })
  } catch (error) {
    console.error('Petals proposal error:', error)
    return NextResponse.json(
      { error: 'Failed to submit proposal' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      service: 'petals-orchestrator',
      status: 'operational',
      endpoints: {
        propose: 'POST /api/petals/propose',
        vote: 'POST /api/petals/vote/{proposalId}',
        status: 'GET /api/petals/status/{proposalId}',
        tally: 'GET /api/petals/tally/{proposalId}'
      }
    },
    {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'content-disposition': 'inline'
      }
    }
  )
}