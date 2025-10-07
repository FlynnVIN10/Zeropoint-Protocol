type Proposal = {
  id: string; title: string; summary: string;
  owner: string; created_at: string; priority: 'low'|'med'|'high';
};

const PROPOSALS_KEY = 'proposals:v1';

export const onRequestGet: PagesFunction<{ SYNTHIENT_CONSENSUS: KVNamespace }> = async ({ env }) => {
  const raw = await env.SYNTHIENT_CONSENSUS.get(PROPOSALS_KEY);
  const items: Proposal[] = raw ? JSON.parse(raw) : [];
  return new Response(JSON.stringify({ items }), { headers: { 'content-type':'application/json' }});
};

export const onRequestPost: PagesFunction<{ SYNTHIENT_CONSENSUS: KVNamespace }> = async ({ env, request }) => {
  const body = await request.json().catch(()=>null);
  if (!body || !Array.isArray(body.items)) return new Response('Bad Request', { status:400 });
  await env.SYNTHIENT_CONSENSUS.put(PROPOSALS_KEY, JSON.stringify(body.items), { expirationTtl: 0 }); // no TTL
  return new Response(JSON.stringify({ ok:true }), { headers: { 'content-type':'application/json' }});
};
