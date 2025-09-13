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
    if (!body.dataset || !body.modelConfig) {
      return new Response(JSON.stringify({ error: 'Missing required fields: dataset, modelConfig' }), {
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
      jobId: `tinygrad_${Date.now()}`,
      status: 'started',
      dataset: body.dataset,
      modelConfig: body.modelConfig,
      trainingParams: body.trainingParams || {}
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
    console.error('Tinygrad training start error:', error);
    return new Response(JSON.stringify({ error: 'Failed to start training job' }), {
      status: 500,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff'
      }
    });
  }
};
