// Cloudflare Pages Function -> /status/version.json
export const onRequest = async ({ env }: { env: Record<string, string | undefined> }) => {
  const body = JSON.stringify({
    phase: "stage1",
    commit: env.BUILD_COMMIT ?? "1604e587",
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