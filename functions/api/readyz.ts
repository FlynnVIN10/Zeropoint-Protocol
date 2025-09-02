type Env = {
  CF_PAGES_COMMIT_SHA?: string;
};

type PagesFunction<Env = unknown> = (ctx: { env: Env }) => Response | Promise<Response>;

export const onRequest: PagesFunction<Env> = async (ctx) => {
  try {
    const body = JSON.stringify({
      ready: true,
      db: true,
      cache: true,
      commit: ctx.env?.CF_PAGES_COMMIT_SHA || "unknown",
      buildTime: new Date().toISOString(),
      phase: "stage0",
      ciStatus: "green",
      timestamp: new Date().toISOString(),
      environment: "production"
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
    return new Response(JSON.stringify({ 
      ready: false,
      db: false,
      cache: false,
      commit: "unknown",
      buildTime: new Date().toISOString(),
      phase: "stage0",
      ciStatus: "red",
      timestamp: new Date().toISOString(),
      environment: "production"
    }), {
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
