export const onRequest = async () => {
  try {
    const latest = await fetch("https://zeropointprotocol.ai/evidence/training/metrics/latest.json", { cf: { cacheTtl: 0 } });
    const body = await latest.text();
    return new Response(body, {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
        "content-disposition": "inline",
        "access-control-allow-origin": "*"
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "metrics_unavailable" }), {
      status: 503,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
        "content-disposition": "inline",
        "access-control-allow-origin": "*"
      }
    });
  }
};
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
