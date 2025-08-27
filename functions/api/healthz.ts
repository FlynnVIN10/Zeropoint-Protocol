export const onRequest = async (ctx: any) => {
  try {
    const body = JSON.stringify({
      status: "ok",
      uptime: Math.floor(((globalThis as any).__start ? Date.now() - (globalThis as any).__start : 0)/1000),
      commit: ctx.env?.CF_PAGES_COMMIT_SHA || "unknown"
    });

    return new Response(body, {
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
  } catch (error) {
    return new Response(JSON.stringify({ status: "error", uptime: 0, commit: "unknown" }), {
      status: 500,
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
