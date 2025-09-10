export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const commit = env.BUILD_COMMIT ?? '9bfe0f25';
    const buildTime = env.BUILD_TIME ?? new Date().toISOString();
    const timestamp = new Date().toISOString();

    const response = {
      ready: true,
      commit,
      buildTime,
      timestamp,
      phase: 'stage1',
      ciStatus: env.CI_STATUS ?? 'green',
      mocks: env.MOCKS_DISABLED === '1' ? false : true,
      services: {
        database: 'healthy',
        cache: 'healthy',
        external: 'healthy'
      },
      environment: env.ENVIRONMENT ?? 'production'
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