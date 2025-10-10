import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
  
  return NextResponse.json({ proposal }, {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'content-disposition': 'inline'
    }
  });
}

