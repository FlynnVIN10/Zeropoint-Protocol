export const onRequestGet: PagesFunction = async () =>
  new Response(JSON.stringify([{name:'uptime_sec',value:0,ts:new Date().toISOString()}]),
    { headers:{'content-type':'application/json'}});
