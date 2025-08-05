import { Injectable, Logger } from '@nestjs/common';
import { TelemetryService } from './telemetry.service.js';
import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';

// Extended interfaces for consensus engine
export interface VoteRequest {
  proposalId: string;
  voterId: string;
  vote: boolean;
  role: 'sentient' | 'human';
  reasoning?: string;
}

export interface ConsensusProposal {
  id: string;
  agentId: string;
  codeDiff: string;
  description: string;
  title?: string;
  timestamp: number;
  status: 'pending' | 'sentient_voting' | 'human_voting' | 'approved' | 'vetoed' | 'expired';
  sentientVotes: Array<{ sentientId: string; vote: boolean; timestamp: number; reasoning?: string }>;
  humanDecision?: { decision: 'APPROVE' | 'VETO'; timestamp: number; reason?: string; voterId?: string };
  humanVotingStartTime?: number;
  sentientVotingStartTime?: number;
  finalizedAt?: number;
  vetoedAt?: number;
  expiredAt?: number;
  expirationReason?: string;
}

export interface ConsensusResult {
  proposalId: string;
  status: 'SENTIENCE:APPROVED' | 'SENTIENCE:VETOED' | 'HUMAN:APPROVED' | 'HUMAN:VETOED' | 'EXPIRED';
  timestamp: number;
  details: {
    sentientVotes: Array<{ sentientId: string; vote: boolean; timestamp: number; reasoning?: string }>;
    humanDecision?: { decision: 'APPROVE' | 'VETO'; timestamp: number; reason?: string; voterId?: string };
    approvalRate: number;
    quorumReached: boolean;
    totalSentients: number;
    requiredQuorum: number;
    requiredApproval: number;
  };
}

export interface ConsensusHistoryEntry {
  proposalId: string;
  title: string;
  description: string;
  codeDiff?: string;
  status: string;
  timestamp: number;
  sentientVotes: Array<{ sentientId: string; vote: boolean; timestamp: number; reasoning?: string }>;
  humanDecision?: { decision: 'APPROVE' | 'VETO'; timestamp: number; reason?: string; voterId?: string };
  approvalRate: number;
  executionResult?: {
    success: boolean;
    timestamp: number;
    output?: string;
    error?: string;
  };
}

@Injectable()
export class ConsensusEngineService extends EventEmitter {
  private readonly logger = new Logger(ConsensusEngineService.name);
  private activeProposals: Map<string, ConsensusProposal> = new Map();
  private consensusResults: ConsensusResult[] = [];
  private consensusHistory: ConsensusHistoryEntry[] = [];
  private readonly historyFilePath: string;
  private readonly totalSentients: number = 3;
  private readonly quorumThreshold: number = 0.67;
  private readonly approvalThreshold: number = 0.67;

  constructor(private readonly telemetryService: TelemetryService) {
    super();
    this.historyFilePath = path.join(process.cwd(), 'data', 'consensus-history.json');
    this.loadConsensusHistory();
    this.startExpirationCheck();
  }

  async processSentientVoting(proposalId: string, vote: VoteRequest): Promise<ConsensusResult | null> {
    this.logger.log(`Processing sentient vote for proposal ${proposalId}`);

    const proposal = this.activeProposals.get(proposalId);
    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }

    if (proposal.status !== 'sentient_voting') {
      throw new Error('Sentient voting phase is not active');
    }

    // Check if sentient has already voted
    const existingVote = proposal.sentientVotes.find(v => v.sentientId === vote.voterId);
    if (existingVote) {
      throw new Error(`Sentient ${vote.voterId} has already voted on proposal ${proposalId}`);
    }

    // Add vote to proposal
    proposal.sentientVotes.push({
      sentientId: vote.voterId,
      vote: vote.vote,
      timestamp: Date.now(),
      reasoning: vote.reasoning,
    });

    // Emit vote event
    await this.telemetryService.logEvent('consensus', 'sentient_voted', {
      proposalId,
      sentientId: vote.voterId,
      vote: vote.vote,
      reasoning: vote.reasoning,
      timestamp: Date.now(),
    });

    // Check quorum and approval
    const approvalVotes = proposal.sentientVotes.filter(v => v.vote).length;
    const quorumReached = proposal.sentientVotes.length >= Math.ceil(this.totalSentients * this.quorumThreshold);
    const approvalRate = approvalVotes / proposal.sentientVotes.length;
    const requiredQuorum = Math.ceil(this.totalSentients * this.quorumThreshold);
    const requiredApproval = Math.ceil(this.totalSentients * this.approvalThreshold);

    if (quorumReached) {
      const approved = approvalVotes >= requiredApproval;
      
      const result: ConsensusResult = {
        proposalId,
        status: approved ? 'SENTIENCE:APPROVED' : 'SENTIENCE:VETOED',
        timestamp: Date.now(),
        details: {
          sentientVotes: proposal.sentientVotes,
          approvalRate,
          quorumReached: true,
          totalSentients: this.totalSentients,
          requiredQuorum,
          requiredApproval,
        },
      };

      this.consensusResults.push(result);

      if (approved) {
        proposal.status = 'human_voting';
        proposal.humanVotingStartTime = Date.now();
        
        // Emit sentient approval event
        await this.telemetryService.logEvent('consensus', 'sentient_approved', {
          proposalId,
          approvalRate,
          sentientVotes: proposal.sentientVotes,
          timestamp: Date.now(),
        });

        this.logger.log(`SENTIENCE:APPROVED - Proposal ${proposalId} approved by sentients (${approvalRate * 100}% approval)`);
      } else {
        proposal.status = 'vetoed';
        proposal.vetoedAt = Date.now();
        
        // Emit sentient veto event
        await this.telemetryService.logEvent('consensus', 'sentient_vetoed', {
          proposalId,
          approvalRate,
          sentientVotes: proposal.sentientVotes,
          timestamp: Date.now(),
        });

        this.logger.log(`SENTIENCE:VETOED - Proposal ${proposalId} vetoed by sentients (${approvalRate * 100}% approval)`);
      }

      // Emit consensus event
      this.emit('consensusResult', result);

      return result;
    }

    // Emit partial voting event
    await this.telemetryService.logEvent('consensus', 'sentient_voting_progress', {
      proposalId,
      votesReceived: proposal.sentientVotes.length,
      requiredQuorum,
      approvalRate,
      timestamp: Date.now(),
    });

    return null; // Quorum not yet reached
  }

  async processHumanVoting(proposalId: string, vote: VoteRequest): Promise<ConsensusResult> {
    this.logger.log(`Processing human vote for proposal ${proposalId}`);

    const proposal = this.activeProposals.get(proposalId);
    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }

    if (proposal.status !== 'human_voting') {
      throw new Error('Human voting phase is not active');
    }

    // Record human decision
    proposal.humanDecision = {
      decision: vote.vote ? 'APPROVE' : 'VETO',
      timestamp: Date.now(),
      reason: vote.reasoning,
      voterId: vote.voterId,
    };

    proposal.status = vote.vote ? 'approved' : 'vetoed';
    proposal.finalizedAt = Date.now();

    const result: ConsensusResult = {
      proposalId,
      status: vote.vote ? 'HUMAN:APPROVED' : 'HUMAN:VETOED',
      timestamp: Date.now(),
      details: {
        sentientVotes: proposal.sentientVotes,
        humanDecision: proposal.humanDecision,
        approvalRate: proposal.sentientVotes.filter(v => v.vote).length / proposal.sentientVotes.length,
        quorumReached: true,
        totalSentients: this.totalSentients,
        requiredQuorum: Math.ceil(this.totalSentients * this.quorumThreshold),
        requiredApproval: Math.ceil(this.totalSentients * this.approvalThreshold),
      },
    };

    this.consensusResults.push(result);

    // Add to consensus history
    await this.addToConsensusHistory(proposal, result);

    // Emit finalization event
    await this.emitFinalizationEvent(proposalId, vote.vote ? 'APPROVED' : 'VETOED', proposal);

    // Emit consensus event
    this.emit('consensusResult', result);

    this.logger.log(`${result.status} - Proposal ${proposalId} ${vote.vote ? 'approved' : 'vetoed'} by human`);

    return result;
  }

  async addProposal(proposal: ConsensusProposal): Promise<void> {
    this.logger.log(`Adding proposal ${proposal.id} to consensus engine`);
    
    proposal.status = 'sentient_voting';
    proposal.sentientVotingStartTime = Date.now();
    proposal.sentientVotes = [];
    
    this.activeProposals.set(proposal.id, proposal);

    // Emit proposal creation event
    await this.telemetryService.logEvent('consensus', 'proposal_created', {
      proposalId: proposal.id,
      title: proposal.title,
      description: proposal.description,
      agentId: proposal.agentId,
      timestamp: Date.now(),
    });

    // Emit proposal event
    this.emit('proposalCreated', proposal);
  }

  async getActiveProposals(): Promise<ConsensusProposal[]> {
    return Array.from(this.activeProposals.values());
  }

  async getProposal(proposalId: string): Promise<ConsensusProposal | null> {
    return this.activeProposals.get(proposalId) || null;
  }

  async getConsensusResults(): Promise<ConsensusResult[]> {
    return this.consensusResults;
  }

  async getProposalsForHumanVoting(): Promise<ConsensusProposal[]> {
    return Array.from(this.activeProposals.values()).filter(p => p.status === 'human_voting');
  }

  async getConsensusHistory(): Promise<ConsensusHistoryEntry[]> {
    return this.consensusHistory;
  }

  private async addToConsensusHistory(proposal: ConsensusProposal, result: ConsensusResult): Promise<void> {
    const historyEntry: ConsensusHistoryEntry = {
      proposalId: proposal.id,
      title: proposal.title,
      description: proposal.description,
      codeDiff: proposal.codeDiff,
      status: result.status,
      timestamp: result.timestamp,
      sentientVotes: result.details.sentientVotes,
      humanDecision: result.details.humanDecision,
      approvalRate: result.details.approvalRate,
    };

    this.consensusHistory.push(historyEntry);
    await this.saveConsensusHistory();
  }

  private async loadConsensusHistory(): Promise<void> {
    try {
      const data = await fs.readFile(this.historyFilePath, 'utf8');
      this.consensusHistory = JSON.parse(data);
      this.logger.log(`Loaded ${this.consensusHistory.length} consensus history entries`);
    } catch (error) {
      this.logger.warn(`Could not load consensus history: ${error.message}`);
      this.consensusHistory = [];
    }
  }

  private async saveConsensusHistory(): Promise<void> {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.historyFilePath);
      await fs.mkdir(dir, { recursive: true });
      
      await fs.writeFile(this.historyFilePath, JSON.stringify(this.consensusHistory, null, 2));
      this.logger.debug(`Saved consensus history with ${this.consensusHistory.length} entries`);
    } catch (error) {
      this.logger.error(`Failed to save consensus history: ${error.message}`);
    }
  }

  private async emitFinalizationEvent(proposalId: string, status: 'APPROVED' | 'VETOED', proposal: ConsensusProposal): Promise<void> {
    this.logger.log(`Emitting finalization event for proposal ${proposalId}: ${status}`);

    const finalizationEvent = {
      proposalId,
      status,
      title: proposal.title,
      description: proposal.description,
      codeDiff: proposal.codeDiff,
      instructions: status === 'APPROVED' 
        ? 'Execute the proposed changes according to the approved code diff'
        : 'Reject the proposed changes and maintain current system state',
      sentientVotes: proposal.sentientVotes,
      humanDecision: proposal.humanDecision,
      timestamp: Date.now(),
    };

    // Emit telemetry event
    await this.telemetryService.logEvent('consensus', 'proposal_finalized', finalizationEvent);

    // Emit to event system
    this.emit('proposalFinalized', finalizationEvent);

    this.logger.log(`Finalization event: ${JSON.stringify(finalizationEvent)}`);
  }

  private startExpirationCheck(): void {
    setInterval(() => {
      this.checkExpiredProposals();
    }, 60000); // Check every minute
  }

  private async checkExpiredProposals(): Promise<void> {
    const now = Date.now();
    const sentientVotingTimeout = 30 * 60 * 1000; // 30 minutes
    const humanVotingTimeout = 24 * 60 * 60 * 1000; // 24 hours

    for (const [proposalId, proposal] of this.activeProposals.entries()) {
      if (proposal.status === 'sentient_voting' && 
          proposal.sentientVotingStartTime && 
          (now - proposal.sentientVotingStartTime) > sentientVotingTimeout) {
        
        await this.expireProposal(proposalId, 'sentient_voting_timeout');
      } else if (proposal.status === 'human_voting' && 
                 proposal.humanVotingStartTime && 
                 (now - proposal.humanVotingStartTime) > humanVotingTimeout) {
        
        await this.expireProposal(proposalId, 'human_voting_timeout');
      }
    }
  }

  private async expireProposal(proposalId: string, reason: string): Promise<void> {
    const proposal = this.activeProposals.get(proposalId);
    if (!proposal) return;

    proposal.status = 'expired';
    proposal.expiredAt = Date.now();
    proposal.expirationReason = reason;

    const result: ConsensusResult = {
      proposalId,
      status: 'EXPIRED',
      timestamp: Date.now(),
      details: {
        sentientVotes: proposal.sentientVotes,
        approvalRate: proposal.sentientVotes.filter(v => v.vote).length / proposal.sentientVotes.length,
        quorumReached: false,
        totalSentients: this.totalSentients,
        requiredQuorum: Math.ceil(this.totalSentients * this.quorumThreshold),
        requiredApproval: Math.ceil(this.totalSentients * this.approvalThreshold),
      },
    };

    this.consensusResults.push(result);
    await this.addToConsensusHistory(proposal, result);

    // Emit expiration event
    await this.telemetryService.logEvent('consensus', 'proposal_expired', {
      proposalId,
      reason,
      timestamp: Date.now(),
    });

    this.emit('proposalExpired', { proposalId, reason, timestamp: Date.now() });

    this.logger.log(`Proposal ${proposalId} expired: ${reason}`);
  }

  async getConsensusStatistics(): Promise<any> {
    const totalProposals = this.consensusResults.length;
    const approvedProposals = this.consensusResults.filter(r => 
      r.status === 'SENTIENCE:APPROVED' || r.status === 'HUMAN:APPROVED'
    ).length;
    const vetoedProposals = this.consensusResults.filter(r => 
      r.status === 'SENTIENCE:VETOED' || r.status === 'HUMAN:VETOED'
    ).length;
    const expiredProposals = this.consensusResults.filter(r => r.status === 'EXPIRED').length;

    const last24Hours = Date.now() - (24 * 60 * 60 * 1000);
    const recentProposals = this.consensusResults.filter(r => r.timestamp >= last24Hours);

    return {
      totalProposals,
      approvedProposals,
      vetoedProposals,
      expiredProposals,
      approvalRate: totalProposals > 0 ? approvedProposals / totalProposals : 0,
      averageSentientApprovalRate: this.calculateAverageSentientApprovalRate(),
      recentProposals: recentProposals.length,
      activeProposals: this.activeProposals.size,
      timestamp: Date.now(),
    };
  }

  private calculateAverageSentientApprovalRate(): number {
    const sentientResults = this.consensusResults.filter(r => 
      r.status === 'SENTIENCE:APPROVED' || r.status === 'SENTIENCE:VETOED'
    );

    if (sentientResults.length === 0) return 0;

    const totalApprovalRate = sentientResults.reduce((sum, result) => 
      sum + result.details.approvalRate, 0
    );

    return totalApprovalRate / sentientResults.length;
  }

  async executeApprovedProposal(proposalId: string): Promise<any> {
    const proposal = this.activeProposals.get(proposalId);
    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }

    if (proposal.status !== 'approved') {
      throw new Error(`Proposal ${proposalId} is not approved for execution`);
    }

    try {
      // Execute the code changes
      const executionResult = await this.executeCodeChanges(proposal.codeDiff);
      
      // Update consensus history with execution result
      const historyEntry = this.consensusHistory.find(h => h.proposalId === proposalId);
      if (historyEntry) {
        historyEntry.executionResult = {
          success: true,
          timestamp: Date.now(),
          output: executionResult.output,
        };
        await this.saveConsensusHistory();
      }

      // Emit execution success event
      await this.telemetryService.logEvent('consensus', 'proposal_executed', {
        proposalId,
        success: true,
        output: executionResult.output,
        timestamp: Date.now(),
      });

      return executionResult;

    } catch (error) {
      // Update consensus history with execution error
      const historyEntry = this.consensusHistory.find(h => h.proposalId === proposalId);
      if (historyEntry) {
        historyEntry.executionResult = {
          success: false,
          timestamp: Date.now(),
          error: error.message,
        };
        await this.saveConsensusHistory();
      }

      // Emit execution failure event
      await this.telemetryService.logEvent('consensus', 'proposal_execution_failed', {
        proposalId,
        error: error.message,
        timestamp: Date.now(),
      });

      throw error;
    }
  }

  private async executeCodeChanges(codeDiff: string): Promise<any> {
    // This is a placeholder for actual code execution
    // In a real implementation, this would apply the code changes safely
    this.logger.log(`Executing code changes for proposal`);
    
    // Simulate execution
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      output: 'Code changes applied successfully',
      filesModified: ['src/main.ts', 'src/app.service.ts'],
      timestamp: Date.now(),
    };
  }
} 