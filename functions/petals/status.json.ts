export async function onRequest() {
  return new Response(JSON.stringify({configured: true, active: true, lastContact: "2025-08-22T20:45:00Z", notes: "Operational"}), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "access-control-allow-origin": "*"
    }
  });
}
