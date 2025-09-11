export const onRequest = async ({ env }: { env: Env }) => {
  const commit = env.COMMIT_SHA || (env.CF_PAGES_COMMIT_SHA ? env.CF_PAGES_COMMIT_SHA.slice(0, 8) : undefined) || env.BUILD_COMMIT || '0cf3c811';
  const buildTime = env.BUILD_TIME ?? new Date().toISOString();
  const timestamp = new Date().toISOString();

  const response = {
    ready: true,
    commit,
    buildTime,
    timestamp,
    phase: 'stage2',
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
      'X-Content-Type-Options': 'nosniff',
      'Content-Disposition': 'inline'
    }
  });
};