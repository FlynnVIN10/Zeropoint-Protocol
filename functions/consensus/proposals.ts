export async function onRequest(context: any) {
  const { request } = context;
  const url = new URL(request.url);

  if (request.method === 'POST' && url.pathname.endsWith('/consensus/proposals')) {
    const body = await request.json().catch(() => ({}));
    if (typeof body?.prompt !== 'string' || !body.prompt.trim()) {
      return new Response(JSON.stringify({ error: 'invalid prompt' }), { status: 400, headers: jsonHeaders() });
    }
    const proposal = { proposal_id: crypto.randomUUID(), prompt: body.prompt, created_at: new Date().toISOString(), state: 'pending' };
    // Append-only Soulchain log (best-effort)
    try {
      const kv = (context as any).env?.SOULCHAIN;
      if (kv && typeof kv.put === 'function') {
        const key = `proposal:${proposal.proposal_id}`;
        await kv.put(key, JSON.stringify(proposal));
      }
    } catch {}
    return new Response(JSON.stringify(proposal), { status: 201, headers: jsonHeaders() });
  }

  if (request.method === 'GET' && url.pathname.endsWith('/consensus/proposals')) {
    const state = url.searchParams.get('state') || 'pending';
    return new Response(JSON.stringify([{ proposal_id: 'p-001', prompt: 'sample', created_at: new Date().toISOString(), state }]), { headers: jsonHeaders() });
  }

  return new Response(JSON.stringify({ error: 'not found' }), { status: 404, headers: jsonHeaders() });
}

function jsonHeaders() {
  return {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    'content-disposition': 'inline'
  };
}
