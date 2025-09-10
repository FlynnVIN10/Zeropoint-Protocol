import { getBuildMeta } from '../../app/lib/buildMeta';

export const onRequest = async () => {
  const buildMeta = getBuildMeta();
  
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
    commit: buildMeta.commit,
    phase: buildMeta.phase,
    ciStatus: buildMeta.ciStatus,
    buildTime: buildMeta.buildTime
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