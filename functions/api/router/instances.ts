export const onRequest = async () => {
  const instances = [
    { id: 'p1', provider: 'Petals', region: 'us-east', status: 'healthy' },
    { id: 'g1', provider: 'GPT', region: 'us-west', status: 'healthy' }
  ];
  return new Response(JSON.stringify({ instances, ts: new Date().toISOString() }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'content-disposition': 'inline'
    }
  });
};


