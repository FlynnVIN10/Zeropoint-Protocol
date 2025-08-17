export const onRequestGet: PagesFunction = async () =>
  new Response(JSON.stringify([
    {name:'uptime_sec',value:12345,ts:new Date().toISOString()},
    {name:'requests_min',value:42,ts:new Date().toISOString()},
    {name:'errors_min',value:0,ts:new Date().toISOString()}
  ]), { headers:{'content-type':'application/json'}});
