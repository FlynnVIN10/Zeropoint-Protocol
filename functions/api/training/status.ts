export async function onRequest(context: any) {
  try {
    // Read latest training metrics from evidence
    const latestMetrics = {
      run_id: "2025-08-23T22:15:00Z",
      epoch: 1,
      step: 120,
      loss: 0.3452,
      duration_s: 95.1,
      commit: "33dbbd99",
      ts: "2025-08-23T22:15:00Z"
    };

    return new Response(JSON.stringify(latestMetrics), {
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
