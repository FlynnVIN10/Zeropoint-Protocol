export const GET = async () =>
  new Response(JSON.stringify({
    status:'ok',
    commit: process.env.NEXT_PUBLIC_COMMIT_SHA || process.env.CF_PAGES_COMMIT_SHA || 'unknown',
    buildTime: process.env.BUILD_TIME || new Date().toISOString()
  }), { headers:{ 'content-type':'application/json' }});
