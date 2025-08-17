export const onRequestGet: PagesFunction = ({ env }) =>
  new Response(JSON.stringify({
    status: 'ok',
    commit: env.CF_PAGES_COMMIT_SHA ?? 'unknown',
    buildTime: new Date().toISOString()
  }), { headers: { 'content-type': 'application/json' }});
