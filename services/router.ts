import * as providers from '../providers';

const PROVIDERS = [
  providers.gptProvider,
  providers.grok4Provider,
  providers.claudeProvider,
  providers.petalsProvider,
  providers.wondercraftProvider,
  providers.tinygradProvider,
];

export async function routePrompt(prompt: string) {
  const timings: { name: string; latency: number }[] = [];
  // Simple parallel warm check on a subset for telemetry
  const sample = PROVIDERS.slice(0, Math.min(3, PROVIDERS.length));
  await Promise.all(sample.map(async (fn, i) => {
    const t0 = Date.now();
    try { await fn('[probe]'); } catch {}
    timings.push({ name: `p${i+1}`, latency: Date.now() - t0 });
  }));
  // Select currently a simple random provider (placeholder for SLA logic)
  const selected = PROVIDERS[Math.floor(Math.random() * PROVIDERS.length)];
  const tStart = Date.now();
  const out = await selected(prompt);
  const latency = Date.now() - tStart;
  return { response: out.response, latencyMs: latency, providerLatencyMs: out.latency, route: { provider: selected.name || 'anon', probes: timings } };
}
