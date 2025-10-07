/**
 * Proposal service logic
 * Per CTO directive: Business logic layer for governance proposals
 */

import { db } from '../db';

export async function listProposals() {
  return await db.proposal.findMany({
    orderBy: { createdAt: 'desc' },
    include: { votes: true },
  });
}

export async function createProposal(title: string, body: string) {
  return await db.proposal.create({
    data: { title, body },
  });
}

export async function voteOnProposal(
  proposalId: string,
  voter: string,
  decision: 'approve' | 'veto',
  reason?: string
) {
  // Validate decision
  if (!['approve', 'veto'].includes(decision)) {
    throw new Error('Decision must be "approve" or "veto"');
  }
  
  if (!voter) {
    throw new Error('Voter is required');
  }
  
  // Create vote
  const vote = await db.vote.create({
    data: {
      proposalId,
      voter,
      decision,
      reason,
    },
  });
  
  // Update proposal status
  const status = decision === 'approve' ? 'approved' : 'vetoed';
  await db.proposal.update({
    where: { id: proposalId },
    data: { status },
  });
  
  return vote;
}

