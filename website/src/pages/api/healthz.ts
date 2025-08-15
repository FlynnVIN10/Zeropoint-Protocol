export const prerender = false;

export async function GET() {
  const body = JSON.stringify({
    status: 'ok',
    commit: import.meta.env.VITE_COMMIT ?? 'unknown',
    buildTime: import.meta.env.VITE_BUILD_TIME ?? 'unknown'
  });
  return new Response(body, { headers: { 'content-type': 'application/json' } });
}
