export const onRequestGet: PagesFunction = async () => {
  const commit = (globalThis as any).CF_PAGES_COMMIT_SHA || 'unknown';
  const buildTime = new Date().toISOString();
  return new Response(JSON.stringify({ ready: true, commit, buildTime }), {
    headers: { 'content-type': 'application/json' },
  });
};
