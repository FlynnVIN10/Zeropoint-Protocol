// Zeropoint Protocol - Petals Orchestrator Service
// Manages proposal lifecycle, voting, and consensus

class PetalsOrchestrator {
  constructor() {
    this.proposals = new Map();
    this.votes = new Map(); // proposalId -> votes[]
    this.nextProposalId = 1;
  }

  // Submit a new proposal
  async submitProposal(title, description, proposalType, synthientApproval = false) {
    const proposalId = `prop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const proposal = {
      id: proposalId,
      title: title.trim(),
      description: description.trim(),
      proposalType: proposalType,
      status: 'submitted',
      synthientApproval: synthientApproval,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'system', // In production, this would be the authenticated user
      votes: {
        yes: 0,
        no: 0,
        abstain: 0
      },
      votingEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };

    this.proposals.set(proposalId, proposal);
    this.votes.set(proposalId, []);

    return {
      proposalId: proposalId,
      status: 'submitted',
      message: 'Proposal submitted successfully',
      votingEndsAt: proposal.votingEndsAt
    };
  }

  // Get proposal status
  async getProposalStatus(proposalId) {
    const proposal = this.proposals.get(proposalId);

    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }

    const votes = this.votes.get(proposalId) || [];
    const voteCounts = votes.reduce((acc, vote) => {
      acc[vote.decision] = (acc[vote.decision] || 0) + 1;
      return acc;
    }, { yes: 0, no: 0, abstain: 0 });

    // Update proposal with current vote counts
    proposal.votes = voteCounts;

    return {
      proposalId: proposal.id,
      title: proposal.title,
      description: proposal.description,
      status: proposal.status,
      votes: proposal.votes,
      totalVotes: votes.length,
      createdAt: proposal.createdAt,
      votingEndsAt: proposal.votingEndsAt,
      timeRemaining: Math.max(0, new Date(proposal.votingEndsAt) - new Date())
    };
  }

  // Cast a vote on a proposal
  async castVote(proposalId, voterId, decision) {
    const proposal = this.proposals.get(proposalId);

    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }

    if (proposal.status !== 'submitted') {
      throw new Error(`Proposal ${proposalId} is not open for voting`);
    }

    // Check if voting period has ended
    if (new Date() > new Date(proposal.votingEndsAt)) {
      throw new Error(`Voting period for proposal ${proposalId} has ended`);
    }

    // Check if voter has already voted (in production, this would be more sophisticated)
    const existingVotes = this.votes.get(proposalId) || [];
    const hasVoted = existingVotes.some(vote => vote.voterId === voterId);

    if (hasVoted) {
      throw new Error(`Voter ${voterId} has already voted on proposal ${proposalId}`);
    }

    // Cast the vote
    const vote = {
      proposalId: proposalId,
      voterId: voterId,
      decision: decision,
      timestamp: new Date().toISOString(),
      voterType: 'human' // In production, this could be 'synthient' or 'human'
    };

    existingVotes.push(vote);
    this.votes.set(proposalId, existingVotes);

    return {
      proposalId: proposalId,
      voteId: `${proposalId}-${voterId}`,
      decision: decision,
      message: 'Vote cast successfully'
    };
  }

  // Tally votes for a proposal
  async tallyVotes(proposalId) {
    const proposal = this.proposals.get(proposalId);

    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }

    const votes = this.votes.get(proposalId) || [];
    const voteCounts = votes.reduce((acc, vote) => {
      acc[vote.decision] = (acc[vote.decision] || 0) + 1;
      return acc;
    }, { yes: 0, no: 0, abstain: 0 });

    // Determine if voting period has ended
    const votingEnded = new Date() > new Date(proposal.votingEndsAt);

    let finalDecision = null;
    if (votingEnded && votes.length > 0) {
      // Simple majority (excluding abstains)
      const totalVotes = voteCounts.yes + voteCounts.no;
      if (voteCounts.yes > voteCounts.no) {
        finalDecision = 'approved';
        proposal.status = 'approved';
      } else if (voteCounts.no > voteCounts.yes) {
        finalDecision = 'rejected';
        proposal.status = 'rejected';
      } else {
        finalDecision = 'tie';
        proposal.status = 'tie';
      }
    }

    return {
      proposalId: proposal.id,
      title: proposal.title,
      voteCounts: voteCounts,
      totalVotes: votes.length,
      votingEnded: votingEnded,
      finalDecision: finalDecision,
      result: finalDecision
    };
  }

  // List all proposals
  async listProposals(status = null, limit = 10) {
    const allProposals = Array.from(this.proposals.values());

    let filteredProposals = allProposals;
    if (status) {
      filteredProposals = allProposals.filter(proposal => proposal.status === status);
    }

    // Sort by creation date (newest first)
    filteredProposals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return {
      proposals: filteredProposals.slice(0, limit).map(proposal => ({
        id: proposal.id,
        title: proposal.title,
        status: proposal.status,
        createdAt: proposal.createdAt,
        votes: proposal.votes,
        votingEndsAt: proposal.votingEndsAt
      })),
      total: filteredProposals.length,
      status: status || 'all'
    };
  }

  // Get service health
  async getHealth() {
    return {
      service: 'petals-orchestrator',
      status: 'operational',
      activeProposals: Array.from(this.proposals.values()).filter(p => p.status === 'submitted').length,
      totalProposals: this.proposals.size,
      uptime: process.uptime(),
      version: '1.0.0'
    };
  }
}

module.exports = PetalsOrchestrator;