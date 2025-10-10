/**
 * Synthient Consensus Engine
 * Evaluates training progress and creates auto-proposals with synthient votes
 */

import { db } from '@/lib/db';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT = process.cwd();
const WINDOW_SIZE = 5; // Last 5 steps
const IMPROVEMENT_THRESHOLD = 20; // 20% improvement required

class ConsensusEngine {
  private synthientId: string;

  constructor() {
    this.synthientId = process.env.SYNTHIENT_ID || 'synth-1';
  }

  private todayDir(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return path.join(ROOT, 'public', 'evidence', 'compliance', `${y}-${m}-${day}`);
  }

  private ensureDir(p: string): void {
    fs.mkdirSync(p, { recursive: true });
  }

  private appendHash(filePath: string): void {
    const base = this.todayDir();
    this.ensureDir(base);
    
    const hash = crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
    const rel = filePath.replace(`${ROOT}${path.sep}`, '');
    const line = `${hash}  ${rel}\n`;
    const hashFile = path.join(base, 'file-hashes-complete.sha256');
    fs.appendFileSync(hashFile, line, 'utf8');
  }

  private async getSynthient(): Promise<string> {
    let synthient = await db.synthient.findFirst({
      where: { name: this.synthientId }
    });

    if (!synthient) {
      synthient = await db.synthient.create({
        data: {
          name: this.synthientId,
          status: 'idle'
        }
      });
    }

    return synthient.id;
  }

  private async getTrainingSteps(runId: string, limit: number = WINDOW_SIZE): Promise<any[]> {
    return db.trainingStep.findMany({
      where: { runId },
      orderBy: { step: 'desc' },
      take: limit
    });
  }

  private calculateImprovement(steps: any[]): number {
    if (steps.length < 2) return 0;

    const firstLoss = steps[steps.length - 1].loss;
    const lastLoss = steps[0].loss;

    if (firstLoss <= 0) return 0; // Avoid division by zero

    return ((firstLoss - lastLoss) / firstLoss) * 100;
  }

  private async findExistingProposal(runId: string): Promise<any | null> {
    // Look for existing auto-proposal for this run
    const proposals = await db.proposal.findMany({
      where: {
        title: {
          contains: `Auto: Tune LR (run ${runId.substring(0, 8)})`
        }
      },
      include: {
        SynthientVote: true
      }
    });

    return proposals.length > 0 ? proposals[0] : null;
  }

  private async createOrUpdateProposal(
    runId: string,
    improvement: number,
    steps: any[]
  ): Promise<string> {
    const synthientId = await this.getSynthient();
    const shortRunId = runId.substring(0, 8);
    
    const existingProposal = await this.findExistingProposal(runId);
    
    const title = `Auto: Tune LR (run ${shortRunId})`;
    const body = `**Synthient Training Analysis**

Run ID: ${runId}
Steps Analyzed: ${steps.length}
Improvement: ${improvement.toFixed(2)}%

**Latest Metrics:**
- Final Loss: ${steps[0]?.loss.toFixed(6) || 'N/A'}
- Initial Loss: ${steps[steps.length - 1]?.loss.toFixed(6) || 'N/A'}
- Parameters: w=${steps[0]?.parameters ? JSON.parse(steps[0].parameters).w.toFixed(4) : 'N/A'}, b=${steps[0]?.parameters ? JSON.parse(steps[0].parameters).b.toFixed(4) : 'N/A'}

**Consensus Decision:**
${improvement >= IMPROVEMENT_THRESHOLD ? '✅ APPROVE: Training shows significant improvement' : '❌ VETO: Insufficient improvement detected'}`;

    if (existingProposal) {
      // Update existing proposal
      await db.proposal.update({
        where: { id: existingProposal.id },
        data: {
          body,
          updatedAt: new Date()
        }
      });
      return existingProposal.id;
    } else {
      // Create new proposal
      const proposal = await db.proposal.create({
        data: {
          title,
          body,
          status: 'synthient-review'
        }
      });
      return proposal.id;
    }
  }

  private async recordSynthientVote(
    proposalId: string,
    decision: 'approve' | 'veto',
    reason: string
  ): Promise<void> {
    const synthientId = await this.getSynthient();

    // Check if synthient already voted on this proposal
    const existingVote = await db.synthientVote.findFirst({
      where: {
        proposalId,
        synthientId
      }
    });

    if (existingVote) {
      // Update existing vote
      await db.synthientVote.update({
        where: { id: existingVote.id },
        data: {
          decision,
          reason
        }
      });
    } else {
      // Create new vote
      await db.synthientVote.create({
        data: {
          proposalId,
          synthientId,
          decision,
          reason
        }
      });
    }
  }

  private async updateProposalStatus(proposalId: string, decision: 'approve' | 'veto'): Promise<void> {
    let newStatus: string;

    if (decision === 'veto') {
      newStatus = 'rejected';
    } else {
      // Check if there are any vetoes
      const vetoes = await db.synthientVote.findMany({
        where: {
          proposalId,
          decision: 'veto'
        }
      });

      if (vetoes.length > 0) {
        newStatus = 'rejected';
      } else {
        newStatus = 'human-review';
      }
    }

    await db.proposal.update({
      where: { id: proposalId },
      data: { status: newStatus }
    });
  }

  private async writeConsensusEvidence(
    runId: string,
    improvement: number,
    decision: 'approve' | 'veto',
    steps: any[]
  ): Promise<void> {
    const base = this.todayDir();
    const dir = path.join(base, 'consensus');
    this.ensureDir(dir);
    
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const file = path.join(dir, `${ts}-consensus-${runId.substring(0, 8)}.json`);
    
    const evidence = {
      timestamp: new Date().toISOString(),
      runId,
      windowSize: WINDOW_SIZE,
      stepsAnalyzed: steps.length,
      improvement: improvement,
      threshold: IMPROVEMENT_THRESHOLD,
      decision,
      reasoning: improvement >= IMPROVEMENT_THRESHOLD 
        ? `Training shows ${improvement.toFixed(2)}% improvement, exceeding ${IMPROVEMENT_THRESHOLD}% threshold`
        : `Training shows only ${improvement.toFixed(2)}% improvement, below ${IMPROVEMENT_THRESHOLD}% threshold`,
      steps: steps.map(s => ({
        step: s.step,
        loss: s.loss,
        parameters: s.parameters
      }))
    };
    
    fs.writeFileSync(file, JSON.stringify(evidence, null, 2), 'utf8');
    this.appendHash(file);
  }

  async evaluateConsensus(runId: string): Promise<{
    evaluated: boolean;
    improvement?: number;
    decision?: 'approve' | 'veto';
    proposalId?: string;
  }> {
    try {
      // Get recent training steps
      const steps = await this.getTrainingSteps(runId, WINDOW_SIZE);
      
      if (steps.length < WINDOW_SIZE) {
        return { evaluated: false };
      }

      // Calculate improvement
      const improvement = this.calculateImprovement(steps);
      
      // Make decision
      const decision: 'approve' | 'veto' = improvement >= IMPROVEMENT_THRESHOLD ? 'approve' : 'veto';
      const reason = decision === 'approve' 
        ? `Training shows ${improvement.toFixed(2)}% improvement, exceeding ${IMPROVEMENT_THRESHOLD}% threshold`
        : `Training shows only ${improvement.toFixed(2)}% improvement, below ${IMPROVEMENT_THRESHOLD}% threshold`;

      // Use transaction for atomic operations
      const result = await db.$transaction(async (tx) => {
        // Create or update proposal
        const proposalId = await this.createOrUpdateProposal(runId, improvement, steps);
        
        // Record synthient vote
        await this.recordSynthientVote(proposalId, decision, reason);
        
        // Update proposal status
        await this.updateProposalStatus(proposalId, decision);
        
        return { proposalId };
      });

      // Write evidence outside transaction
      await this.writeConsensusEvidence(runId, improvement, decision, steps);

      return {
        evaluated: true,
        improvement,
        decision,
        proposalId: result.proposalId
      };

    } catch (error) {
      console.error('Consensus evaluation failed:', error);
      return { evaluated: false };
    }
  }
}

// Singleton instance
export const consensusEngine = new ConsensusEngine();

// Export function for API use
export async function evaluateConsensus(runId: string) {
  return consensusEngine.evaluateConsensus(runId);
}
