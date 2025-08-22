export async function onRequest(context) {
  try {
    const latestRun = context.env.LATEST_TRAIN_RUN || '2025-08-22T20:30:45Z'; // KV or env for latest TS
    const metrics = await fetch(`https://zeropointprotocol.ai/evidence/training/run-${latestRun}/metrics.json`).then(r => r.json());
    return new Response(JSON.stringify(metrics), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
        "access-control-allow-origin": "*"
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({error: e.message}), {status: 503, headers: {...}});
  }
}
