import { Controller, Post, Get, Body, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ConsensusService } from '../services/consensus.service';
import { UserRoleService } from '../services/user-role.service';
import { TelemetryService } from '../services/telemetry.service';

interface VoteDto {
  proposalId: string;
  vote: 'approve' | 'veto';
  reason?: string;
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

@Controller('v1/consensus')
@UseGuards(JwtAuthGuard)
export class ConsensusController {
  constructor(
    private readonly consensusService: ConsensusService,
    private readonly userRoleService: UserRoleService,
    private readonly telemetryService: TelemetryService
  ) {}

  @Post('human-vote')
  async humanVote(@Request() req, @Body() voteDto: VoteDto) {
    try {
      const userId = req.user.id;
      
      // Validate user has human consensus role
      const userRole = await this.userRoleService.getUserRole(userId);
      if (userRole !== 'human-consensus') {
        throw new HttpException(
          'Only human consensus users can vote on this endpoint',
          HttpStatus.FORBIDDEN
        );
      }

      const result = await this.consensusService.submitHumanVote(
        userId,
        voteDto.proposalId,
        voteDto.vote,
        voteDto.reason
      );

      // Log telemetry
      await this.telemetryService.logEvent({
        event: 'human_vote_submitted',
        type: 'consensus_vote',
        userId,
        timestamp: Date.now(),
        data: {
          proposalId: voteDto.proposalId,
          vote: voteDto.vote,
          reason: voteDto.reason
        }
      });

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to submit human vote',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('sentient-vote')
  async sentientVote(@Request() req, @Body() voteDto: VoteDto) {
    try {
      const userId = req.user.id;
      
      // Validate user has sentient consensus role
      const userRole = await this.userRoleService.getUserRole(userId);
      if (userRole !== 'sentient-consensus') {
        throw new HttpException(
          'Only sentient consensus users can vote on this endpoint',
          HttpStatus.FORBIDDEN
        );
      }

      const result = await this.consensusService.submitSentientVote(
        userId,
        voteDto.proposalId,
        voteDto.vote,
        voteDto.reason
      );

      // Log telemetry
      await this.telemetryService.logEvent({
        event: 'sentient_vote_submitted',
        type: 'consensus_vote',
        userId,
        timestamp: Date.now(),
        data: {
          proposalId: voteDto.proposalId,
          vote: voteDto.vote,
          reason: voteDto.reason
        }
      });

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to submit sentient vote',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('metrics')
  async getConsensusMetrics(): Promise<ConsensusMetricsResponse> {
    try {
      const metrics = await this.consensusService.getConsensusMetrics();
      return metrics;
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve consensus metrics',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('proposals')
  async getProposals(@Request() req) {
    try {
      const userId = req.user.id;
      const userRole = await this.userRoleService.getUserRole(userId);
      
      const proposals = await this.consensusService.getProposals(userRole);
      return proposals;
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve proposals',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('vote-tallies')
  async getVoteTallies(@Request() req) {
    try {
      const userId = req.user.id;
      const userRole = await this.userRoleService.getUserRole(userId);
      
      const tallies = await this.consensusService.getVoteTallies(userRole);
      return tallies;
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve vote tallies',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 