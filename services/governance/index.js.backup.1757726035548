// CTO Directive: Compliance check
if (process.env.MOCKS_DISABLED === '1') {
  throw new Error('Module temporarily unavailable - MOCKS_DISABLED=1 enforced')
}

/**
 * Dual-Consensus Governance Service
 * Stage 2: Governance Enforcement and Approval Management
 * 
 * Implements dual-consensus governance requiring both Human and Synthient approval
 */

const fs = require('fs').promises;
const path = require('path');

class DualConsensusGovernance {
  constructor() {
    this.approvals = new Map();
    this.evidencePath = path.join(process.cwd(), 'public', 'evidence', 'phase2', 'approvals');
  }

  async createApprovalRecord(prNumber, commitSha, humanApproval = false, synthientApproval = false) {
    const approvalId = `pr_${prNumber}_${commitSha}`;
    
    const approval = {
      id: approvalId,
      pr_number: prNumber,
      commit_sha: commitSha,
      human_approval: humanApproval,
      synthient_approval: synthientApproval,
      dual_consensus_achieved: humanApproval && synthientApproval,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      evidence_path: `/evidence/phase2/approvals/${approvalId}.json`
    };

    this.approvals.set(approvalId, approval);
    
    // Log evidence
    await this.logApprovalEvidence(approval);
    
    return approval;
  }

  async updateApproval(prNumber, commitSha, approvalType, approved, reasoning = '') {
    const approvalId = `pr_${prNumber}_${commitSha}`;
    let approval = this.approvals.get(approvalId);
    
    if (!approval) {
      approval = await this.createApprovalRecord(prNumber, commitSha);
    }

    // Update the specific approval type
    if (approvalType === 'human') {
      approval.human_approval = approved;
    } else if (approvalType === 'synthient') {
      approval.synthient_approval = approved;
    }

    approval.updated_at = new Date().toISOString();
    approval.dual_consensus_achieved = approval.human_approval && approval.synthient_approval;

    // Add approval details
    if (!approval.approval_details) {
      approval.approval_details = {};
    }
    
    approval.approval_details[approvalType] = {
      approved,
      reasoning,
      timestamp: new Date().toISOString()
    };

    this.approvals.set(approvalId, approval);
    
    // Log evidence
    await this.logApprovalEvidence(approval);
    
    return approval;
  }

  async checkDualConsensus(prNumber, commitSha) {
    const approvalId = `pr_${prNumber}_${commitSha}`;
    const approval = this.approvals.get(approvalId);
    
    if (!approval) {
      return {
        dual_consensus_achieved: false,
        human_approval: false,
        synthient_approval: false,
        can_merge: false,
        missing_approvals: ['human', 'synthient']
      };
    }

    const missingApprovals = [];
    if (!approval.human_approval) missingApprovals.push('human');
    if (!approval.synthient_approval) missingApprovals.push('synthient');

    return {
      dual_consensus_achieved: approval.dual_consensus_achieved,
      human_approval: approval.human_approval,
      synthient_approval: approval.synthient_approval,
      can_merge: approval.dual_consensus_achieved,
      missing_approvals: missingApprovals,
      approval_id: approvalId
    };
  }

  async enforceGovernanceGate(prNumber, commitSha) {
    const consensusCheck = await this.checkDualConsensus(prNumber, commitSha);
    
    if (!consensusCheck.dual_consensus_achieved) {
      throw new Error(`Dual-consensus not achieved for PR ${prNumber}. Missing approvals: ${consensusCheck.missing_approvals.join(', ')}`);
    }

    // Log successful governance gate passage
    await this.logGovernanceGatePassage(prNumber, commitSha, consensusCheck);
    
    return {
      governance_gate_passed: true,
      dual_consensus_achieved: true,
      merge_authorized: true,
      timestamp: new Date().toISOString()
    };
  }

  async getApprovalStatus(prNumber, commitSha) {
    const approvalId = `pr_${prNumber}_${commitSha}`;
    const approval = this.approvals.get(approvalId);
    
    if (!approval) {
      return {
        exists: false,
        message: `No approval record found for PR ${prNumber} (${commitSha})`
      };
    }

    return {
      exists: true,
      approval_id: approvalId,
      pr_number: prNumber,
      commit_sha: commitSha,
      human_approval: approval.human_approval,
      synthient_approval: approval.synthient_approval,
      dual_consensus_achieved: approval.dual_consensus_achieved,
      created_at: approval.created_at,
      updated_at: approval.updated_at,
      evidence_path: approval.evidence_path
    };
  }

  async logApprovalEvidence(approval) {
    try {
      await fs.mkdir(this.evidencePath, { recursive: true });
      
      const evidenceFile = path.join(this.evidencePath, `${approval.id}.json`);
      await fs.writeFile(evidenceFile, JSON.stringify({
        ...approval,
        evidence_type: 'dual_consensus_approval',
        governance_mode: 'dual-consensus'
      }, null, 2));
    } catch (error) {
      console.error('Failed to log approval evidence:', error);
    }
  }

  async logGovernanceGatePassage(prNumber, commitSha, consensusCheck) {
    try {
      const gatePath = path.join(this.evidencePath, 'governance_gates');
      await fs.mkdir(gatePath, { recursive: true });
      
      const gateFile = path.join(gatePath, `gate_passage_${prNumber}_${commitSha}.json`);
      await fs.writeFile(gateFile, JSON.stringify({
        pr_number: prNumber,
        commit_sha: commitSha,
        dual_consensus_achieved: consensusCheck.dual_consensus_achieved,
        human_approval: consensusCheck.human_approval,
        synthient_approval: consensusCheck.synthient_approval,
        passed_at: new Date().toISOString(),
        evidence_type: 'governance_gate_passage',
        governance_mode: 'dual-consensus'
      }, null, 2));
    } catch (error) {
      console.error('Failed to log governance gate passage:', error);
    }
  }

  // Utility method to simulate Synthient approval (for testing)
  async simulateSynthientApproval(prNumber, commitSha, approved = true, reasoning = 'Automated Synthient evaluation') {
    return await this.updateApproval(prNumber, commitSha, 'synthient', approved, reasoning);
  }

  // Utility method to simulate Human approval (for testing)
  async simulateHumanApproval(prNumber, commitSha, approved = true, reasoning = 'Human review completed') {
    return await this.updateApproval(prNumber, commitSha, 'human', approved, reasoning);
  }
}

module.exports = DualConsensusGovernance;
