export const placeholder = true;
import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Param,
} from "@nestjs/common";
import { JwtAuthGuard } from "../guards/jwt-auth.guard.js";
import { ConsensusService } from "../services/consensus.service.js";
import { UserRoleService } from "../services/user-role.service.js";
import { TelemetryService } from "../services/telemetry.service.js";
import { ProposalService, Proposal } from "../services/proposal.service.js";
import * as fs from "fs";
import * as path from "path";

interface VoteDto {
  proposalId: string;
  vote: "approve" | "veto";
  reason?: string;
}

interface CreateProposalDto {
  title: string;
  summary: string;
  details: string;
  trainingData?: string;
  metrics?: Record<string, any>;
  ethicsReview?: string;
}

interface ConsensusMetricsResponse {
  humanVotes: {
    total: number;
    approve: number;
    veto: number;
  };
  sentientVotes: {
    total: number;
    approve: number;
    veto: number;
  };
  trustScores: {
    human: number;
    sentient: number;
    overall: number;
  };
  entropy: number;
  lastUpdated: Date;
}

@Controller("consensus")
@UseGuards(JwtAuthGuard)
export class ConsensusController {
  constructor(
    private readonly consensusService: ConsensusService,
    private readonly userRoleService: UserRoleService,
    private readonly telemetryService: TelemetryService,
    private readonly proposalService: ProposalService,
  ) {}

  @Post("create")
  async createProposal(@Request() req, @Body() createDto: CreateProposalDto) {
    try {
      const userId = req.user.id;
      const proposalId = `proposal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const proposal: Proposal = {
        id: proposalId,
        title: createDto.title,
        summary: createDto.summary,
        details: createDto.details,
        status: 'pending',
        consensus: 'pending',
        timestamp: new Date().toISOString(),
        trainingData: createDto.trainingData,
        metrics: createDto.metrics,
        ethicsReview: createDto.ethicsReview
      };

      const created = await this.proposalService.createProposal(proposal);
      
      // Log to audit log
      await this.logAuditAction('create', userId, proposalId, proposal);
      
      // Log telemetry
      await this.telemetryService.logEvent(
        "consensus",
        "proposal_created",
        {
          userId,
          proposalId,
          title: proposal.title,
          timestamp: Date.now(),
        },
      );

      return created;
    } catch (error) {
      await this.logAuditAction('create_error', req.user?.id, 'unknown', { error: error.message });
      throw new HttpException(
        "Failed to create proposal",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("vote/:proposalId")
  async voteOnProposal(
    @Request() req,
    @Param('proposalId') proposalId: string,
    @Body() voteDto: VoteDto
  ) {
    try {
      const userId = req.user.id;
      
      // Validate proposal exists
      const proposal = await this.proposalService.getProposalById(proposalId);
      if (!proposal) {
        throw new HttpException("Proposal not found", HttpStatus.NOT_FOUND);
      }

      // Submit vote based on user role
      const userRole = await this.userRoleService.getUserRole(userId);
      let result;
      
      if (userRole === "human-consensus") {
        result = await this.consensusService.submitHumanVote(
          userId,
          proposalId,
          voteDto.vote,
          voteDto.reason,
        );
      } else if (userRole === "agent-view") {
        result = await this.consensusService.submitSentientVote(
          userId,
          proposalId,
          voteDto.vote,
          voteDto.reason,
        );
      } else {
        throw new HttpException(
          "User does not have consensus voting privileges",
          HttpStatus.FORBIDDEN,
        );
      }

      // Log to audit log
      await this.logAuditAction('vote', userId, proposalId, {
        vote: voteDto.vote,
        reason: voteDto.reason,
        userRole
      });

      // Log telemetry
      await this.telemetryService.logEvent(
        "consensus",
        "vote_submitted",
        {
          userId,
          proposalId,
          vote: voteDto.vote,
          reason: voteDto.reason,
          userRole,
          timestamp: Date.now(),
        },
      );

      return result;
    } catch (error) {
      await this.logAuditAction('vote_error', req.user?.id, proposalId, { error: error.message });
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to submit vote",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("tally/:proposalId")
  async tallyVotes(@Param('proposalId') proposalId: string) {
    try {
      // Get proposal details
      const proposal = await this.proposalService.getProposalById(proposalId);
      if (!proposal) {
        throw new HttpException("Proposal not found", HttpStatus.NOT_FOUND);
      }

      // Get consensus metrics
      const metrics = await this.consensusService.getConsensusMetrics();
      
      // Determine consensus status
      let consensusStatus = 'pending';
      if (metrics.humanVotes.total > 0 && metrics.sentientVotes.total > 0) {
        const humanApprovalRate = metrics.humanVotes.approve / metrics.humanVotes.total;
        const sentientApprovalRate = metrics.sentientVotes.approve / metrics.sentientVotes.total;
        
        if (humanApprovalRate >= 0.5 && sentientApprovalRate >= 0.5) {
          consensusStatus = 'approved';
          // Update proposal status
          await this.proposalService.updateProposal(proposalId, {
            status: 'approved',
            consensus: 'approved'
          });
        } else if (humanApprovalRate < 0.5 || sentientApprovalRate < 0.5) {
          consensusStatus = 'rejected';
          await this.proposalService.updateProposal(proposalId, {
            status: 'rejected',
            consensus: 'pending'
          });
        }
      }

      const tally = {
        proposalId,
        proposal: proposal,
        metrics,
        consensusStatus,
        timestamp: new Date().toISOString()
      };

      // Log to audit log
      await this.logAuditAction('tally', 'system', proposalId, tally);

      return tally;
    } catch (error) {
      await this.logAuditAction('tally_error', 'system', proposalId, { error: error.message });
      throw new HttpException(
        "Failed to tally votes",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("proposals")
  async getAllProposals() {
    try {
      const proposals = await this.proposalService.getAllProposals();
      return {
        proposals,
        count: proposals.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new HttpException(
        "Failed to retrieve proposals",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("proposals/:proposalId")
  async getProposal(@Param('proposalId') proposalId: string) {
    try {
      const proposal = await this.proposalService.getProposalById(proposalId);
      if (!proposal) {
        throw new HttpException("Proposal not found", HttpStatus.NOT_FOUND);
      }
      return proposal;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Failed to retrieve proposal",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("vote-tallies")
  async getVoteTallies(@Request() req): Promise<any[]> {
    try {
      const userId = req.user.id;
      const userRole = await this.userRoleService.getUserRole(userId);

      const tallies = await this.consensusService.getVoteTallies(userRole);
      return tallies;
    } catch (error) {
      throw new HttpException(
        "Failed to retrieve vote tallies",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Log audit actions to append-only audit log
   */
  private async logAuditAction(
    action: string,
    userId: string,
    proposalId: string,
    data: any
  ): Promise<void> {
    try {
      const auditLogPath = path.join(process.cwd(), 'iaai', 'audit.log');
      const auditEntry = {
        timestamp: new Date().toISOString(),
        action,
        userId,
        proposalId,
        data,
        requestId: Math.random().toString(36).substr(2, 9)
      };

      const logLine = JSON.stringify(auditEntry) + '\n';
      
      // Ensure directory exists
      const logDir = path.dirname(auditLogPath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      // Append to audit log
      fs.appendFileSync(auditLogPath, logLine);
      
    } catch (error) {
      console.error('Failed to log audit action:', error);
      // Don't throw - audit logging failure shouldn't break main functionality
    }
  }
}
