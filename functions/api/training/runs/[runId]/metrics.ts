type Env = {
  ENVIRONMENT: string;
  COMMIT_SHA: string;
  BUILD_TIME: string;
  MOCKS_DISABLED: string;
};

type PagesFunction<Env = unknown> = (ctx: { env: Env; request: Request }) => Response | Promise<Response>;

// Import training runs from the main runs file (in production, use shared storage)
declare const trainingRuns: Map<string, any>;

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const runId = pathParts[pathParts.length - 2]; // Get runId from path
  
  // In production, this would fetch from actual storage
  // For now, we'll simulate the response
  const mockMetrics = [
    { epoch: 0, loss: 2.4567, accuracy: 0.5234, timestamp: "2025-09-02T22:50:00Z" },
    { epoch: 1, loss: 2.1234, accuracy: 0.5678, timestamp: "2025-09-02T22:50:01Z" },
    { epoch: 2, loss: 1.8901, accuracy: 0.6123, timestamp: "2025-09-02T22:50:02Z" },
    { epoch: 3, loss: 1.6789, accuracy: 0.6567, timestamp: "2025-09-02T22:50:03Z" },
    { epoch: 4, loss: 1.4567, accuracy: 0.7012, timestamp: "2025-09-02T22:50:04Z" },
    { epoch: 5, loss: 1.2345, accuracy: 0.7456, timestamp: "2025-09-02T22:50:05Z" },
    { epoch: 6, loss: 1.0123, accuracy: 0.7890, timestamp: "2025-09-02T22:50:06Z" },
    { epoch: 7, loss: 0.8901, accuracy: 0.8234, timestamp: "2025-09-02T22:50:07Z" },
    { epoch: 8, loss: 0.7678, accuracy: 0.8567, timestamp: "2025-09-02T22:50:08Z" },
    { epoch: 9, loss: 0.6456, accuracy: 0.8901, timestamp: "2025-09-02T22:50:09Z" }
  ];
  
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
  
  return new Response(JSON.stringify({
    run_id: runId,
    metrics: mockMetrics,
    total_epochs: mockMetrics.length,
    latest_loss: mockMetrics[mockMetrics.length - 1].loss,
    latest_accuracy: mockMetrics[mockMetrics.length - 1].accuracy,
    decreasing_loss: verifyDecreasingLoss(mockMetrics)
  }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Disposition': 'inline',
    }
  });
};

function verifyDecreasingLoss(metrics: any[]): boolean {
  // Verify that loss is generally decreasing (allowing for some noise)
  if (metrics.length < 3) return false;
  
  const firstLoss = metrics[0].loss;
  const lastLoss = metrics[metrics.length - 1].loss;
  
  // Overall trend should be decreasing
  return lastLoss < firstLoss;
}
