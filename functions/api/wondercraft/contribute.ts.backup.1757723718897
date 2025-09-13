export const onRequest = async (context) => {
  const { request } = context;
  
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'allow': 'POST'
      }
    });
  }

  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.assetType || !body.assetData || !body.metadata || !body.contributor) {
      return new Response(JSON.stringify({ error: 'Missing required fields: assetType, assetData, metadata, contributor' }), {
        status: 400,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
          'x-content-type-options': 'nosniff'
        }
      });
    }

    // Mock response for now
    const result = {
      contributionId: `wondercraft_${Date.now()}`,
      status: 'submitted',
      assetType: body.assetType,
      metadata: body.metadata,
      contributor: body.contributor
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff'
      }
    });
  } catch (error) {
    console.error('Wondercraft contribution error:', error);
    return new Response(JSON.stringify({ error: 'Failed to submit contribution' }), {
      status: 500,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff'
      }
    });
  }
};
