// Cloudflare Pages Function -> /status/version.json
export const onRequest = async ({ env }: { env: Record<string, string | undefined> }) => {
  const commit = (env.CF_PAGES_COMMIT_SHA ? env.CF_PAGES_COMMIT_SHA.slice(0, 8) : undefined)
    || env.BUILD_COMMIT
    || "0cf3c811";

  const body = JSON.stringify({
    phase: "stage1",
    commit,
    ciStatus: env.CI_STATUS ?? "green",
    buildTime: env.BUILD_TIME ?? new Date().toISOString(),
    env: "prod",
  });

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
};