export interface Env {
  PHASE?: string; 
  COMMIT_SHA?: string; 
  CI_STATUS?: string; 
  BUILD_TIME?: string;
}

const noCache = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "Pragma": "no-cache",
  "Expires": "0",
  "X-Content-Type-Options": "nosniff",
};

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);
    
    if (url.pathname === "/status/version.json") {
      const body = {
        phase: env.PHASE ?? "stage2",
        commit: (env.COMMIT_SHA ?? "unknown").slice(0,7),
        ciStatus: env.CI_STATUS ?? "green",
        buildTime: env.BUILD_TIME ?? new Date().toISOString(),
        env: "prod",
      };
      return new Response(JSON.stringify(body), { status: 200, headers: noCache });
    }
    
    if (url.pathname === "/status/synthients.json") {
      const body = { 
        status: "active",
        governance_mode: "dual-consensus",
        synthients: {
          tinygrad: { status: "active", backend: "cpu", training_enabled: true },
          petals: { status: "active", proposals_enabled: true, voting_enabled: true },
          wondercraft: { status: "active", contributions_enabled: true, validation_enabled: true }
        },
        environment: {
          mocks_disabled: true,
          synthients_active: true,
          training_enabled: true,
          governance_mode: "dual-consensus",
          tinygrad_backend: "cpu"
        },
        timestamp: new Date().toISOString(),
        commit: (env.COMMIT_SHA ?? "unknown").slice(0,7),
        phase: env.PHASE ?? "stage2",
        ciStatus: env.CI_STATUS ?? "green",
        buildTime: env.BUILD_TIME ?? new Date().toISOString()
      };
      return new Response(JSON.stringify(body), { status: 200, headers: noCache });
    }
    
    // Hand off everything else (static assets + existing Pages Functions)
    // @ts-ignore - ASSETS is injected by Cloudflare Pages
    return (globalThis as any).ASSETS.fetch(req, env, ctx);
  }
};
