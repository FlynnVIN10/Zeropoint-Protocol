export const onRequest = async (ctx: any) => {
  try {
    const url = new URL(ctx.request.url);
    const q = url.searchParams.get('q') || '';
    // Fetch config and instances
    const [cfgRes, instRes] = await Promise.all([
      fetch(new URL('/api/router/config', ctx.request.url).toString()),
      fetch(new URL('/api/router/instances', ctx.request.url).toString())
    ]);
    const cfg = await cfgRes.json().catch(() => ({}));
    const inst = await instRes.json().catch(() => ({ instances: [] }));

    // Select a provider (simple: first healthy instance, prefer higher weight provider)
    const weights: Record<string, number> = Object.fromEntries((cfg.providers || []).map((p: any) => [p.name, p.weight || 1]));
    const healthy = (inst.instances || []).filter((i: any) => i.status === 'healthy');
    healthy.sort((a: any, b: any) => (weights[b.provider] || 0) - (weights[a.provider] || 0));
    const selected = healthy[0] || null;

    const t0 = Date.now();
    // Simulated exec call for now
    const responseText = q ? `Echo: ${q}` : 'No query';
    const t1 = Date.now();
    const telemetry = { provider: selected?.provider || 'unknown', instance: selected?.id || 'none', latencyMs: t1 - t0 };

    return new Response(JSON.stringify({ response: responseText, telemetry, ts: new Date().toISOString() }), { headers: jsonHeaders() });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'internal', message: e.message }), { status: 500, headers: jsonHeaders() });
  }
};

function jsonHeaders() {
  return {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    'content-disposition': 'inline'
  } as Record<string, string>;
}


