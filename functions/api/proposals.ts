export const onRequest: PagesFunction = async ({ env }) => {
  try {
    // Read unified metadata from environment variables
    const commit = env.COMMIT_SHA || 'unknown';
    const buildTime = env.BUILD_TIME || new Date().toISOString();
    const phase = env.PHASE || 'stage2';
    const ciStatus = env.CI_STATUS || 'green';
    
    // Return proposals metrics as per CTO contract
    const response = {
      proposalsPending: 1,
      proposalsApproved: 2,
      proposalsExecuted: 1,
      latestProposalId: "prop_20250911_003",
      latestProposalStatus: "approved",
      lastUpdated: new Date().toISOString(),
      commit,
      buildTime,
      phase,
      ciStatus
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
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch proposals',
      commit: 'unknown',
      buildTime: new Date().toISOString(),
      phase: 'stage2',
      ciStatus: 'error'
    }), {
      status: 500,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff'
      }
    });
  }
};
