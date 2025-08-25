export const onRequest = async (ctx: any) => {
  try {
    const body = JSON.stringify({
      status: "ok",
      uptime: Math.floor((Date.now() - (globalThis as any).__start || 0)/1000),
      commit: ctx.env?.CF_PAGES_COMMIT_SHA || "8ac7004b" // Dynamic commit from Cloudflare Pages
    });
    
    return new Response(body, {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
        "content-disposition": "inline",
        "access-control-allow-origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      status: "error",
      uptime: 0,
      commit: "unknown"
    }), {
      status: 500,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
        "x-content-type-options": "nosniff"
      }
    });
  }
};
