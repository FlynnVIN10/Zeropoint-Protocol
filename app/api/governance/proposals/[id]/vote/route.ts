import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { writeVoteEvidence, writeUiEvent } from '@/lib/evidence';

export async function POST(_: Request,{ params }:{params:{id:string}}) {
  const body = await _.json().catch(()=>null);
  const { actor, decision, reason } = body || {};
  if(!params.id||!actor||!decision||!reason) return NextResponse.json({error:'bad_request'}, {status:400});

  try {
    const out = await prisma.$transaction(async (tx)=>{
      const prop = await tx.proposal.findUnique({ where:{ id: params.id }, include:{ votes:true }});
      if(!prop) throw new Error('not_found');

      const vote = await tx.vote.create({ data:{ proposalId: params.id, actor, decision, reason }});

      const hasVeto = decision==='veto' || prop.votes.some(v=>v.decision==='veto');
      const hasHumanApprove = (actor==='human'&&decision==='approve') || prop.votes.some(v=>v.actor==='human'&&v.decision==='approve');
      const hasSynthApprove = prop.votes.some(v=>v.actor==='synthient'&&v.decision==='approve');
      const next = hasVeto ? 'rejected' : (hasHumanApprove && hasSynthApprove ? 'approved' : prop.status);
      if(next!==prop.status) await tx.proposal.update({ where:{ id: params.id }, data:{ status: next }});

      // Evidence must succeed or transaction aborts
      writeVoteEvidence(params.id, actor, decision, reason);
      writeUiEvent('vote', { proposalId: params.id, actor, decision });

      return { status: next, voteId: vote.id };
    });

    return NextResponse.json({ recorded:true, status: out.status, id: out.voteId }, { status:200 });
  } catch(e:any){
    return NextResponse.json({ error:'evidence_or_db_failure', detail: String(e.message||e) }, { status:500 });
  }
}
