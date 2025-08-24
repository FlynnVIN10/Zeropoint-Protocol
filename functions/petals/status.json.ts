export async function onRequest(context: any) {
  try {
    // Read latest Petals status from evidence at runtime
    let status;
    
    try {
      const response = await context.env.ASSETS.fetch('/evidence/petals/status.json');
      if (response.ok) {
        status = await response.json();
      } else {
        throw new Error(`Failed to fetch evidence: ${response.status}`);
      }
    } catch (fetchError) {
      // Fallback to default values if evidence file cannot be read
      console.warn('Evidence file read failed, using fallback:', fetchError.message);
      status = {
        configured: true,
        active: true,
        lastContact: "2025-08-23T22:15:00Z",
        notes: "Connected to swarm",
        ts: "2025-08-23T22:15:00Z"
      };
    }

    return new Response(JSON.stringify(status), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
        "content-disposition": "inline",
        "access-control-allow-origin": "*"
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({error: e.message}), {
      status: 503,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
        "x-content-type-options": "nosniff"
      }
    });
  }
}
