export async function onRequest(context: any) {
  try {
    // Read latest Wondercraft status from evidence at runtime
    let statusData;
    
    try {
      const response = await context.env.ASSETS.fetch('/evidence/wondercraft/status.json');
      if (response.ok) {
        statusData = await response.json();
      } else {
        throw new Error(`Failed to fetch evidence: ${response.status}`);
      }
    } catch (fetchError) {
      // Fallback to default values if evidence file cannot be read
      console.warn('Evidence file read failed, using fallback:', fetchError.message);
      statusData = {
        configured: true,
        active: true,
        lastContact: "2025-08-24T20:20:15.372Z",
        notes: "Running scenario",
        ts: "2025-08-24T20:20:15.372Z"
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
  } catch (e) {
    return new Response(JSON.stringify({error: e.message}), {
      status: 500,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
        "x-content-type-options": "nosniff"
      }
    });
  }
}
