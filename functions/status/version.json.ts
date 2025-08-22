export const onRequest = async (ctx: any) => {
  try {
    // Return current build info
    const buildInfo = {
      commit: "860e8318", // Current commit SHA
      buildTime: "2025-08-22T23:11:03Z", // Current build time
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
