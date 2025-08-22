export const onRequest = async (ctx: any) => {
  try {
    // Try to read commit from build-info.json
    let commit = "unknown";
    try {
      const buildInfoResponse = await fetch(`${ctx.url.origin}/build-info.json`);
      if (buildInfoResponse.ok) {
        const buildInfo = await buildInfoResponse.json();
        commit = buildInfo.commit;
      }
    } catch (e) {
      // Fallback to env var
      commit = ctx.env.__BUILD_SHA__ || "unknown";
    }
    
    const body = JSON.stringify({
      status: "ok",
      uptime: Math.floor((Date.now() - (globalThis as any).__start || 0)/1000),
      commit: commit
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
