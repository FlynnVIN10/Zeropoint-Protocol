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
    if (!body.title || !body.description || !body.proposalType) {
      return new Response(JSON.stringify({ error: 'Missing required fields: title, description, proposalType' }), {
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
      proposalId: `petals_${Date.now()}`,
      status: 'submitted',
      title: body.title,
      description: body.description,
      proposalType: body.proposalType,
      synthientApproval: body.synthientApproval || false
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
    console.error('Petals proposal error:', error);
    return new Response(JSON.stringify({ error: 'Failed to submit proposal' }), {
      status: 500,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff'
      }
    });
  }
};
