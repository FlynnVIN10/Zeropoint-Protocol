// Cloudflare Pages Function -> /status/version.json
export const onRequest = async ({ env }: { env: Record<string, string | undefined> }) => {
  // Get current commit from environment variables or use fallback
  const getCurrentCommit = () => {
    try {
      // Try COMMIT_SHA first (set in wrangler.toml)
      if (env.COMMIT_SHA) {
        return env.COMMIT_SHA;
      }
      // Try Cloudflare Pages environment variables
      if (env.CF_PAGES_COMMIT_SHA) {
        return env.CF_PAGES_COMMIT_SHA.slice(0, 7);
      }
      // Try other common environment variables
      if (env.GITHUB_SHA) {
        return env.GITHUB_SHA.slice(0, 7);
      }
      if (env.VERCEL_GIT_COMMIT_SHA) {
        return env.VERCEL_GIT_COMMIT_SHA.slice(0, 7);
      }
    } catch (e) {
      // Ignore
    }
    return 'unknown';
  };

  const body = JSON.stringify({
    phase: "stage2",
    commit: getCurrentCommit(),
    ciStatus: "green",
    buildTime: new Date().toISOString(),
    env: "prod",
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