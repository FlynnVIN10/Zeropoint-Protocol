export const onRequest = async (ctx: any) => {
  const body = JSON.stringify({
    status: "ok",
    uptime: Math.floor((Date.now() - (globalThis as any).__start || 0)/1000),
    commit: ctx.env.__BUILD_SHA__ || "unknown"
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
};
