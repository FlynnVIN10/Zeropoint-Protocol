import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const synthientReview = await db.proposal.count({
    where: { status: 'synthient-review' }
  });
  
  const humanReview = await db.proposal.count({
    where: { status: 'human-review' }
  });
  
  const totalPending = synthientReview + humanReview;
  
  return NextResponse.json({
    synthientReview,
    humanReview,
    totalPending,
    healthy: totalPending === 0
  }, {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'content-disposition': 'inline'
    }
  });
}

