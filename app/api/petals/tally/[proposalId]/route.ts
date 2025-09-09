import { NextRequest, NextResponse } from 'next/server'

// Import the PetalsOrchestrator service
const PetalsOrchestrator = require('../../../../services/petals-orchestrator/index.js')

// Initialize the orchestrator service
const orchestrator = new PetalsOrchestrator()

export async function GET(
  request: NextRequest,
  { params }: { params: { proposalId: string } }
) {
  try {
    const { proposalId } = params;

    if (!proposalId) {
      return NextResponse.json(
        { error: 'Proposal ID is required' },
        { status: 400 }
      );
    }

    // Get voting tally
    const result = await orchestrator.tallyVotes(proposalId);

    return NextResponse.json(result, {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'content-disposition': 'inline'
      }
    });
  } catch (error) {
    console.error('Petals tally error:', error);
    return NextResponse.json(
      { error: 'Failed to get voting tally' },
      { status: 500 }
    );
  }
}
