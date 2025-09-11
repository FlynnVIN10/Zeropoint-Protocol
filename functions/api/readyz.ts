export const onRequest = async ({ env }: { env: Env }) => {
  const commit = env.COMMIT_SHA || (env.CF_PAGES_COMMIT_SHA ? env.CF_PAGES_COMMIT_SHA.slice(0, 8) : undefined) || env.BUILD_COMMIT || '0cf3c811';
  const buildTime = env.BUILD_TIME ?? new Date().toISOString();
  const timestamp = new Date().toISOString();

  const response = {
    ready: false,
    commit,
    buildTime,
    timestamp,
    phase: 'offline',
    ciStatus: 'offline',
    mocks: false,
    services: {
      database: 'offline',
      cache: 'offline',
      external: 'offline'
    },
    environment: env.ENVIRONMENT ?? 'production',
    message: 'Platform taken offline by CEO directive'
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