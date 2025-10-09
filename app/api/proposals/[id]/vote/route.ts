import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { promises as fs } from 'node:fs';
import path from 'node:path';

async function verifyEvidence(): Promise<{ valid: boolean; reason?: string }> {
  // Evidence gate: require Petals and Tinygrad evidence before approval
  const date = new Date().toISOString().split('T')[0];
  const evidenceBase = path.join(process.cwd(), 'public', 'evidence', 'runs', date);
  
  try {
    // Check Petals evidence
    const petalsHealth = path.join(evidenceBase, 'petals', 'health.curl.txt');
    const petals503 = path.join(evidenceBase, 'petals', 'generate-503.json');
    
    try {
      await fs.access(petalsHealth);
      await fs.access(petals503);
    } catch {
      return { valid: false, reason: 'Missing Petals evidence (health.curl.txt or generate-503.json)' };
    }
    
    // Check Tinygrad evidence (at least one job with metrics)
    const runDirs = await fs.readdir(evidenceBase);
    const tinygradDirs = runDirs.filter(d => d.startsWith('tinygrad-'));
    
    if (tinygradDirs.length === 0) {
      return { valid: false, reason: 'No Tinygrad training runs found' };
    }
    
    // Verify at least one tinygrad job has valid metrics
    for (const dir of tinygradDirs) {
      const metricsPath = path.join(evidenceBase, dir, 'metrics.json');
      try {
        const data = await fs.readFile(metricsPath, 'utf-8');
        const metrics = JSON.parse(data);
        
        // Verify real training: loss must decrease
        if (metrics.loss_start && metrics.loss_end && metrics.loss_delta > 0) {
          return { valid: true }; // Found valid evidence
        }
      } catch {
        continue; // Try next job
      }
    }
    
    return { valid: false, reason: 'No Tinygrad run with decreasing loss found' };
  } catch (error) {
    return { valid: false, reason: `Evidence verification failed: ${error}` };
  }
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const { voter, decision, reason } = await req.json();
  
  if (!["approve", "veto"].includes(decision)) {
    return NextResponse.json({
      error: "Decision must be 'approve' or 'veto'"
    }, { status: 400 });
  }
  
  if (!voter) {
    return NextResponse.json({
      error: "Voter is required"
    }, { status: 400 });
  }
  
  const v = await db.vote.create({
    data: {
      id: `vote-${Date.now()}`,
      proposalId: params.id,
      voter,
      decision,
      reason
    }
  });

  // Dual-consensus gating: proposal status updates only when BOTH conditions are met
  // - Any veto from synthient or human -> vetoed
  // - At least one synthient approve AND one human approve -> approved
  // - Evidence must exist before advancing to approved
  // Otherwise remain open

  // Fetch all votes for this proposal
  const votes = await db.vote.findMany({ where: { proposalId: params.id } });
  const synthientIds = new Set((await db.synthient.findMany({ select: { id: true } })).map(s => s.id));

  const isSynthient = (voterId: string) => synthientIds.has(voterId);
  const anyVeto = votes.some(v => v.decision === 'veto');
  const synthientApproved = votes.some(v => v.decision === 'approve' && isSynthient(v.voter));
  const humanApproved = votes.some(v => v.decision === 'approve' && !isSynthient(v.voter));

  let newStatus: "open" | "approved" | "vetoed" = "open";
  
  if (anyVeto) {
    newStatus = "vetoed";
  } else if (synthientApproved && humanApproved) {
    // Evidence gate: verify before approval
    const evidenceCheck = await verifyEvidence();
    if (!evidenceCheck.valid) {
      return NextResponse.json({
        vote: v,
        status: "open",
        evidenceGate: "blocked",
        reason: evidenceCheck.reason
      }, { status: 400 });
    }
    newStatus = "approved";
  }

  if (newStatus !== "open") {
    await db.proposal.update({ where: { id: params.id }, data: { status: newStatus } });
  }

  return NextResponse.json({ vote: v, status: newStatus }, { status: 201 });
}

