export const onRequest = async () => {
  // Read unified metadata from static file
  let meta = { commit: 'unknown', phase: 'stage2', ciStatus: 'green', buildTime: new Date().toISOString() };
  try {
    meta = await fetch('/status/version.json', { cf: 'bypass' }).then(r => r.json());
  } catch (e) {
    console.warn('Could not read version.json, using fallback');
  }
  
  const response = {
    status: "active",
    governance_mode: "dual-consensus",
    synthients: {
      tinygrad: {
        status: "active",
        backend: "cpu",
        training_enabled: true,
        endpoints: {
          start: "/api/tinygrad/start",
          status: "/api/tinygrad/status/{jobId}",
          logs: "/api/tinygrad/logs/{jobId}"
        }
      },
      petals: {
        status: "active",
        proposals_enabled: true,
        voting_enabled: true,
        endpoints: {
          propose: "/api/petals/propose",
          vote: "/api/petals/vote/{proposalId}"
        }
      },
      wondercraft: {
        status: "active",
        contributions_enabled: true,
        validation_enabled: true,
        endpoints: {
          contribute: "/api/wondercraft/contribute",
          diff: "/api/wondercraft/diff"
        }
      }
    },
    environment: {
      mocks_disabled: true,
      synthients_active: true,
      training_enabled: true,
      governance_mode: "dual-consensus",
      tinygrad_backend: "cpu"
    },
    timestamp: new Date().toISOString(),
    commit: meta.commit,
    phase: meta.phase,
    ciStatus: meta.ciStatus,
    buildTime: meta.buildTime
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    }
  });
};