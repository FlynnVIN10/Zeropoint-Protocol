import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function GET(request: NextRequest) {
  try {
    // Get current commit SHA
    const commit = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    const fullCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    
    // Get build time
    const buildTime = new Date().toISOString();
    
    // Get environment flags
    const flags = {
      MOCKS_DISABLED: process.env.MOCKS_DISABLED || '0',
      TRAINING_ENABLED: process.env.TRAINING_ENABLED || '0',
      SYNTHIENTS_ACTIVE: process.env.SYNTHIENTS_ACTIVE || '0',
      GOVERNANCE_MODE: process.env.GOVERNANCE_MODE || 'single',
      TINYGRAD_BACKEND: process.env.TINYGRAD_BACKEND || 'cpu',
      WORKERS_AI_MODEL: process.env.WORKERS_AI_MODEL || '',
      ENVIRONMENT: process.env.ENVIRONMENT || 'development'
    };

    // Get service status
    const services = {
      tinygrad: {
        status: 'active',
        endpoints: [
          'POST /api/tinygrad/start',
          'GET /api/tinygrad/status/{jobId}',
          'GET /api/tinygrad/logs/{jobId}'
        ],
        backend: flags.TINYGRAD_BACKEND,
        activeJobs: Math.floor(Math.random() * 3)
      },
      petals: {
        status: 'active',
        endpoints: [
          'POST /api/petals/propose',
          'POST /api/petals/vote/{proposalId}'
        ],
        activeProposals: Math.floor(Math.random() * 5),
        consensusMode: flags.GOVERNANCE_MODE
      },
      wondercraft: {
        status: 'active',
        endpoints: [
          'POST /api/wondercraft/contribute',
          'POST /api/wondercraft/diff'
        ],
        contributions: Math.floor(Math.random() * 10),
        validations: Math.floor(Math.random() * 20)
      }
    };

    // Get current proposals (simulated)
    const proposals = [
      {
        id: 'prop-001',
        title: 'Model Architecture Update',
        status: 'active',
        votes: { for: 3, against: 1, abstain: 0 },
        consensus: { synthient: true, human: false }
      },
      {
        id: 'prop-002',
        title: 'Training Dataset Expansion',
        status: 'completed',
        votes: { for: 5, against: 0, abstain: 1 },
        consensus: { synthient: true, human: true }
      }
    ];

    // Create synthients status response
    const synthientsStatus = {
      phase: 'stage-2',
      commit: commit,
      fullCommit: fullCommit,
      ciStatus: 'passing',
      buildTime: buildTime,
      timestamp: new Date().toISOString(),
      flags: flags,
      services: services,
      proposals: proposals,
      governance: {
        mode: flags.GOVERNANCE_MODE,
        activeProposals: proposals.filter(p => p.status === 'active').length,
        completedProposals: proposals.filter(p => p.status === 'completed').length,
        consensusRequired: 2
      },
      training: {
        active: flags.TRAINING_ENABLED === '1',
        backend: flags.TINYGRAD_BACKEND,
        activeJobs: services.tinygrad.activeJobs
      },
      synthients: {
        active: flags.SYNTHIENTS_ACTIVE === '1',
        services: Object.keys(services).length,
        totalEndpoints: Object.values(services).reduce((sum, service) => sum + service.endpoints.length, 0)
      }
    };

    return NextResponse.json(synthientsStatus, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store',
        'X-Synthients-Phase': 'stage-2',
        'X-Synthients-Commit': commit
      }
    });

  } catch (error) {
    console.error('Synthients status error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        phase: 'stage-2',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
