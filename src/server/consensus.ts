/**
 * Synthient Consensus Engine
 * Evaluates training progress and creates/updates auto-proposals with synthient votes
 */

import { db } from '@/lib/db';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { stopTrainer, startTrainer } from './trainer';

const WINDOW_SIZE = 5;
const IMPROVEMENT_THRESHOLD = 0.20; // 20% improvement
const RETRAIN_IMPROVEMENT_THRESHOLD = 0.10; // 10% - below this triggers retrain
const ROOT = process.cwd();

interface ConsensusResult {
  decision: 'approve' | 'veto';
  reason: string;
  improvement: number;
}

function todayDir(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return path.join(ROOT, 'public', 'evidence', 'compliance', `${y}-${m}-${day}`);
}

function ensureDir(p: string): void {
  fs.mkdirSync(p, { recursive: true });
}

function appendHash(filePath: string): void {
  const base = todayDir();
  ensureDir(base);
  
  const hash = crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
  const rel = filePath.replace(`${ROOT}${path.sep}`, '');
  const line = `${hash}  ${rel}\n`;
  const hashFile = path.join(base, 'file-hashes-complete.sha256');
  fs.appendFileSync(hashFile, line, 'utf8');
}

async function writeConsensusEvidence(
  proposalId: string,
  runId: string,
  decision: string,
  reason: string,
  improvement: number
): Promise<string> {
  const base = todayDir();
  const dir = path.join(base, 'consensus');
  ensureDir(dir);
  
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const file = path.join(dir, `${ts}-${proposalId.substring(0, 8)}.json`);
  
  const evidence = {
    timestamp: new Date().toISOString(),
    proposalId,
    runId,
    decision,
    reason,
    improvement,
    window: WINDOW_SIZE,
    threshold: IMPROVEMENT_THRESHOLD
  };
  
  fs.writeFileSync(file, JSON.stringify(evidence, null, 2), 'utf8');
  return file;
}

async function writeDirectiveEvidence(
  runId: string,
  oldLR: number,
  newLR: number,
  reason: string,
  directive: string,
  source: 'synthient' | 'human'
): Promise<string> {
  const base = todayDir();
  const dir = path.join(base, 'directives');
  ensureDir(dir);
  
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const file = path.join(dir, `${ts}-${source}.json`);
  
  const evidence = {
    timestamp: new Date().toISOString(),
    runId,
    oldLR,
    newLR,
    reason,
    directive,
    source
  };
  
  fs.writeFileSync(file, JSON.stringify(evidence, null, 2), 'utf8');
  return file;
}

async function evaluateWindow(steps: any[]): Promise<ConsensusResult> {
  // Steps should be sorted ascending by step number
  const firstLoss = steps[0].loss;
  const lastLoss = steps[steps.length - 1].loss;
  
  const improvement = (firstLoss - lastLoss) / firstLoss;
  const decision = improvement >= IMPROVEMENT_THRESHOLD ? 'approve' : 'veto';
  
  const reason = decision === 'approve'
    ? `Loss improved by ${(improvement * 100).toFixed(2)}% over ${WINDOW_SIZE} steps (${firstLoss.toFixed(6)} → ${lastLoss.toFixed(6)})`
    : `Insufficient improvement: ${(improvement * 100).toFixed(2)}% over ${WINDOW_SIZE} steps (threshold: ${(IMPROVEMENT_THRESHOLD * 100).toFixed(0)}%)`;
  
  return { decision, reason, improvement };
}

export async function evaluateConsensus(runId: string): Promise<void> {
  try {
    // CRITICAL: Check if there's already a pending human-review proposal
    // This prevents continuous proposal generation without human feedback
    const pendingProposal = await db.proposal.findFirst({
      where: { 
        status: 'human-review',
        title: { contains: 'Auto: Tune LR' }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (pendingProposal) {
      console.log(`[CONSENSUS] Skipping evaluation - human-review proposal pending: ${pendingProposal.id}`);
      return;
    }

    // Get the latest WINDOW_SIZE steps for this run
    const steps = await db.trainingStep.findMany({
      where: { runId },
      orderBy: { step: 'desc' },
      take: WINDOW_SIZE
    });

    if (steps.length < WINDOW_SIZE) {
      console.log(`[CONSENSUS] Not enough steps (${steps.length}/${WINDOW_SIZE}) for run ${runId}`);
      return;
    }

    // Sort ascending by step
    const sortedSteps = steps.sort((a, b) => a.step - b.step);
    
    // Evaluate the window
    const result = await evaluateWindow(sortedSteps);
    
    // Get the synthient for this run
    const run = await db.trainingRun.findUnique({
      where: { id: runId },
      include: { Synthient: true }
    });

    if (!run) {
      console.error(`[CONSENSUS] Run ${runId} not found`);
      return;
    }

    // Transaction: create/update proposal, create vote, update status, write evidence
    await db.$transaction(async (tx) => {
      // Check if there's already a proposal for this run
      const proposalTitle = `Auto: Tune LR (run ${runId.substring(0, 8)})`;
      let proposal = await tx.proposal.findFirst({
        where: { title: proposalTitle },
        orderBy: { createdAt: 'desc' }
      });

      const proposalBody = `**Objective:** Automatically tune learning rate based on training performance

**Latest Metrics:**
- Run ID: \`${runId}\`
- Steps evaluated: ${sortedSteps[0].step} - ${sortedSteps[WINDOW_SIZE - 1].step}
- Initial Loss: ${sortedSteps[0].loss.toFixed(6)}
- Final Loss: ${sortedSteps[WINDOW_SIZE - 1].loss.toFixed(6)}
- Improvement: ${(result.improvement * 100).toFixed(2)}%

**Synthient Decision:** ${result.decision.toUpperCase()}

**Reason:** ${result.reason}`;

      if (!proposal) {
        // Create new proposal
        proposal = await tx.proposal.create({
          data: {
            title: proposalTitle,
            body: proposalBody,
            status: 'synthient-review'
          }
        });
        console.log(`[CONSENSUS] Created auto-proposal: ${proposal.id}`);
      } else if (proposal.status === 'synthient-review') {
        // Only update proposals that are still in synthient-review
        // Don't update proposals that are already in human-review or beyond
        await tx.proposal.update({
          where: { id: proposal.id },
          data: { 
            body: proposalBody,
            updatedAt: new Date()
          }
        });
        console.log(`[CONSENSUS] Updated auto-proposal: ${proposal.id}`);
      } else {
        console.log(`[CONSENSUS] Skipping update - proposal ${proposal.id} is in ${proposal.status} status`);
        return; // Exit early, don't create votes for proposals beyond synthient-review
      }

      // Create synthient vote
      await tx.synthientVote.create({
        data: {
          proposalId: proposal.id,
          synthientId: run.synthientId,
          decision: result.decision,
          reason: result.reason
        }
      });
      console.log(`[CONSENSUS] Synthient vote recorded: ${result.decision}`);

      // Determine next status
      let nextStatus = proposal.status;
      if (result.decision === 'veto') {
        nextStatus = 'rejected';
      } else if (result.decision === 'approve' && proposal.status === 'synthient-review') {
        nextStatus = 'human-review';
      }

      if (nextStatus !== proposal.status) {
        await tx.proposal.update({
          where: { id: proposal.id },
          data: { 
            status: nextStatus,
            updatedAt: new Date()
          }
        });
        console.log(`[CONSENSUS] Proposal ${proposal.id} status: ${proposal.status} → ${nextStatus}`);
      }

      // Write consensus evidence (outside transaction to avoid deadlock)
      const evidencePath = await writeConsensusEvidence(
        proposal.id,
        runId,
        result.decision,
        result.reason,
        result.improvement
      );
      appendHash(evidencePath);
    });

    // Check if synthient veto with low improvement triggers retrain
    if (result.decision === 'veto' && result.improvement < RETRAIN_IMPROVEMENT_THRESHOLD && run.lr) {
      console.log(`[CONSENSUS] Synthient veto with <10% improvement - triggering retrain`);
      await handleRetrainDirective(runId, run.lr, result.reason, 'Auto-retrain due to insufficient progress');
    }

  } catch (error) {
    console.error('[CONSENSUS] Error evaluating consensus:', error);
  }
}

async function handleRetrainDirective(
  runId: string,
  oldLR: number,
  reason: string,
  directive: string
): Promise<void> {
  try {
    // Calculate new LR: max(0.005, round(LR * 0.8, 5))
    const newLR = Math.max(0.005, Math.round(oldLR * 0.8 * 100000) / 100000);
    
    console.log(`[RETRAIN] Adjusting LR: ${oldLR} → ${newLR}`);
    
    // Write directive evidence
    const evidencePath = await writeDirectiveEvidence(
      runId,
      oldLR,
      newLR,
      reason,
      directive,
      'synthient'
    );
    appendHash(evidencePath);
    
    // Stop current run
    await stopTrainer();
    console.log(`[RETRAIN] Stopped training run ${runId.substring(0, 8)}`);
    
    // Wait a moment for cleanup
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Start new run with adjusted LR
    const result = await startTrainer(newLR);
    console.log(`[RETRAIN] Started new training run ${result.runId?.substring(0, 8)} with LR=${newLR}`);
    
  } catch (error) {
    console.error('[RETRAIN] Error handling retrain directive:', error);
  }
}

export async function handleHumanVetoRetrain(
  runId: string,
  directive: string
): Promise<void> {
  try {
    const run = await db.trainingRun.findUnique({
      where: { id: runId }
    });
    
    if (!run || !run.lr) {
      console.error(`[RETRAIN] Run ${runId} not found or has no LR`);
      return;
    }
    
    // Calculate new LR
    const newLR = Math.max(0.005, Math.round(run.lr * 0.8 * 100000) / 100000);
    
    // Write directive evidence
    const evidencePath = await writeDirectiveEvidence(
      runId,
      run.lr,
      newLR,
      'Human veto',
      directive,
      'human'
    );
    appendHash(evidencePath);
    
    // Stop and restart
    await stopTrainer();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await startTrainer(newLR);
    
    console.log(`[RETRAIN] Human directive executed: LR ${run.lr} → ${newLR}`);
    
  } catch (error) {
    console.error('[RETRAIN] Error handling human veto retrain:', error);
  }
}
