export async function onRequest() {
  return new Response(JSON.stringify({
    status: "ok",
    uptime: Math.floor((Date.now() - Date.now() + 1000) / 1000),
    commit: (globalThis as any).__BUILD_SHA__ || "unknown"
  }), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "content-disposition": "inline"
    }
  });
}
