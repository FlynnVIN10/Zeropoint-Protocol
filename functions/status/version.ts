export const onRequest: PagesFunction = async ({ env }) => {
  const noCache = {
    "Content-Type":"application/json; charset=utf-8",
    "Cache-Control":"no-store, no-cache, must-revalidate, max-age=0",
    "Pragma":"no-cache","Expires":"0","X-Content-Type-Options":"nosniff"
  };
  const body = {
    phase: env.PHASE ?? "stage2",
    commit: String(env.COMMIT_SHA ?? "unknown"),
    ciStatus: env.CI_STATUS ?? "green",
    buildTime: env.BUILD_TIME ?? new Date().toISOString(),
    env: "prod",
  };
  return new Response(JSON.stringify(body), { status: 200, headers: noCache });
};
