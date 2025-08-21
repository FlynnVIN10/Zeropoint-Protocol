export async function onRequest(context) {
  return new Response(JSON.stringify({
    ready: true,
    db: true,
    cache: true
  }), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "content-disposition": "inline"
    }
  });
}
