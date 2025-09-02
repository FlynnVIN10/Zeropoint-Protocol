export const onRequest = async (ctx: any) => {
  try {
    const buildInfo = {
      phase: "stage0",
      commit: ctx.env?.CF_PAGES_COMMIT_SHA || "unknown",
      ciStatus: "green",
      buildTime: new Date().toISOString(),
      env: "prod"
    };

    return new Response(JSON.stringify(buildInfo), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
        "content-disposition": "inline",
        "access-control-allow-origin": "*",
        // Security headers required by Gate
        "strict-transport-security": "max-age=31536000; includeSubDomains; preload",
        "content-security-policy": "default-src 'self'; connect-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'; base-uri 'self'; upgrade-insecure-requests",
        "referrer-policy": "strict-origin-when-cross-origin",
        "permissions-policy": "accelerometer=(), autoplay=(), camera=(), clipboard-read=(), clipboard-write=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      commit: "unknown",
      buildTime: "unknown",
      env: "prod"
    }), {
      status: 500,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
        "x-content-type-options": "nosniff"
      }
    });
  }
};
