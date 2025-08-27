export const onRequest = async (ctx: any) => {
  try {
    let statusData;
    const possiblePaths = [
      '/evidence/training/latest.json',
      'evidence/training/latest.json',
      '/training/latest.json'
    ];
    let found = false;
    for (const path of possiblePaths) {
      try {
        const response = await ctx.env.ASSETS.fetch(path);
        if (response.ok) {
          statusData = await response.json();
          found = true;
          break;
        }
      } catch {}
    }
    if (!found) {
      return new Response(JSON.stringify({ error: 'no_data' }), { status: 503, headers: jsonHeaders() });
    }
    return new Response(JSON.stringify(statusData), { headers: jsonHeaders() });
  } catch (error) {
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
  };
}
