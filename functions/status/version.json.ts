export async function onRequest() {
  return new Response(JSON.stringify({
    commit: (globalThis as any).__BUILD_SHA__ || "unknown",
    buildTime: new Date().toISOString(),
    env: "prod"
  }), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "content-disposition": "inline"
    }
  });
}
