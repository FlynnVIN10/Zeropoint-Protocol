// Cloudflare Pages Function -> /status/version.json
export const onRequest = async ({ env }: { env: Record<string, string | undefined> }) => {
  // Get current commit from environment variables - no slicing, use COMMIT_SHA_SHORT
  const commit = env.COMMIT_SHA_SHORT || 'unknown';
  const phase = env.PHASE || 'stage2';
  const buildTime = env.BUILD_TIME ?? new Date().toISOString();
  const ragMode = env.RAG_MODE || 'beyond';

  const body = JSON.stringify({
    phase,
    commit,
    ciStatus: env.CI_STATUS ?? 'green',
    buildTime,
    env: "prod",
    status: "operational",
    ragMode, // Use environment variable
    synthients: {
      training: "active",
      proposals: "enabled",
      petals: "operational",
      wondercraft: "operational", 
      tinygrad: "operational"
    }
  });

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "Pragma": "no-cache",
      "Expires": "0",
      "X-Content-Type-Options": "nosniff",
      "X-Cache-Status": "BYPASS"
    },
  });
};