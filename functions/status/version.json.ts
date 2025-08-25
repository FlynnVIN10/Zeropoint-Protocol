export const onRequest = async (ctx: any) => {
  try {
    // Return current build info
    const buildInfo = {
      commit: ctx.env?.CF_PAGES_COMMIT_SHA || "09d884e7", // Dynamic commit from Cloudflare Pages
      buildTime: "2025-08-25T04:02:13.3NZ", // Current build time
      env: "prod"
    };
    
    return new Response(JSON.stringify(buildInfo), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
        "content-disposition": "inline",
        "access-control-allow-origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      commit: "unknown",
      buildTime: new Date().toISOString(),
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
