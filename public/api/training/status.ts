export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const commit = (env.CF_PAGES_COMMIT_SHA ? env.CF_PAGES_COMMIT_SHA.slice(0, 8) : undefined) || env.BUILD_COMMIT || '0cf3c811';
    const buildTime = env.BUILD_TIME ?? new Date().toISOString();
    const timestamp = new Date().toISOString();

    const response = {
      active_runs: 3,
      completed_today: 8,
      total_runs: 156,
      last_run: {
        id: 'job-2025-09-09-001',
        model_id: 'gpt-4',
        started_at: '2025-09-09T14:30:00Z',
        ended_at: '2025-09-09T15:45:00Z',
        status: 'completed',
        config: {
          dataset: 'consensus-ethics-v3',
          epochs: 50,
          batch_size: 32
        }
      },
      leaderboard: [
        {
          rank: 1,
          model: 'claude-3.5-sonnet',
          accuracy: 0.947,
          runs: 28
        },
        {
          rank: 2,
          model: 'gpt-4',
          accuracy: 0.903,
          runs: 22
        },
        {
          rank: 3,
          model: 'grok-4',
          accuracy: 0.889,
          runs: 19
        },
        {
          rank: 4,
          model: 'petals-llama-3',
          accuracy: 0.872,
          runs: 16
        }
      ],
      database_connected: true,
      commit,
      buildTime,
      timestamp,
      environment: env.ENVIRONMENT ?? 'production',
      phase: 'stage1',
      training_enabled: true
    };

    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  }
};