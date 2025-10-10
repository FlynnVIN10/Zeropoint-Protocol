import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { writeUiEvent, writeVoteEvidence } from '@/lib/evidence';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = params.id;
  
  try {
    const body = await request.json();
    const { actor, decision, reason } = body ?? {};
    
    if (!actor || !decision || !reason) {
      return NextResponse.json(
        { error: 'actor/decision/reason required' },
        { status: 400 }
      );
    }
    
    if (!['human', 'synthient'].includes(actor)) {
      return NextResponse.json(
        { error: 'actor must be "human" or "synthient"' },
        { status: 400 }
      );
    }
    
    if (!['approve', 'veto'].includes(decision)) {
      return NextResponse.json(
        { error: 'decision must be "approve" or "veto"' },
        { status: 400 }
      );
    }
    
    const prop = await db.proposal.findUnique({
      where: { id },
      include: { Vote: true }
    });
    
    if (!prop) {
      return NextResponse.json(
        { error: 'proposal not found' },
        { status: 404 }
      );
    }
    
    const vote = await db.vote.create({
      data: {
        proposalId: id,
        actor,
        decision,
        reason
      }
    });
    
    // Dual-consensus logic
    const votes = await db.vote.findMany({ where: { proposalId: id } });
    const hasVeto = votes.some(v => v.decision === 'veto');
    const hasHumanApprove = votes.some(v => v.actor === 'human' && v.decision === 'approve');
    const hasSynthApprove = votes.some(v => v.actor === 'synthient' && v.decision === 'approve');
    
    let status = prop.status;
    if (hasVeto) {
      status = 'rejected';
    } else if (hasHumanApprove && hasSynthApprove) {
      status = 'approved';
    }
    
    if (status !== prop.status) {
      await db.proposal.update({
        where: { id },
        data: { status }
      });
    }
    
    // Write evidence
    writeVoteEvidence(id, actor, decision, reason);
    writeUiEvent('vote', { proposalId: id, actor, decision });
    
    return NextResponse.json({
      recorded: true,
      status
    }, {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'content-disposition': 'inline'
      }
    });
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json(
      { error: 'Failed to record vote' },
      { status: 500 }
    );
  }
}

