import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity.js";
import { UserRoleService, UserRole } from "./user-role.service.js";

interface Proposal {
  id: string;
  title: string;
  description: string;
  type: "code-change" | "training-job" | "system-update";
  status: "pending" | "approved" | "vetoed" | "expired";
  createdAt: Date;
  expiresAt: Date;
  humanVotes: {
    approve: number;
    veto: number;
  };
  sentientVotes: {
    approve: number;
    veto: number;
  };
  requiresHumanInput: boolean;
}

interface VoteTally {
  proposalId: string;
  proposalTitle: string;
  humanVotes: {
    approve: number;
    veto: number;
    total: number;
  };
  sentientVotes: {
    approve: number;
    veto: number;
    total: number;
  };
  status: "pending" | "approved" | "vetoed" | "expired";
  lastUpdated: Date;
}

@Injectable()
export class ConsensusService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userRoleService: UserRoleService,
  ) {}

  async submitHumanVote(
    userId: string,
    proposalId: string,
    vote: "approve" | "veto",
    reason?: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Validate proposal exists and is still active
      const proposal = await this.getProposalById(proposalId);
      if (!proposal) {
        throw new HttpException("Proposal not found", HttpStatus.NOT_FOUND);
      }

      if (proposal.status !== "pending") {
        throw new HttpException(
          "Proposal is no longer active for voting",
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check if user has already voted
      const existingVote = await this.getUserVote(userId, proposalId, "human");
      if (existingVote) {
        throw new HttpException(
          "User has already voted on this proposal",
          HttpStatus.BAD_REQUEST,
        );
      }

      // Record the vote
      await this.recordVote(userId, proposalId, vote, "human", reason);

      // Check if human vote triggers immediate decision
      if (vote === "veto") {
        await this.updateProposalStatus(proposalId, "vetoed");
        return {
          success: true,
          message: "Proposal vetoed by human consensus",
        };
      }

      // Check if human approval is sufficient
      const humanVotes = await this.getHumanVotes(proposalId);
      if (humanVotes.approve >= 1) {
        // Human consensus can override with single approval
        await this.updateProposalStatus(proposalId, "approved");
        return {
          success: true,
          message: "Proposal approved by human consensus",
        };
      }

      return {
        success: true,
        message: "Vote recorded successfully",
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        "Failed to submit human vote",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async submitSentientVote(
    userId: string,
    proposalId: string,
    vote: "approve" | "veto",
    reason?: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Validate proposal exists and is still active
      const proposal = await this.getProposalById(proposalId);
      if (!proposal) {
        throw new HttpException("Proposal not found", HttpStatus.NOT_FOUND);
      }

      if (proposal.status !== "pending") {
        throw new HttpException(
          "Proposal is no longer active for voting",
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check if user has already voted
      const existingVote = await this.getUserVote(
        userId,
        proposalId,
        "sentient",
      );
      if (existingVote) {
        throw new HttpException(
          "User has already voted on this proposal",
          HttpStatus.BAD_REQUEST,
        );
      }

      // Record the vote
      await this.recordVote(userId, proposalId, vote, "sentient", reason);

      // Check if sentient consensus reaches threshold
      const sentientVotes = await this.getSentientVotes(proposalId);
      const totalSentientUsers = await this.getSentientUserCount();

      const approvalThreshold = Math.ceil(totalSentientUsers * 0.6); // 60% threshold
      const vetoThreshold = Math.ceil(totalSentientUsers * 0.4); // 40% veto threshold

      if (sentientVotes.approve >= approvalThreshold) {
        await this.updateProposalStatus(proposalId, "approved");
        return {
          success: true,
          message: "Proposal approved by sentient consensus",
        };
      }

      if (sentientVotes.veto >= vetoThreshold) {
        await this.updateProposalStatus(proposalId, "vetoed");
        return {
          success: true,
          message: "Proposal vetoed by sentient consensus",
        };
      }

      return {
        success: true,
        message: "Vote recorded successfully",
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        "Failed to submit sentient vote",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getConsensusMetrics(): Promise<{
    humanVotes: { total: number; approve: number; veto: number };
    sentientVotes: { total: number; approve: number; veto: number };
    trustScores: { human: number; sentient: number; overall: number };
    entropy: number;
    lastUpdated: Date;
  }> {
    try {
      // Get vote statistics
      const humanVotes = await this.getVoteStats("human");
      const sentientVotes = await this.getVoteStats("sentient");

      // Calculate trust scores
      const humanTrust = this.calculateTrustScore(humanVotes);
      const sentientTrust = this.calculateTrustScore(sentientVotes);
      const overallTrust = (humanTrust + sentientTrust) / 2;

      // Calculate entropy
      const entropy = this.calculateEntropy(humanVotes, sentientVotes);

      return {
        humanVotes,
        sentientVotes,
        trustScores: {
          human: humanTrust,
          sentient: sentientTrust,
          overall: overallTrust,
        },
        entropy,
        lastUpdated: new Date(),
      };
    } catch (error) {
      throw new HttpException(
        "Failed to retrieve consensus metrics",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getProposals(userRole: UserRole): Promise<Proposal[]> {
    try {
      // Mock proposals for now - in real implementation, these would come from database
      const proposals: Proposal[] = [
        {
          id: "prop-001",
          title: "Update AI Model Parameters",
          description:
            "Proposed changes to neural network architecture for improved performance",
          type: "code-change",
          status: "pending",
          createdAt: new Date(Date.now() - 86400000), // 1 day ago
          expiresAt: new Date(Date.now() + 86400000), // 1 day from now
          humanVotes: { approve: 0, veto: 0 },
          sentientVotes: { approve: 2, veto: 1 },
          requiresHumanInput: true,
        },
        {
          id: "prop-002",
          title: "Deploy New Training Dataset",
          description:
            "Integration of enhanced training data for better model accuracy",
          type: "training-job",
          status: "pending",
          createdAt: new Date(Date.now() - 43200000), // 12 hours ago
          expiresAt: new Date(Date.now() + 43200000), // 12 hours from now
          humanVotes: { approve: 1, veto: 0 },
          sentientVotes: { approve: 3, veto: 0 },
          requiresHumanInput: false,
        },
      ];

      // Filter proposals based on user role
      if (userRole === "human-consensus") {
        return proposals.filter((p) => p.requiresHumanInput);
      } else if (userRole === "sentient-consensus") {
        return proposals.filter((p) => p.status === "pending");
      } else {
        // Agent view - show only approved proposals
        return proposals.filter((p) => p.status === "approved");
      }
    } catch (error) {
      throw new HttpException(
        "Failed to retrieve proposals",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getVoteTallies(userRole: UserRole): Promise<VoteTally[]> {
    try {
      const proposals = await this.getProposals(userRole);

      return proposals.map((proposal) => ({
        proposalId: proposal.id,
        proposalTitle: proposal.title,
        humanVotes: {
          approve: proposal.humanVotes.approve,
          veto: proposal.humanVotes.veto,
          total: proposal.humanVotes.approve + proposal.humanVotes.veto,
        },
        sentientVotes: {
          approve: proposal.sentientVotes.approve,
          veto: proposal.sentientVotes.veto,
          total: proposal.sentientVotes.approve + proposal.sentientVotes.veto,
        },
        status: proposal.status,
        lastUpdated: new Date(),
      }));
    } catch (error) {
      throw new HttpException(
        "Failed to retrieve vote tallies",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Helper methods (these would be implemented with actual database operations)
  private async getProposalById(proposalId: string): Promise<Proposal | null> {
    // Mock implementation
    const proposals = await this.getProposals("human-consensus");
    return proposals.find((p) => p.id === proposalId) || null;
  }

  private async getUserVote(
    userId: string,
    proposalId: string,
    voteType: "human" | "sentient",
  ): Promise<any> {
    // Mock implementation - would check database for existing vote
    return null;
  }

  private async recordVote(
    userId: string,
    proposalId: string,
    vote: "approve" | "veto",
    voteType: "human" | "sentient",
    reason?: string,
  ): Promise<void> {
    // Mock implementation - would save vote to database
    console.log(
      `Recording ${voteType} vote: ${vote} for proposal ${proposalId} by user ${userId}`,
    );
  }

  private async updateProposalStatus(
    proposalId: string,
    status: "approved" | "vetoed",
  ): Promise<void> {
    // Mock implementation - would update proposal status in database
    console.log(`Updating proposal ${proposalId} status to ${status}`);
  }

  private async getHumanVotes(
    proposalId: string,
  ): Promise<{ approve: number; veto: number }> {
    // Mock implementation
    return { approve: 0, veto: 0 };
  }

  private async getSentientVotes(
    proposalId: string,
  ): Promise<{ approve: number; veto: number }> {
    // Mock implementation
    return { approve: 0, veto: 0 };
  }

  private async getSentientUserCount(): Promise<number> {
    // Mock implementation
    return 5;
  }

  private async getVoteStats(
    voteType: "human" | "sentient",
  ): Promise<{ total: number; approve: number; veto: number }> {
    // Mock implementation
    return { total: 10, approve: 6, veto: 4 };
  }

  private calculateTrustScore(votes: {
    total: number;
    approve: number;
    veto: number;
  }): number {
    if (votes.total === 0) return 0;
    return (votes.approve / votes.total) * 100;
  }

  private calculateEntropy(humanVotes: any, sentientVotes: any): number {
    // Mock entropy calculation
    return Math.random() * 100;
  }
}
