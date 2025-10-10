import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { writeVoteEvidence, writeUiEvent } from '@/lib/evidence';

export async function POST(_: Request,{ params }:{params:{id:string}}) {
  const body = await _.json().catch(()=>null);
  const { actor, decision, reason } = body || {};
  if(!params.id||!actor||!decision||!reason) return NextResponse.json({error:'bad_request'}, {status:400});

  try {
    const out = await db.$transaction(async (tx)=>{
      const prop = await tx.proposal.findUnique({ where:{ id: params.id }, include:{ Vote:true }});
      if(!prop) throw new Error('not_found');

      // Check if proposal is already in final state
      if(prop.status === 'approved' || prop.status === 'rejected') {
        throw new Error(`Proposal already ${prop.status}`);
      }

      // Check if this actor has already voted
      const existingVote = prop.Vote.find(v => v.actor === actor);
      if(existingVote) {
        throw new Error(`${actor} has already voted on this proposal`);
      }

      // Enforce dual-consensus flow: synthient must vote first
      if(actor === 'human' && prop.status === 'synthient-review') {
        throw new Error('Human cannot vote until synthient has reviewed the proposal');
      }

      // Enforce dual-consensus flow: synthient cannot vote after human review
      if(actor === 'synthient' && prop.status === 'human-review') {
        throw new Error('Synthient has already voted - proposal is in human review');
      }

      const vote = await tx.vote.create({ data:{ proposalId: params.id, actor, decision, reason }});

      // Determine next status based on dual-consensus flow
      let next = prop.status;
      
      if(actor === 'synthient') {
        if(decision === 'veto') {
          next = 'rejected';
        } else if(decision === 'approve') {
          next = 'human-review';
        }
      } else if(actor === 'human') {
        if(decision === 'veto') {
          next = 'rejected';
        } else if(decision === 'approve') {
          next = 'approved';
        }
      }
      if(next!==prop.status) await tx.proposal.update({ where:{ id: params.id }, data:{ status: next }});

      return { status: next, voteId: vote.id };
    });

    // Evidence writing after successful transaction
    try {
      writeVoteEvidence(params.id, actor, decision, reason);
      writeUiEvent('vote', { proposalId: params.id, actor, decision });
    } catch (evidenceError: any) {
      console.error('Evidence write failed:', evidenceError);
      // Don't fail the vote if evidence writing fails
    }

    return NextResponse.json({ recorded:true, status: out.status, id: out.voteId }, { status:200 });
  } catch(e:any){
    return NextResponse.json({ error:'evidence_or_db_failure', detail: String(e.message||e) }, { status:500 });
  }
}
