export async function onRequest(context) {
  try {
    // For now, return default status until training workflow produces metrics
    const defaultStatus = {
      status: "idle",
      lastRun: null,
      nextRun: "2025-08-23T00:00:00Z", // Next scheduled run
      configured: true,
      message: "Training workflow configured, awaiting first run"
    };
    
    return new Response(JSON.stringify(defaultStatus), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
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
