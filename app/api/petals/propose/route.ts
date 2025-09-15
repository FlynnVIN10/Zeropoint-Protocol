import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'edge';

// Import the PetalsOrchestrator service
import * as Petals from '@services/petals-orchestrator'

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
    const result = await Petals.submitProposal({
      title: body.title,
      description: body.description,
      proposalType: body.proposalType,
      synthientApproval: body.synthientApproval || false
    })

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
  return new Response(JSON.stringify({ error: 'method_not_allowed' }), { 
    status: 405, 
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'allow': 'POST'
    }
  });
}