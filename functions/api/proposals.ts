export const onRequest: PagesFunction = async () => {
  try {
    // Return proposals list as per CTO contract
    const response = {
      items: [
        // Empty array for now - "No data yet" not "Error"
      ]
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
    console.error('Proposals error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch proposals' }), {
      status: 500,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff'
      }
    });
  }
};
