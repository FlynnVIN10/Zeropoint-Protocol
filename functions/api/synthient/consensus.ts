type Decision = {
  id: string; // proposal id
  action: 'approve'|'veto';
  feedback?: string;
  actor: string; // 'CEO' or account id
  at: string;
};

const LOG_PREFIX = 'consensus:v1:';

export const onRequestPost: PagesFunction<{ SYNTHIENT_CONSENSUS: KVNamespace }> = async ({ env, request }) => {
  const { id, action, feedback, actor } = await request.json().catch(()=>({}));
  if (!id || !['approve','veto'].includes(action)) return new Response('Bad Request', { status:400 });
  const entry: Decision = { id, action, feedback, actor: actor || 'CEO', at: new Date().toISOString() };
  const key = `${LOG_PREFIX}${id}:${entry.at}`;
  await env.SYNTHIENT_CONSENSUS.put(key, JSON.stringify(entry));
  return new Response(JSON.stringify({ ok:true, stored:key }), { headers: { 'content-type':'application/json' }});
};

export const onRequestGet: PagesFunction<{ SYNTHIENT_CONSENSUS: KVNamespace }> = async ({ env, request }) => {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const list = await env.SYNTHIENT_CONSENSUS.list({ prefix: id ? `${LOG_PREFIX}${id}:` : LOG_PREFIX });
  const items = await Promise.all(list.keys.map(k => env.SYNTHIENT_CONSENSUS.get(k.name) as unknown as Promise<string>));
  return new Response(JSON.stringify({ items: items.filter(Boolean).map(s=>JSON.parse(s as unknown as string)) }), { headers: { 'content-type':'application/json' }});
};
