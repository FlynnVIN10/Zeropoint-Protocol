type Env = {
  CF_PAGES_COMMIT_SHA?: string;
};

type PagesFunction<Env = unknown> = (ctx: { env: Env }) => Response | Promise<Response>;

export const onRequest: PagesFunction<Env> = async (ctx) => {
  const endpoints = [
    '/status/version.json',
    '/api/healthz',
    '/api/readyz',
  ];
  const results: Record<string, any> = {};

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`https://6843b50d.zeropoint-protocol.pages.dev${endpoint}`);
      const data = await response.json();
      results[endpoint] = {
        status: response.status,
        schemaValid: validateSchema(endpoint, data),
        phase: data.phase,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      results[endpoint] = { 
        status: 'error', 
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      };
    }
  }

  return new Response(JSON.stringify({
    commit: ctx.env?.CF_PAGES_COMMIT_SHA || 'unknown',
    timestamp: new Date().toISOString(),
    results
  }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Disposition': 'inline',
    },
  });
};

function validateSchema(endpoint: string, data: any): boolean {
  const schemas: Record<string, string[]> = {
    '/status/version.json': ['phase', 'commit', 'ciStatus', 'buildTime'],
    '/api/healthz': ['status', 'uptime', 'commit', 'buildTime', 'service', 'phase', 'version', 'ciStatus', 'timestamp', 'environment'],
    '/api/readyz': ['ready', 'db', 'cache', 'commit', 'buildTime', 'phase', 'ciStatus', 'timestamp', 'environment'],
  };
  const requiredFields = schemas[endpoint] || [];
  return requiredFields.every(field => field in data);
}
