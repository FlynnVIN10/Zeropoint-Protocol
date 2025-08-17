export const onRequestGet = () => new Response(JSON.stringify([
  {name:"uptime_sec", value:1, ts:new Date().toISOString()}
]),{headers:{"content-type":"application/json"}});
