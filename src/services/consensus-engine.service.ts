import { Injectable, Logger } from '@nestjs/common';
import { ConsensusProposal, VoteRequest } from '../controllers/chat.controller.js';

export interface ConsensusResult {
  proposalId: string;
  status: 'SENTIENCE:APPROVED' | 'SENTIENCE:VETOED' | 'HUMAN:APPROVED' | 'HUMAN:VETOED';
  timestamp: number;
  details: {
    sentientVotes: Array<{ sentientId: string; vote: boolean; timestamp: number }>;
    humanDecision?: { decision: 'APPROVE' | 'VETO'; timestamp: number; reason?: string };
    approvalRate: number;
    quorumReached: boolean;
  };
}

@Injectable()
export class ConsensusEngineService {
  private readonly logger = new Logger(ConsensusEngineService.name);
  private activeProposals: Map<string, ConsensusProposal> = new Map();
  private consensusResults: ConsensusResult[] = [];

  async processSentientVoting(proposalId: string, vote: VoteRequest): Promise<ConsensusResult | null> {
    this.logger.log(`Processing sentient vote for proposal ${proposalId}`);

    const proposal = this.activeProposals.get(proposalId);
    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }

    if (proposal.status !== 'sentient_voting') {
      throw new Error('Sentient voting phase is not active');
    }

    // Add vote to proposal
    proposal.sentientVotes.push({
      sentientId: vote.voterId,
      vote: vote.vote,
      timestamp: Date.now(),
    });

    // Check quorum and approval
    const totalSentients = 3; // Mock total sentients
    const approvalVotes = proposal.sentientVotes.filter(v => v.vote).length;
    const quorumReached = proposal.sentientVotes.length >= Math.ceil(totalSentients * 0.67);
    const approvalRate = approvalVotes / proposal.sentientVotes.length;

    if (quorumReached) {
      const approved = approvalVotes >= Math.ceil(totalSentients * 0.67);
      
      const result: ConsensusResult = {
        proposalId,
        status: approved ? 'SENTIENCE:APPROVED' : 'SENTIENCE:VETOED',
        timestamp: Date.now(),
        details: {
          sentientVotes: proposal.sentientVotes,
          approvalRate,
          quorumReached: true,
        },
      };

      this.consensusResults.push(result);

      if (approved) {
        proposal.status = 'human_voting';
        this.logger.log(`SENTIENCE:APPROVED - Proposal ${proposalId} approved by sentients`);
      } else {
        proposal.status = 'vetoed';
        this.logger.log(`SENTIENCE:VETOED - Proposal ${proposalId} vetoed by sentients`);
      }

      return result;
    }

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
    };

    proposal.status = vote.vote ? 'approved' : 'vetoed';

    const result: ConsensusResult = {
      proposalId,
      status: vote.vote ? 'HUMAN:APPROVED' : 'HUMAN:VETOED',
      timestamp: Date.now(),
      details: {
        sentientVotes: proposal.sentientVotes,
        humanDecision: proposal.humanDecision,
        approvalRate: proposal.sentientVotes.filter(v => v.vote).length / proposal.sentientVotes.length,
        quorumReached: true,
      },
    };

    this.consensusResults.push(result);

    // Emit finalization event for agents
    await this.emitFinalizationEvent(proposalId, vote.vote ? 'APPROVED' : 'VETOED');

    this.logger.log(`${result.status} - Proposal ${proposalId} ${vote.vote ? 'approved' : 'vetoed'} by human`);

    return result;
  }

  async addProposal(proposal: ConsensusProposal): Promise<void> {
    this.logger.log(`Adding proposal ${proposal.id} to consensus engine`);
    this.activeProposals.set(proposal.id, proposal);
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

  private async emitFinalizationEvent(proposalId: string, status: 'APPROVED' | 'VETOED'): Promise<void> {
    this.logger.log(`Emitting finalization event for proposal ${proposalId}: ${status}`);

    // In a real implementation, this would emit to a message queue or WebSocket
    // For now, we'll log the event
    const finalizationEvent = {
      proposalId,
      status,
      instructions: status === 'APPROVED' 
        ? 'Execute the proposed changes according to the approved code diff'
        : 'Reject the proposed changes and maintain current system state',
      timestamp: Date.now(),
    };

    this.logger.log(`Finalization event: ${JSON.stringify(finalizationEvent)}`);
  }

  async getConsensusStatistics(): Promise<any> {
    const totalProposals = this.consensusResults.length;
    const approvedProposals = this.consensusResults.filter(r => 
      r.status === 'SENTIENCE:APPROVED' || r.status === 'HUMAN:APPROVED'
    ).length;
    const vetoedProposals = this.consensusResults.filter(r => 
      r.status === 'SENTIENCE:VETOED' || r.status === 'HUMAN:VETOED'
    ).length;

    return {
      totalProposals,
      approvedProposals,
      vetoedProposals,
      approvalRate: totalProposals > 0 ? approvedProposals / totalProposals : 0,
      averageSentientApprovalRate: this.calculateAverageSentientApprovalRate(),
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
} 