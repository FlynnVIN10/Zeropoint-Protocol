type Env = {
  ENVIRONMENT: string;
  COMMIT_SHA: string;
  BUILD_TIME: string;
  MOCKS_DISABLED: string;
  TEST_TOKEN: string;
};

type PagesFunction<Env = unknown> = (ctx: { env: Env; request: Request }) => Response | Promise<Response>;

// In-memory storage for training runs (in production, use KV or database)
const trainingRuns = new Map<string, any>();

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  // Enforce MOCKS_DISABLED=1
  if (env.MOCKS_DISABLED !== '1') {
    return new Response(JSON.stringify({ 
      error: 'MOCKS_DISABLED must be set to 1 in production' 
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Content-Disposition': 'inline',
      }
    });
  }

  try {
    // Get all training runs
    const runs = Array.from(trainingRuns.values()).map(run => ({
      run_id: run.id,
      status: run.status,
      started: run.startTime,
      metrics_count: run.metrics.length,
      checkpoints_count: run.checkpoints.length
    }));
    
    return new Response(JSON.stringify({ 
      runs,
      total_runs: runs.length
    }), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Content-Disposition': 'inline',
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to list training runs',
      message: (error as Error).message 
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Content-Disposition': 'inline',
      }
    });
  }
};

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  // Enforce MOCKS_DISABLED=1
  if (env.MOCKS_DISABLED !== '1') {
    return new Response(JSON.stringify({ 
      error: 'MOCKS_DISABLED must be set to 1 in production' 
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Content-Disposition': 'inline',
      }
    });
  }

  // Check authorization for test runs
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${env.TEST_TOKEN}` && env.ENVIRONMENT === 'production') {
    return new Response(JSON.stringify({ 
      error: 'Unauthorized - Test token required for production runs' 
    }), { 
      status: 401,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Content-Disposition': 'inline',
      }
    });
  }

  try {
    const runId = crypto.randomUUID();
    const config = await request.json();
    
    // Start training run (simplified Tinygrad simulation)
    const trainingRun = {
      id: runId,
      status: 'started',
      config,
      startTime: new Date().toISOString(),
      metrics: [],
      checkpoints: []
    };
    
    trainingRuns.set(runId, trainingRun);
    
    // Write evidence files
    await writeEvidence(runId, config, env.COMMIT_SHA);
    
    // Start training simulation (in production, this would be actual Tinygrad training)
    startTrainingSimulation(runId);
    
    return new Response(JSON.stringify({ 
      run_id: runId, 
      status: 'started',
      config: config
    }), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Content-Disposition': 'inline',
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to start training run',
      message: (error as Error).message 
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Content-Disposition': 'inline',
      }
    });
  }
};



async function writeEvidence(runId: string, config: any, commit: string) {
  // In production, this would write to actual file system or KV store
  // For now, we'll simulate the evidence structure
  const evidence = {
    config: `/evidence/training/${runId}/config.json`,
    provenance: `/evidence/training/${runId}/provenance.json`,
    metrics: `/evidence/training/${runId}/metrics.jsonl`,
    checkpoints: `/evidence/training/${runId}/checkpoints/`,
  };
  
  // Simulate writing evidence files
  console.log(`Writing evidence for run ${runId}:`, evidence);
  
  // In production, implement actual file writing:
  // await writeFile(evidence.config, JSON.stringify(config));
  // await writeFile(evidence.provenance, JSON.stringify({ 
  //   dataset: 'MNIST', 
  //   sha256: '...', 
  //   commit,
  //   timestamp: new Date().toISOString()
  // }));
}

function startTrainingSimulation(runId: string) {
  // Simulate training with decreasing loss
  const run = trainingRuns.get(runId);
  if (!run) return;
  
  let epoch = 0;
  let loss = 2.5; // Starting loss
  
  const interval = setInterval(() => {
    if (epoch >= 10) {
      run.status = 'completed';
      clearInterval(interval);
      return;
    }
    
    // Simulate decreasing loss
    loss = Math.max(0.1, loss - 0.2 + Math.random() * 0.1);
    const accuracy = Math.min(0.95, 0.5 + epoch * 0.04 + Math.random() * 0.02);
    
    const metric = {
      epoch,
      loss: parseFloat(loss.toFixed(4)),
      accuracy: parseFloat(accuracy.toFixed(4)),
      timestamp: new Date().toISOString()
    };
    
    run.metrics.push(metric);
    
    // Create checkpoint every 3 epochs
    if (epoch % 3 === 0) {
      const checkpoint = {
        epoch,
        loss: metric.loss,
        accuracy: metric.accuracy,
        timestamp: metric.timestamp,
        checkpoint_path: `/evidence/training/${runId}/checkpoints/checkpoint_${epoch}.pt`
      };
      run.checkpoints.push(checkpoint);
    }
    
    epoch++;
  }, 1000); // Update every second for demo
}
