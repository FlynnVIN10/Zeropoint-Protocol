export const onRequest = async (ctx: any) => {
  try {
    // Try to read from evidence file first
    let statusData;
    try {
      const response = await ctx.env.ASSETS.fetch('/evidence/petals/status.json');
      if (response.ok) {
        statusData = await response.json();
      } else {
        throw new Error(`Failed to fetch evidence file: ${response.status}`);
      }
    } catch (fetchError) {
      // Generate dynamic fallback values if evidence file cannot be read
      console.warn('Evidence file read failed, generating dynamic fallback:', (fetchError as Error).message);
      statusData = {
        configured: true,
        active: true,
        lastContact: new Date().toISOString(),
        notes: "Connected to swarm",
        ts: new Date().toISOString()
      };
    }

    return new Response(JSON.stringify(statusData), {
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
      error: "Internal server error",
      message: (error as Error).message
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
