export async function onRequest(context: any) {
  try {
    const kv = (context as any).env?.SOULCHAIN;
    let approved = 0;
    let vetoed = 0;
    if (kv && typeof kv.list === 'function') {
      // List votes and tally
      const votes = await kv.list({ prefix: 'vote:' });
      for (const k of votes.keys || []) {
        const val = await kv.get(k.name);
        if (!val) continue;
        try {
          const v = JSON.parse(val);
          if (v?.vote === 'approve') approved++;
          else if (v?.vote === 'veto') vetoed++;
        } catch {}
      }
    }
    const body = { approved, vetoed, ts: new Date().toISOString() };
    return new Response(JSON.stringify(body), { headers: jsonHeaders() });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'internal', message: e.message }), { status: 500, headers: jsonHeaders() });
  }
}

function jsonHeaders() {
  return {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    'content-disposition': 'inline'
  } as Record<string, string>;
}


