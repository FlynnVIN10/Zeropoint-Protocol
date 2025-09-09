import { NextRequest, NextResponse } from 'next/server'

// Import the PetalsOrchestrator service
const PetalsOrchestrator = require('../../../../services/petals-orchestrator/index.js')

// Initialize the orchestrator service
const orchestrator = new PetalsOrchestrator()

export async function POST(
  request: NextRequest,
  { params }: { params: { proposalId: string } }
) {
  try {
    const { proposalId } = params;
    const body = await request.json();

    if (!proposalId) {
      return NextResponse.json(
        { error: 'Proposal ID is required' },
        { status: 400 }
      );
    }

    if (!body.voterId || !body.decision) {
      return NextResponse.json(
        { error: 'Missing required fields: voterId, decision' },
        { status: 400 }
      );
    }

    // Cast vote
    const result = await orchestrator.castVote(
      proposalId,
      body.voterId,
      body.decision
    );

    return NextResponse.json(result, {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'content-disposition': 'inline'
      }
    });
  } catch (error) {
    console.error('Petals vote error:', error);
    return NextResponse.json(
      { error: 'Failed to cast vote' },
      { status: 500 }
    );
  }
}