export const onRequest = async (ctx: any) =>
  new Response(JSON.stringify({
    commit: ctx.env.__BUILD_SHA__ || "unknown",
    buildTime: ctx.env.BUILD_TIME || new Date().toISOString(),
    env: "prod"
  }), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "content-disposition": "inline",
      "access-control-allow-origin": "*"
    }
  });
