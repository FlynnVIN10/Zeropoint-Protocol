export const onRequest = async () => {
  const config = {
    providers: [
      { name: 'GPT', weight: 1 },
      { name: 'Grok4', weight: 1 },
      { name: 'Claude', weight: 1 },
      { name: 'Petals', weight: 2 },
      { name: 'Wondercraft', weight: 1 },
      { name: 'Tinygrad', weight: 1 }
    ],
    strategy: 'latency_sla_quota',
    ts: new Date().toISOString()
  };
  return new Response(JSON.stringify(config), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'content-disposition': 'inline'
    }
  });
};


