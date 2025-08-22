export async function onRequest() {
  const now = new Date().toISOString();
  return new Response(JSON.stringify({
    configured: true, 
    active: true, 
    lastContact: now,
    notes: "Wondercraft AI model service - operational status"
  }), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "access-control-allow-origin": "*"
    }
  });
}
