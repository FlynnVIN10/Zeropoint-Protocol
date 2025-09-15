import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'edge';

// Import the PetalsOrchestrator service
// import * as Petals from '@services/petals-orchestrator' // TODO: Fix import when service exists

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ proposalId: string }> }
) {
  try {
    const { proposalId } = await params;

    if (!proposalId) {
      return NextResponse.json(
        { error: 'Proposal ID is required' },
        { status: 400 }
      );
    }

    // Temporary mock response until service exists
    const result = {
      proposalId,
      status: 'under_review',
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(result, {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'content-disposition': 'inline'
      }
    });
  } catch (error) {
    console.error('Petals status error:', error);
    return NextResponse.json(
      { error: 'Failed to get proposal status' },
      { status: 500 }
    );
  }
}
