/**
 * Stage 2 API Server
 * Unified API endpoint for all Synthient services
 * 
 * Provides RESTful endpoints for Tinygrad, Petals, and Wondercraft services
 */

const express = require('express');
const TinygradTrainer = require('../trainer-tinygrad');
const PetalsOrchestrator = require('../petals-orchestrator');
const WondercraftBridge = require('../wondercraft-bridge');
const DualConsensusGovernance = require('../governance');

class Stage2APIServer {
  constructor() {
    this.app = express();
    this.tinygrad = new TinygradTrainer();
    this.petals = new PetalsOrchestrator();
    this.wondercraft = new WondercraftBridge();
    this.governance = new DualConsensusGovernance();
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // CORS headers
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    // Security headers
    this.app.use((req, res, next) => {
      res.header('X-Content-Type-Options', 'nosniff');
      res.header('Cache-Control', 'no-store');
      res.header('Content-Security-Policy', "default-src 'self'");
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        services: {
          tinygrad: 'active',
          petals: 'active',
          wondercraft: 'active',
          governance: 'active'
        },
        timestamp: new Date().toISOString()
      });
    });

    // Synthients status
    this.app.get('/status/synthients.json', (req, res) => {
      res.json({
        status: 'active',
        governance_mode: 'dual-consensus',
        synthients: {
          tinygrad: {
            status: 'active',
            backend: 'cpu',
            training_enabled: true,
            endpoints: {
              start: '/api/tinygrad/start',
              status: '/api/tinygrad/status/{jobId}',
              logs: '/api/tinygrad/logs/{jobId}'
            }
          },
          petals: {
            status: 'active',
            proposals_enabled: true,
            voting_enabled: true,
            endpoints: {
              propose: '/api/petals/propose',
              vote: '/api/petals/vote/{proposalId}'
            }
          },
          wondercraft: {
            status: 'active',
            contributions_enabled: true,
            validation_enabled: true,
            endpoints: {
              contribute: '/api/wondercraft/contribute',
              diff: '/api/wondercraft/diff'
            }
          }
        },
        environment: {
          mocks_disabled: true,
          synthients_active: true,
          training_enabled: true,
          governance_mode: 'dual-consensus',
          tinygrad_backend: 'cpu'
        },
        timestamp: new Date().toISOString(),
        commit: process.env.CF_PAGES_COMMIT_SHA || 'unknown'
      });
    });

    // Tinygrad routes
    this.app.post('/api/tinygrad/start', async (req, res) => {
      try {
        const { dataset, model_config, training_params } = req.body;
        const result = await this.tinygrad.startTrainingJob(dataset, model_config, training_params);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/tinygrad/status/:jobId', async (req, res) => {
      try {
        const { jobId } = req.params;
        const result = await this.tinygrad.getJobStatus(jobId);
        res.json(result);
      } catch (error) {
        res.status(404).json({ error: error.message });
      }
    });

    this.app.get('/api/tinygrad/logs/:jobId', async (req, res) => {
      try {
        const { jobId } = req.params;
        const result = await this.tinygrad.getJobLogs(jobId);
        res.json(result);
      } catch (error) {
        res.status(404).json({ error: error.message });
      }
    });

    // Petals routes
    this.app.post('/api/petals/propose', async (req, res) => {
      try {
        const { title, description, proposal_type, synthient_approval } = req.body;
        const result = await this.petals.submitProposal(title, description, proposal_type, synthient_approval);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/api/petals/vote/:proposalId', async (req, res) => {
      try {
        const { proposalId } = req.params;
        const { vote, voter_type, reasoning } = req.body;
        const result = await this.petals.castVote(proposalId, vote, voter_type, reasoning);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/petals/proposal/:proposalId', async (req, res) => {
      try {
        const { proposalId } = req.params;
        const result = await this.petals.getProposalStatus(proposalId);
        res.json(result);
      } catch (error) {
        res.status(404).json({ error: error.message });
      }
    });

    this.app.get('/api/petals/tally/:proposalId', async (req, res) => {
      try {
        const { proposalId } = req.params;
        const result = await this.petals.getVotingTally(proposalId);
        res.json(result);
      } catch (error) {
        res.status(404).json({ error: error.message });
      }
    });

    // Wondercraft routes
    this.app.post('/api/wondercraft/contribute', async (req, res) => {
      try {
        const { asset_type, asset_data, metadata, contributor } = req.body;
        const result = await this.wondercraft.submitContribution(asset_type, asset_data, metadata, contributor);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/wondercraft/diff', async (req, res) => {
      try {
        const { asset_id, version_a, version_b } = req.query;
        const result = await this.wondercraft.getAssetDiff(asset_id, version_a, version_b);
        res.json(result);
      } catch (error) {
        res.status(404).json({ error: error.message });
      }
    });

    this.app.get('/api/wondercraft/contribution/:contributionId', async (req, res) => {
      try {
        const { contributionId } = req.params;
        const result = await this.wondercraft.getContributionStatus(contributionId);
        res.json(result);
      } catch (error) {
        res.status(404).json({ error: error.message });
      }
    });

    // Governance routes
    this.app.post('/api/governance/approval', async (req, res) => {
      try {
        const { pr_number, commit_sha, human_approval, synthient_approval } = req.body;
        const result = await this.governance.createApprovalRecord(pr_number, commit_sha, human_approval, synthient_approval);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.put('/api/governance/approval/:prNumber/:commitSha', async (req, res) => {
      try {
        const { prNumber, commitSha } = req.params;
        const { approval_type, approved, reasoning } = req.body;
        const result = await this.governance.updateApproval(prNumber, commitSha, approval_type, approved, reasoning);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/governance/consensus/:prNumber/:commitSha', async (req, res) => {
      try {
        const { prNumber, commitSha } = req.params;
        const result = await this.governance.checkDualConsensus(prNumber, commitSha);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/api/governance/gate/:prNumber/:commitSha', async (req, res) => {
      try {
        const { prNumber, commitSha } = req.params;
        const result = await this.governance.enforceGovernanceGate(prNumber, commitSha);
        res.json(result);
      } catch (error) {
        res.status(403).json({ error: error.message });
      }
    });

    // Error handling
    this.app.use((err, req, res, next) => {
      console.error('API Error:', err);
      res.status(500).json({
        error: 'Internal server error',
        message: err.message,
        timestamp: new Date().toISOString()
      });
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        error: 'Endpoint not found',
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
      });
    });
  }

  start(port = 3000) {
    this.app.listen(port, () => {
      console.log(`Stage 2 API Server running on port ${port}`);
      console.log('Available services:');
      console.log('- Tinygrad Trainer: /api/tinygrad/*');
      console.log('- Petals Orchestrator: /api/petals/*');
      console.log('- Wondercraft Bridge: /api/wondercraft/*');
      console.log('- Dual-Consensus Governance: /api/governance/*');
    });
  }
}

module.exports = Stage2APIServer;
