// Proposal Pipeline for Synthiant Training Integration
// Zeroth Principle: Good intent - ethical, auditable pipeline; Good heart - transparent, fair processing

import { Proposal, createProposal, validateProposal, updateConsensus, hasDualConsensus } from './schema';
import * as fs from 'fs';
import * as path from 'path';

export interface PipelineConfig {
  queueFile: string;
  backupDir: string;
  maxRetries: number;
  validationEnabled: boolean;
}

export interface PipelineResult {
  success: boolean;
  proposalId: string;
  message: string;
  timestamp: string;
  errors?: string[];
}

export interface QueueStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  underReview: number;
}

/**
 * Default pipeline configuration
 */
export const DEFAULT_CONFIG: PipelineConfig = {
  queueFile: 'src/queue/proposals.jsonl',
  backupDir: 'src/queue/backups',
  maxRetries: 3,
  validationEnabled: true
};

/**
 * Submit a proposal to the consensus queue
 * @param proposal - Proposal to submit
 * @param config - Pipeline configuration
 * @returns Submission result
 */
export function submitProposal(proposal: Partial<Proposal>, config: PipelineConfig = DEFAULT_CONFIG): PipelineResult {
  try {
    // Zeroth Principle: Input validation
    if (!proposal.proposalId || !proposal.summary) {
      throw new Error('Invalid proposal: Missing required fields');
    }

    // Create and validate proposal
    const validatedProposal = createProposal(proposal);
    
    if (config.validationEnabled) {
      const validation = validateProposal(validatedProposal);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
    }

    // Ensure queue directory exists
    const queueDir = path.dirname(config.queueFile);
    if (!fs.existsSync(queueDir)) {
      fs.mkdirSync(queueDir, { recursive: true });
    }

    // Append proposal to queue file
    const proposalLine = JSON.stringify(validatedProposal) + '\n';
    fs.appendFileSync(config.queueFile, proposalLine);

    // Create backup
    createBackup(config);

    return {
      success: true,
      proposalId: validatedProposal.proposalId,
      message: 'Proposal submitted successfully',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      proposalId: proposal.proposalId || 'unknown',
      message: 'Proposal submission failed',
      timestamp: new Date().toISOString(),
      errors: [String(error)]
    };
  }
}

/**
 * Read all proposals from the queue
 * @param config - Pipeline configuration
 * @returns Array of proposals
 */
export function readProposals(config: PipelineConfig = DEFAULT_CONFIG): Proposal[] {
  try {
    if (!fs.existsSync(config.queueFile)) {
      return [];
    }

    const content = fs.readFileSync(config.queueFile, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line.length > 0);
    
    return lines.map(line => {
      try {
        return JSON.parse(line) as Proposal;
      } catch (parseError) {
        console.error(`Failed to parse proposal line: ${parseError}`);
        return null;
      }
    }).filter(Boolean) as Proposal[];
  } catch (error) {
    console.error(`Failed to read proposals: ${error}`);
    return [];
  }
}

/**
 * Update proposal consensus in the queue
 * @param proposalId - ID of proposal to update
 * @param type - Type of consensus (ai or human)
 * @param result - Consensus result (pass or fail)
 * @param notes - Optional notes
 * @param config - Pipeline configuration
 * @returns Update result
 */
export function updateProposalConsensus(
  proposalId: string,
  type: 'ai' | 'human',
  result: 'pass' | 'fail',
  notes?: string,
  config: PipelineConfig = DEFAULT_CONFIG
): PipelineResult {
  try {
    // Zeroth Principle: Input validation
    if (!proposalId || !type || !result) {
      throw new Error('Missing required parameters for consensus update');
    }

    const proposals = readProposals(config);
    const proposalIndex = proposals.findIndex(p => p.proposalId === proposalId);
    
    if (proposalIndex === -1) {
      throw new Error(`Proposal not found: ${proposalId}`);
    }

    // Update consensus
    const updatedProposal = updateConsensus(proposals[proposalIndex], type, result, notes);
    proposals[proposalIndex] = updatedProposal;

    // Write updated proposals back to queue
    const content = proposals.map(p => JSON.stringify(p)).join('\n') + '\n';
    fs.writeFileSync(config.queueFile, content);

    // Create backup
    createBackup(config);

    return {
      success: true,
      proposalId,
      message: `Consensus updated: ${type} = ${result}`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      proposalId,
      message: 'Failed to update consensus',
      timestamp: new Date().toISOString(),
      errors: [String(error)]
    };
  }
}

/**
 * Get proposal by ID
 * @param proposalId - ID of proposal to retrieve
 * @param config - Pipeline configuration
 * @returns Proposal or null if not found
 */
export function getProposal(proposalId: string, config: PipelineConfig = DEFAULT_CONFIG): Proposal | null {
  try {
    const proposals = readProposals(config);
    return proposals.find(p => p.proposalId === proposalId) || null;
  } catch (error) {
    console.error(`Failed to get proposal: ${error}`);
    return null;
  }
}

/**
 * Get queue statistics
 * @param config - Pipeline configuration
 * @returns Queue statistics
 */
export function getQueueStats(config: PipelineConfig = DEFAULT_CONFIG): QueueStats {
  try {
    const proposals = readProposals(config);
    
    return {
      total: proposals.length,
      pending: proposals.filter(p => p.status === 'pending').length,
      accepted: proposals.filter(p => p.status === 'accepted').length,
      rejected: proposals.filter(p => p.status === 'rejected').length,
      underReview: proposals.filter(p => p.status === 'under_review').length
    };
  } catch (error) {
    console.error(`Failed to get queue stats: ${error}`);
    return {
      total: 0,
      pending: 0,
      accepted: 0,
      rejected: 0,
      underReview: 0
    };
  }
}

/**
 * Create backup of queue file
 * @param config - Pipeline configuration
 */
function createBackup(config: PipelineConfig): void {
  try {
    if (!fs.existsSync(config.backupDir)) {
      fs.mkdirSync(config.backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(config.backupDir, `proposals_${timestamp}.jsonl`);
    
    if (fs.existsSync(config.queueFile)) {
      fs.copyFileSync(config.queueFile, backupFile);
    }
  } catch (error) {
    console.error(`Failed to create backup: ${error}`);
  }
}

/**
 * Clean up old backup files
 * @param config - Pipeline configuration
 * @param maxAge - Maximum age of backup files in days
 */
export function cleanupOldBackups(config: PipelineConfig = DEFAULT_CONFIG, maxAge: number = 30): void {
  try {
    if (!fs.existsSync(config.backupDir)) {
      return;
    }

    const files = fs.readdirSync(config.backupDir);
    const now = Date.now();
    const maxAgeMs = maxAge * 24 * 60 * 60 * 1000;

    files.forEach(file => {
      const filePath = path.join(config.backupDir, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtime.getTime() > maxAgeMs) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up old backup: ${file}`);
      }
    });
  } catch (error) {
    console.error(`Failed to cleanup old backups: ${error}`);
  }
}

/**
 * Validate entire queue for data integrity
 * @param config - Pipeline configuration
 * @returns Validation result
 */
export function validateQueue(config: PipelineConfig = DEFAULT_CONFIG): {valid: boolean; errors: string[]} {
  try {
    const proposals = readProposals(config);
    const errors: string[] = [];

    proposals.forEach((proposal, index) => {
      const validation = validateProposal(proposal);
      if (!validation.valid) {
        errors.push(`Line ${index + 1}: ${validation.errors.join(', ')}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  } catch (error) {
    return {
      valid: false,
      errors: [String(error)]
    };
  }
}
