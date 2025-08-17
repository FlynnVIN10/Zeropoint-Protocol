export const GET = () => new Response(JSON.stringify({
  ready:true,
  commit: process.env.CF_PAGES_COMMIT_SHA || 'unknown',
  buildTime: new Date().toISOString()
}), { headers:{'content-type':'application/json'}});
