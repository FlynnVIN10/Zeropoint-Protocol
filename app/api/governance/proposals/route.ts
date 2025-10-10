import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { writeUiEvent } from '@/lib/evidence';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;
  const where = status ? { status } : {};
  
  const proposals = await db.proposal.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, status: true, createdAt: true }
  });
  
  return NextResponse.json({ proposals }, {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'content-disposition': 'inline'
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, body: proposalBody } = body ?? {};
    
    if (!title || !proposalBody) {
      return NextResponse.json(
        { error: 'title/body required' },
        { status: 400 }
      );
    }
    
    const p = await db.proposal.create({
      data: { title, body: proposalBody }
    });
    
    writeUiEvent('proposal-create', { id: p.id, title });
    
    return NextResponse.json({ id: p.id }, {
      status: 201,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'content-disposition': 'inline'
      }
    });
  } catch (error) {
    console.error('Proposal creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create proposal' },
      { status: 500 }
    );
  }
}

