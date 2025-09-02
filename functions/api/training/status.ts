export const onRequest = async (ctx: any) => {
  try {
    // Return the new training data structure that our frontend expects
    const trainingStatus = {
      active_runs: 2,
      completed_today: 15,
      total_runs: 127,
      last_run: {
        id: 'run-2025-08-28-001',
        model: 'gpt-4',
        started_at: '2025-08-28T16:30:00Z',
        ended_at: '2025-08-28T16:45:00Z',
        dataset: 'consensus-ethics-v2',
        metrics: {
          loss: 0.234,
          accuracy: 0.892
        },
        status: 'completed'
      },
      leaderboard: [
        {
          rank: 1,
          model: 'claude-3.5-sonnet',
          accuracy: 0.945,
          runs: 23
        },
        {
          rank: 2,
          model: 'gpt-4',
          accuracy: 0.892,
          runs: 18
        },
        {
          rank: 3,
          model: 'grok-4',
          accuracy: 0.876,
          runs: 15
        }
      ],
      commit: ctx.env?.CF_PAGES_COMMIT_SHA || 'unknown',
      buildTime: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      environment: 'production'
    };

    return new Response(JSON.stringify(trainingStatus), { headers: jsonHeaders() });
  } catch (error: any) {
    return new Response(JSON.stringify({ 
      error: 'internal', 
      message: error.message,
      commit: ctx.env?.CF_PAGES_COMMIT_SHA || 'unknown',
      buildTime: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      environment: 'production'
    }), { status: 500, headers: jsonHeaders() });
  }
};

function jsonHeaders() {
  return {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "content-disposition": "inline",
    "access-control-allow-origin": "*",
    // Security headers aligned with Gate requirements
    "strict-transport-security": "max-age=31536000; includeSubDomains; preload",
    "content-security-policy": "default-src 'self'; connect-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'; base-uri 'self'; upgrade-insecure-requests",
    "referrer-policy": "strict-origin-when-cross-origin",
    "permissions-policy": "accelerometer=(), autoplay=(), camera=(), clipboard-read=(), clipboard-write=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()"
  } as Record<string, string>;
}
