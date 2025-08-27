export const onRequest = async (ctx: any) => {
  try {
    let statusData: any | undefined;

    // Try fetching from the static asset via origin URL (works in local dev)
    try {
      const originUrl = new URL('/evidence/training/latest.json', ctx.request.url);
      const r = await fetch(originUrl.toString());
      if (r.ok) {
        statusData = await r.json();
      }
    } catch {}

    // Fallback: fetch from ASSETS binding (works on Pages deploy)
    if (!statusData) {
      const possiblePaths = [
        '/evidence/training/latest.json',
        'evidence/training/latest.json',
        '/training/latest.json'
      ];
      for (const path of possiblePaths) {
        try {
          const response = await ctx.env.ASSETS.fetch(path);
          if (response && (response as any).ok) {
            statusData = await response.json();
            break;
          }
        } catch {}
      }
    }

    if (!statusData) {
      const defaultData = { run_id: 'none', epoch: 0, step: 0, loss: 0, duration_s: 0, commit: '', ts: new Date().toISOString() };
      return new Response(JSON.stringify(defaultData), { headers: jsonHeaders() });
    }

    return new Response(JSON.stringify(statusData), { headers: jsonHeaders() });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'internal', message: error.message }), { status: 500, headers: jsonHeaders() });
  }
};

function jsonHeaders() {
  return {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "content-disposition": "inline",
    "access-control-allow-origin": "*"
  } as Record<string, string>;
}
