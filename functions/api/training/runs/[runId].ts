type Env = {
  ENVIRONMENT: string;
  COMMIT_SHA: string;
  BUILD_TIME: string;
  MOCKS_DISABLED: string;
  TEST_TOKEN: string;
};

type PagesFunction<Env = unknown> = (ctx: { env: Env; request: Request; params: any }) => Response | Promise<Response>;

// Import training runs from the main runs file (in production, use shared storage)
declare const trainingRuns: Map<string, any>;

export const onRequestGet: PagesFunction<Env> = async ({ env, request, params }) => {
  const runId = params.runId;
  
  if (!runId) {
    return new Response(JSON.stringify({ 
      error: 'Run ID required' 
    }), { 
      status: 400,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Content-Disposition': 'inline',
      }
    });
  }
  
  // In production, this would fetch from actual storage
  // For now, we'll simulate the response
  const mockRun = {
    run_id: runId,
    status: 'completed',
    config: {
      dataset: 'MNIST',
      epochs: 10,
      batch_size: 32,
      learning_rate: 0.001
    },
    start_time: '2025-09-02T22:50:00Z',
    metrics_count: 10,
    checkpoints_count: 4
  };
  
  return new Response(JSON.stringify(mockRun), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Disposition': 'inline',
    }
  });
};
