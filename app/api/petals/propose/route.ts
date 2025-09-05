import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, type, parameters, proposer } = body;

    // Validate required parameters
    if (!title || !description || !type || !proposer) {
      return NextResponse.json(
        { error: 'Missing required parameters: title, description, type, and proposer are required' },
        { status: 400 }
      );
    }

    // Generate unique proposal ID
    const proposalId = uuidv4();
    
    // Create proposal
    const proposal = {
      id: proposalId,
      title,
      description,
      type,
      parameters: parameters || {},
      proposer,
      status: 'active',
      createdAt: new Date().toISOString(),
      votes: {
        for: 0,
        against: 0,
        abstain: 0
      },
      totalVotes: 0,
      consensus: {
        synthient: false,
        human: false,
        required: 2
      }
    };

    // Log the proposal creation
    console.log(`Petals proposal created: ${proposalId}`, proposal);

    // In a real implementation, this would store the proposal in a database
    // For now, we'll simulate the proposal creation
    const response = {
      proposalId,
      status: 'active',
      message: 'Proposal created successfully',
      proposal,
      votingDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      consensusRequired: 2
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
    console.error('Petals propose error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
