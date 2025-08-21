export async function onRequest(context) {
  const { env } = context;
  return new Response(JSON.stringify({
    status: "ok",
    uptime: Math.floor(performance.now() / 1000),
    commit: env.__BUILD_SHA__ || "6185c88b"
  }), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "content-disposition": "inline"
    }
  });
}
