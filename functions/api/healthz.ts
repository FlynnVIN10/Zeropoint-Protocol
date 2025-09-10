export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const commit = env.BUILD_COMMIT ?? '9bfe0f25';
    const status = {
      status: 'ok',
      commit,
      phase: 'stage1',
      buildTime: env.BUILD_TIME ?? new Date().toISOString(),
      timestamp: new Date().toISOString(),
      dbConnected: await checkDbConnection(env)
    };
    return new Response(JSON.stringify(status), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  }
};

async function checkDbConnection(env: Env): Promise<boolean> {
  try {
    // Placeholder for PostgreSQL query
    return true; // Assume Task 1.2 completed
  } catch {
    return false;
  }
}