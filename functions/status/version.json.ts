export async function onRequest() {
  return new Response(JSON.stringify({
    commit: process.env.__BUILD_SHA__ || "unknown",
    buildTime: process.env.__BUILD_TIME__ || new Date().toISOString(),
    env: process.env.ENV || "prod"
  }), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "content-disposition": "inline"
    }
  });
}
