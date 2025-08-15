export const dynamic = 'force-dynamic';
export const runtime = 'edge';

async function fetchProbe(url: string) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Failed to fetch ${url}`);
  return response.json();
}

export default async function StatusPage() {
  const [health, ready] = await Promise.all([
    fetchProbe('/api/healthz'),
    fetchProbe('/api/readyz')
  ]);

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-semibold">System Status</h1>
      <div className="mt-4 grid gap-2">
        <div>health.status: <code>{health.status}</code></div>
        <div>ready.ready: <code>{String(ready.ready)}</code></div>
        <div>commit: <code>{health.commit}</code></div>
        <div>buildTime: <code>{health.buildTime}</code></div>
      </div>
    </main>
  );
}
