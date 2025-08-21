export async function onRequest(context) {
  const { env } = context;
  return new Response(JSON.stringify({
    commit: env.__BUILD_SHA__ || "6185c88b",
    buildTime: env.__BUILD_TIME__ || new Date().toISOString(),
    env: env.ENV || "prod"
  }), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "content-disposition": "inline"
    }
  });
}
