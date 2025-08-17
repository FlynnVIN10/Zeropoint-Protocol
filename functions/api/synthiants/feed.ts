export const onRequestGet: PagesFunction = async () =>
  new Response(JSON.stringify([]), { headers:{'content-type':'application/json'}});
