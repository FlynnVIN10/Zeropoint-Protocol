import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const open = await db.proposal.findMany({
    where: { status: 'open' },
    include: { Vote: true }
  });
  
  const pendingHuman = open.filter(p =>
    !p.Vote.some(v => v.actor === 'human' && v.decision === 'approve')
  ).length;
  
  const pendingSynth = open.filter(p =>
    !p.Vote.some(v => v.actor === 'synthient' && v.decision === 'approve')
  ).length;
  
  return NextResponse.json({
    open: open.length,
    pendingHuman,
    pendingSynth,
    healthy: open.length === 0
  }, {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'content-disposition': 'inline'
    }
  });
}

