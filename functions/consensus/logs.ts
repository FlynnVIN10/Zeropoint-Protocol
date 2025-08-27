export async function onRequest(context: any) {
  try {
    const kv = (context as any).env?.SOULCHAIN;
    if (!kv || typeof kv.list !== 'function') {
      return new Response(JSON.stringify({ entries: [] }), { headers: jsonHeaders() });
    }
    const entries: any[] = [];
    const plist = await kv.list({ prefix: 'proposal:' });
    for (const k of plist.keys || []) {
      const v = await kv.get(k.name);
      if (!v) continue;
      try { entries.push({ type: 'proposal', key: k.name, data: JSON.parse(v) }); } catch {}
    }
    const vlist = await kv.list({ prefix: 'vote:' });
    for (const k of vlist.keys || []) {
      const v = await kv.get(k.name);
      if (!v) continue;
      try { entries.push({ type: 'vote', key: k.name, data: JSON.parse(v) }); } catch {}
    }
    entries.sort((a, b) => (a.data?.timestamp || a.data?.created_at || '').localeCompare(b.data?.timestamp || b.data?.created_at || ''));
    return new Response(JSON.stringify({ entries, ts: new Date().toISOString() }), { headers: jsonHeaders() });
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


