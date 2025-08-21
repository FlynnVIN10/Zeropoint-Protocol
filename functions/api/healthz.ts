export async function onRequest() {
  return new Response(JSON.stringify({
    status: "ok",
    uptime: Math.floor(process.uptime()),
    commit: process.env.__BUILD_SHA__ || "unknown"
  }), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "content-disposition": "inline"
    }
  });
}
