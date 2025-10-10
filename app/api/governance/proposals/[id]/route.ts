import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = params.id;
  
  try {
    await db.proposal.delete({
      where: { id }
    });
    
    return NextResponse.json({ deleted: true }, {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'content-disposition': 'inline'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete proposal' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = params.id;
  
  const proposal = await db.proposal.findUnique({
    where: { id },
    include: { Vote: { orderBy: { createdAt: 'asc' } } }
  });
  
  if (!proposal) {
    return NextResponse.json(
      { error: 'not found' },
      { status: 404 }
    );
  }
  
  // Transform Vote to votes for frontend compatibility
  const transformedProposal = {
    ...proposal,
    votes: proposal.Vote
  };
  delete transformedProposal.Vote;

  return NextResponse.json({ proposal: transformedProposal }, {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'content-disposition': 'inline'
    }
  });
}

