#!/usr/bin/env node
import fs from 'fs';
import { performance } from 'perf_hooks';

const TARGETS = [
  { name: 'status_version_json', url: 'https://zeropointprotocol.ai/status/version.json' },
  { name: 'api_healthz', url: 'https://zeropointprotocol.ai/api/healthz' },
  { name: 'api_readyz', url: 'https://zeropointprotocol.ai/api/readyz' }
];

async function timeFetch(url) {
  const t0 = performance.now();
  const res = await fetch(url, { method: 'GET' });
  const t1 = performance.now();
  return { status: res.status, latencyMs: Math.round(t1 - t0) };
}

async function main() {
  const results = [];
  for (const target of TARGETS) {
    try {
      const r = await timeFetch(target.url);
      results.push({ target: target.name, url: target.url, ok: r.status === 200, status: r.status, latencyMs: r.latencyMs });
    } catch (e) {
      results.push({ target: target.name, url: target.url, ok: false, error: String(e) });
    }
  }
  results.sort((a, b) => (a.latencyMs ?? 1e9) - (b.latencyMs ?? 1e9));

  const evidenceDir = 'evidence/v20/routing';
  fs.mkdirSync(evidenceDir, { recursive: true });
  const out = {
    generatedAt: new Date().toISOString(),
    results,
    fastest: results.find(r => r.ok) || null
  };
  fs.writeFileSync(`${evidenceDir}/probe.json`, JSON.stringify(out, null, 2));
  console.log(`Wrote ${evidenceDir}/probe.json`);
}

main().catch(err => { console.error(err); process.exit(1); });
