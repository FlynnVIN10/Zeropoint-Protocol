export async function onRequest(context) {
  return new Response(JSON.stringify({
    training: true,
    epoch: 1,
    loss: 0.123
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
