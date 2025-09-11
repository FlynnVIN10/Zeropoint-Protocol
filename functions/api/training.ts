export const onRequest: PagesFunction = async () => {
  try {
    // Return training metrics as per CTO contract
    const response = {
      activeRuns: 0,
      completedToday: 0,
      totalRuns: 0,
      last: {
        model: null,
        accuracy: null,
        loss: null,
        commit: null,
        updatedAt: null
      }
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'content-disposition': 'inline'
      }
    });
  } catch (error) {
    console.error('Training metrics error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch training metrics' }), {
      status: 500,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff'
      }
    });
  }
};
