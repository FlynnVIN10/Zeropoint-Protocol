import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prNumber, commitSha, synthientApproval, humanApproval, justification } = body;

    // Validate required parameters
    if (!prNumber || !commitSha || !synthientApproval || !humanApproval) {
      return NextResponse.json(
        { error: 'Missing required parameters: prNumber, commitSha, synthientApproval, and humanApproval are required' },
        { status: 400 }
      );
    }

    // Validate approval types
    const validApprovals = ['approved', 'rejected', 'pending'];
    if (!validApprovals.includes(synthientApproval) || !validApprovals.includes(humanApproval)) {
      return NextResponse.json(
        { error: 'Invalid approval type. Must be: approved, rejected, or pending' },
        { status: 400 }
      );
    }

    // Generate unique approval ID
    const approvalId = uuidv4();
    
    // Create approval record
    const approval = {
      id: approvalId,
      prNumber,
      commitSha,
      synthientApproval: {
        status: synthientApproval,
        timestamp: new Date().toISOString(),
        justification: justification?.synthient || '',
        weight: 1
      },
      humanApproval: {
        status: humanApproval,
        timestamp: new Date().toISOString(),
        justification: justification?.human || '',
        weight: 1
      },
      consensus: {
        required: 2,
        achieved: (synthientApproval === 'approved' ? 1 : 0) + (humanApproval === 'approved' ? 1 : 0),
        status: (synthientApproval === 'approved' && humanApproval === 'approved') ? 'approved' : 'pending'
      },
      createdAt: new Date().toISOString(),
      governanceMode: 'dual-consensus'
    };

    // Log the approval
    console.log(`Governance approval: ${approvalId}`, approval);

    // In a real implementation, this would store the approval and enforce merge rules
    const response = {
      approvalId,
      status: 'recorded',
      message: 'Approval recorded successfully',
      approval,
      mergeEligible: approval.consensus.status === 'approved',
      nextSteps: approval.consensus.status === 'approved' ? 
        'PR eligible for merge' : 
        'Additional approvals required'
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
    console.error('Governance approval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
