// Proposal Schema for Synthiant Training Integration
// Zeroth Principle: Good intent - ethical, auditable proposals; Good heart - transparent, fair review

export interface Proposal {
  proposalId: string;
  synthiantId: string;
  timestamp: string;
  changeType: 'upgrade' | 'patch' | 'research' | 'optimization' | 'feature';
  summary: string;
  details: string;
  status: 'pending' | 'accepted' | 'rejected' | 'under_review';
  consensus: ConsensusStatus;
  trainingData?: TrainingData;
  metrics?: ProposalMetrics;
  ethicsReview?: EthicsReview;
}

export interface ConsensusStatus {
  ai: 'pass' | 'fail' | 'pending';
  human: 'pass' | 'fail' | 'pending';
  timestamp: string;
  notes?: string;
}

export interface TrainingData {
  modelId: string;
  steps: number;
  prompt?: string;
  dataset?: string;
  validationResults?: ValidationResult[];
}

export interface ValidationResult {
  test: string;
  passed: boolean;
  score: number;
  details?: string;
}

export interface ProposalMetrics {
  trainingSteps: number;
  modelUsed: string;
  safetyValidated: boolean;
  performanceGain?: number;
  riskAssessment?: RiskLevel;
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface EthicsReview {
  complianceScore: number;
  biasAssessment: string;
  safetyChecks: string[];
  recommendations: string[];
  reviewer: string;
  timestamp: string;
}

/**
 * Create a new proposal with validation
 * @param data - Proposal data
 * @returns Validated proposal
 */
export function createProposal(data: Partial<Proposal>): Proposal {
  // Zeroth Principle: Required field validation
  if (!data.proposalId || !data.synthiantId || !data.summary) {
    throw new Error('Missing required fields: proposalId, synthiantId, summary');
  }

  // Zeroth Principle: Content validation
  if (data.summary.length < 10) {
    throw new Error('Summary must be at least 10 characters long');
  }

  if (data.summary.length > 500) {
    throw new Error('Summary must be less than 500 characters');
  }

  const now = new Date().toISOString();
  
  return {
    proposalId: data.proposalId,
    synthiantId: data.synthiantId,
    timestamp: data.timestamp || now,
    changeType: data.changeType || 'research',
    summary: data.summary,
    details: data.details || '',
    status: 'pending',
    consensus: {
      ai: 'pending',
      human: 'pending',
      timestamp: now
    },
    trainingData: data.trainingData,
    metrics: data.metrics,
    ethicsReview: data.ethicsReview
  };
}

/**
 * Validate proposal for submission
 * @param proposal - Proposal to validate
 * @returns Validation result
 */
export function validateProposal(proposal: Proposal): {valid: boolean; errors: string[]} {
  const errors: string[] = [];

  // Zeroth Principle: Comprehensive validation
  if (!proposal.proposalId || proposal.proposalId.length < 5) {
    errors.push('Proposal ID must be at least 5 characters');
  }

  if (!proposal.synthiantId || proposal.synthiantId.length < 3) {
    errors.push('Synthiant ID must be at least 3 characters');
  }

  if (!proposal.summary || proposal.summary.length < 10) {
    errors.push('Summary must be at least 10 characters');
  }

  if (!proposal.changeType || !['upgrade', 'patch', 'research', 'optimization', 'feature'].includes(proposal.changeType)) {
    errors.push('Invalid change type');
  }

  if (proposal.trainingData) {
    if (!proposal.trainingData.modelId) {
      errors.push('Training data must include model ID');
    }
    if (proposal.trainingData.steps < 1 || proposal.trainingData.steps > 10000) {
      errors.push('Training steps must be between 1 and 10,000');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check if proposal has achieved dual consensus
 * @param proposal - Proposal to check
 * @returns Consensus status
 */
export function hasDualConsensus(proposal: Proposal): boolean {
  return proposal.consensus.ai === 'pass' && proposal.consensus.human === 'pass';
}

/**
 * Update proposal consensus status
 * @param proposal - Proposal to update
 * @param type - Type of consensus (ai or human)
 * @param result - Consensus result (pass or fail)
 * @param notes - Optional notes
 * @returns Updated proposal
 */
export function updateConsensus(
  proposal: Proposal, 
  type: 'ai' | 'human', 
  result: 'pass' | 'fail', 
  notes?: string
): Proposal {
  const updatedProposal = { ...proposal };
  
  updatedProposal.consensus = {
    ...updatedProposal.consensus,
    [type]: result,
    timestamp: new Date().toISOString(),
    notes: notes || updatedProposal.consensus.notes
  };

  // Update status based on consensus
  if (hasDualConsensus(updatedProposal)) {
    updatedProposal.status = 'accepted';
  } else if (updatedProposal.consensus.ai === 'fail' || updatedProposal.consensus.human === 'fail') {
    updatedProposal.status = 'rejected';
  } else {
    updatedProposal.status = 'under_review';
  }

  return updatedProposal;
}
