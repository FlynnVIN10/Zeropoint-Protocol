export async function onRequest(context) {
  try {
    const latest = await fetch("https://zeropointprotocol.ai/evidence/training/metrics/latest.json", { cf: { cacheTtl: 0 } });
    if (!latest.ok) throw new Error("Fetch failed");
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
    return new Response(JSON.stringify({ error: "metrics_unavailable", message: e.message }), {
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
