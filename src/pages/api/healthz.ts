export const GET = async () =>
  new Response(JSON.stringify({
    status:'ok',
    commit: process.env.CF_PAGES_COMMIT_SHA || 'unknown',
    buildTime: new Date().toISOString()
  }), { headers:{ 'content-type':'application/json' }});
