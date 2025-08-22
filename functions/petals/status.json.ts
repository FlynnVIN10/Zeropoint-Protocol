export const onRequest = async () => new Response(JSON.stringify({ configured: true, lastContact: new Date().toISOString(), notes: "Stub for Petals status" }), {
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "content-disposition": "inline",
    "access-control-allow-origin": "*"
  }
});
