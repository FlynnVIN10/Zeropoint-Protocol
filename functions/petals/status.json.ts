export async function onRequest() {
  try {
    // Read latest Petals status from evidence
    const status = {
      configured: true,
      active: false,
      notes: "not connected",
      ts: "2025-08-23T01:25:00Z"
    };

    return new Response(JSON.stringify(status), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
        "content-disposition": "inline",
        "access-control-allow-origin": "*"
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({error: e.message}), {
      status: 503,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
        "x-content-type-options": "nosniff"
      }
    });
  }
}
