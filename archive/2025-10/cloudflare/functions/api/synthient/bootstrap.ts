export const onRequestPost: PagesFunction<{ SYNTHIENT_CONSENSUS: KVNamespace }> = async ({ env }) => {
  const r = await fetch('/evidence/synthients/proposals.json');
  const j = await r.json();
  await env.SYNTHIENT_CONSENSUS.put('proposals:v1', JSON.stringify(j.items));
  return new Response(JSON.stringify({ ok:true }), { headers: { 'content-type':'application/json' }});
};
