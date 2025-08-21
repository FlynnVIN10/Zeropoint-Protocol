export async function onRequest(context) {
  const { env } = context;
  return new Response(JSON.stringify({
    status: "ok",
    uptime: Math.floor(performance.now() / 1000),
    commit: env.__BUILD_SHA__ || "unknown"
  }), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "content-disposition": "inline",
      "access-control-allow-origin": "*"
    }
  });
}
