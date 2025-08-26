export async function onRequest(context: any) {
  const { request } = context;
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'method not allowed' }), { status: 405, headers: jsonHeaders() });

  const body = await request.json().catch(() => ({}));
  const validVoter = body?.voter === 'synthiant' || body?.voter === 'human';
  const validVote = body?.vote === 'approve' || body?.vote === 'veto';
  if (!validVoter || !validVote || typeof body?.proposal_id !== 'string') {
    return new Response(JSON.stringify({ error: 'invalid vote' }), { status: 400, headers: jsonHeaders() });
  }

  const result = { vote_id: crypto.randomUUID(), proposal_id: body.proposal_id, voter: body.voter, vote: body.vote, timestamp: new Date().toISOString() };
  return new Response(JSON.stringify(result), { status: 201, headers: jsonHeaders() });
}

function jsonHeaders() {
  return {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    'content-disposition': 'inline'
  };
}
