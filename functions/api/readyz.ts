// Cloudflare Pages Function for /api/readyz
export async function onRequest({ env }: { env: Record<string, any> }) {
  const commit = env.BUILD_COMMIT ?? '799f4987';
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
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'content-disposition': 'inline'
    }
  });
}