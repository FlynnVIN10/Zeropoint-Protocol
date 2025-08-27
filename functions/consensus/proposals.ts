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
    const kv = (context as any).env?.SOULCHAIN;

    // Default fallback if KV not available
    if (!kv || typeof kv.list !== 'function') {
      return new Response(JSON.stringify([{ proposal_id: 'p-001', prompt: 'sample', created_at: new Date().toISOString(), state }]), { headers: jsonHeaders() });
    }

    try {
      // List proposals
      const plist = await kv.list({ prefix: 'proposal:' });
      const proposals: any[] = [];
      for (const k of plist.keys || []) {
        const v = await kv.get(k.name);
        if (!v) continue;
        try {
          const obj = JSON.parse(v);
          proposals.push(obj);
        } catch {}
      }

      // Build vote-derived states if needed
      let result: any[] = proposals;
      if (state === 'approved' || state === 'vetoed') {
        const vlist = await kv.list({ prefix: 'vote:' });
        const lastVoteByProposal = new Map<string, any>();
        for (const k of vlist.keys || []) {
          const v = await kv.get(k.name);
          if (!v) continue;
          try {
            const vote = JSON.parse(v);
            if (vote?.proposal_id && vote?.vote) {
              const prev = lastVoteByProposal.get(vote.proposal_id);
              if (!prev || (prev.timestamp || '') < (vote.timestamp || '')) {
                lastVoteByProposal.set(vote.proposal_id, vote);
              }
            }
          } catch {}
        }
        result = proposals
          .map(p => {
            const lv = lastVoteByProposal.get(p.proposal_id);
            const derived = lv?.vote || p.state;
            return { ...p, state: derived };
          })
          .filter(p => p.state === state);
      } else if (state === 'pending') {
        // Pending: proposals without an approve/veto last vote
        const vlist = await kv.list({ prefix: 'vote:' });
        const hasVote = new Set<string>();
        for (const k of vlist.keys || []) {
          const v = await kv.get(k.name);
          if (!v) continue;
          try {
            const vote = JSON.parse(v);
            if (vote?.proposal_id) hasVote.add(vote.proposal_id);
          } catch {}
        }
        result = proposals.filter(p => !hasVote.has(p.proposal_id));
      }

      return new Response(JSON.stringify(result), { headers: jsonHeaders() });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: 'kv_error', message: e.message }), { status: 500, headers: jsonHeaders() });
    }
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
