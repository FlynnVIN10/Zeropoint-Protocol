import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { writeVoteEvidence, writeUiEvent } from '@/lib/evidence';
import { handleHumanVetoRetrain } from '@/src/server/consensus';

export async function POST(_: Request,{ params }:{params:Promise<{id:string}>}) {
  const paramsResolved = await params;
  const body = await _.json().catch(()=>null);
  const { actor, decision, reason, directive } = body || {};
  if(!paramsResolved.id||!actor||!decision||!reason) return NextResponse.json({error:'bad_request'}, {status:400});

  try {
    const out = await db.$transaction(async (tx)=>{
      const prop = await tx.proposal.findUnique({ 
        where:{ id: paramsResolved.id }, 
        include:{ 
          Vote: true,
          SynthientVote: true
        }
      });
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

      // Synthient-first gate: return 409 if human votes before any synthient approve
      if(actor === 'human') {
        const synthientApproved = prop.SynthientVote.some(v => v.decision === 'approve');
        if(!synthientApproved) {
          throw new Error('SYNTHIENT_FIRST_GATE: Human cannot vote until synthient has approved');
        }
      }

      // Enforce dual-consensus flow: synthient cannot vote after human review
      if(actor === 'synthient' && prop.status === 'human-review') {
        throw new Error('Synthient has already voted - proposal is in human review');
      }

      // If human veto with directive, append directive to reason
      const finalReason = (actor === 'human' && decision === 'veto' && directive) 
        ? `${reason}\n\nDirective: ${directive}`
        : reason;
      
      const vote = await tx.vote.create({ data:{ proposalId: paramsResolved.id, actor, decision, reason: finalReason }});

      // Evidence writes inside transaction - failure will rollback
      writeVoteEvidence(paramsResolved.id, actor, decision, finalReason);
      writeUiEvent('vote', { proposalId: paramsResolved.id, actor, decision });

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
      if(next!==prop.status) await tx.proposal.update({ where:{ id: paramsResolved.id }, data:{ status: next }});

      return { status: next, voteId: vote.id, runId: prop.title.match(/run ([a-z0-9]+)/)?.[1] };
    });

        // If human veto with directive, trigger retrain (outside transaction)
        if(actor === 'human' && decision === 'veto' && directive && out.runId) {
          // Fire and forget - don't block response
          handleHumanVetoRetrain(out.runId, directive).catch(err => {
            console.error('[VOTE] Failed to handle retrain directive:', err);
          });
        }

        // If human approval, log that consensus can resume for new training runs
        if(actor === 'human' && decision === 'approve') {
          console.log(`[VOTE] Human approved proposal ${paramsResolved.id} - consensus can resume for new training runs`);
        }

        return NextResponse.json({ recorded:true, status: out.status, id: out.voteId }, { status:200 });
  } catch(e:any){
    const errorMsg = String(e.message||e);
    
    // Return 409 for synthient-first gate violations
    if(errorMsg.includes('SYNTHIENT_FIRST_GATE')) {
      return NextResponse.json({ error: 'synthient_first_gate', detail: errorMsg }, { status: 409 });
    }
    
    return NextResponse.json({ error:'evidence_or_db_failure', detail: errorMsg }, { status:500 });
  }
}
