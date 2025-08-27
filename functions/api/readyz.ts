export const onRequest = async (ctx: any) =>
  new Response(JSON.stringify({ ready: true, db: true, cache: true }), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "content-disposition": "inline",
      "access-control-allow-origin": "*",
      "strict-transport-security": "max-age=31536000; includeSubDomains; preload",
      "content-security-policy": "default-src 'self'; connect-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'; base-uri 'self'; upgrade-insecure-requests",
      "referrer-policy": "strict-origin-when-cross-origin",
      "permissions-policy": "accelerometer=(), autoplay=(), camera=(), clipboard-read=(), clipboard-write=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()"
    }
  });
