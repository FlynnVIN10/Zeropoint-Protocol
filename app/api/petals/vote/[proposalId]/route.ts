import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { proposalId: string } }
) {
  try {
    const { proposalId } = params;
    const body = await request.json();
    const { vote, voter, voterType, justification } = body;

    if (!proposalId) {
      return NextResponse.json(
        { error: 'Proposal ID is required' },
        { status: 400 }
      );
    }

    // Validate vote parameters
    if (!vote || !voter || !voterType) {
      return NextResponse.json(
        { error: 'Missing required parameters: vote, voter, and voterType are required' },
        { status: 400 }
      );
    }

    // Validate vote type
    const validVotes = ['for', 'against', 'abstain'];
    if (!validVotes.includes(vote)) {
      return NextResponse.json(
        { error: 'Invalid vote type. Must be: for, against, or abstain' },
        { status: 400 }
      );
    }

    // Validate voter type
    const validVoterTypes = ['synthient', 'human'];
    if (!validVoterTypes.includes(voterType)) {
      return NextResponse.json(
        { error: 'Invalid voter type. Must be: synthient or human' },
        { status: 400 }
      );
    }

    // Create vote record
    const voteRecord = {
      proposalId,
      vote,
      voter,
      voterType,
      justification: justification || '',
      timestamp: new Date().toISOString(),
      weight: voterType === 'synthient' ? 1 : 1 // Equal weight for now
    };

    // Log the vote
    console.log(`Petals vote cast: ${proposalId}`, voteRecord);

    // In a real implementation, this would store the vote and update proposal tallies
    // For now, we'll simulate the vote processing
    const response = {
      proposalId,
      voteId: `vote-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'recorded',
      message: 'Vote recorded successfully',
      vote: voteRecord,
      currentTally: {
        for: Math.floor(Math.random() * 5),
        against: Math.floor(Math.random() * 3),
        abstain: Math.floor(Math.random() * 2),
        total: Math.floor(Math.random() * 10)
      },
      consensus: {
        synthient: Math.random() > 0.5,
        human: Math.random() > 0.5,
        required: 2
      }
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store'
      }
    });

  } catch (error) {
    console.error('Petals vote error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
