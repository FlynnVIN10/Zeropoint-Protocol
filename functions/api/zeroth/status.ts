export const onRequest = async (ctx: any) => {
  const policy = {
    zeroth: {
      alignment: {
        intent: 'good',
        telemetry: 'none-hidden',
        ethics: 'enforced'
      },
      gates: {
        scp_v1: true,
        consensus_dual: true,
        mocks_disabled: true
      }
    },
    ts: new Date().toISOString()
  };
  return new Response(JSON.stringify(policy), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'content-disposition': 'inline'
    }
  });
};


