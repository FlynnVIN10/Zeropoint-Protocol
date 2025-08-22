export const onRequest = async (ctx: any) => {
  try {
    // Read build info from the static file
    const buildInfoResponse = await fetch(`${ctx.url.origin}/build-info.json`);
    if (buildInfoResponse.ok) {
      const buildInfo = await buildInfoResponse.json();
      return new Response(JSON.stringify(buildInfo), {
        headers: {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store",
          "x-content-type-options": "nosniff",
          "content-disposition": "inline",
          "access-control-allow-origin": "*"
        }
      });
    }
    
    // Fallback to env vars if file not found
    const buildInfo = {
      commit: ctx.env.__BUILD_SHA__ || "unknown",
      buildTime: ctx.env.BUILD_TIME || new Date().toISOString(),
      env: "prod"
    };
    
    return new Response(JSON.stringify(buildInfo), {
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
      commit: "unknown",
      buildTime: new Date().toISOString(),
      env: "prod"
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
