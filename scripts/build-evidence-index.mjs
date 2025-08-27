#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

function readJSON(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

function list(dir, filter = () => true) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(filter).map(name => ({ name, full: path.join(dir, name) }));
}

function getRepoSlug() {
  try {
    const url = execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim();
    if (url.startsWith('git@')) {
      const m = url.match(/:(.+)\.git$/);
      return m ? m[1] : '';
    }
    const u = new URL(url);
    return u.pathname.replace(/^\//, '').replace(/\.git$/, '');
  } catch { return process.env.GITHUB_REPOSITORY || ''; }
}

async function fetchCiRuns() {
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || '';
  const repo = getRepoSlug();
  if (!repo || !token) return [];
  const res = await fetch(`https://api.github.com/repos/${repo}/actions/runs?per_page=5`, {
    headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json' }
  });
  if (!res.ok) return [];
  const data = await res.json().catch(() => ({}));
  return (data.workflow_runs || []).map(r => ({ name: r.name, status: r.status, conclusion: r.conclusion, url: r.html_url }));
}

async function main() {
  const buildInfo = readJSON(path.join('public', 'build-info.json')) || {};
  const verifyDir = path.join('evidence', 'phase5', 'verify');
  const verify = list(verifyDir, n => n.endsWith('.json')).sort((a, b) => a.name.localeCompare(b.name));
  const latestVerify = verify[verify.length - 1]?.name || '';
  const deployLogPath = path.join('evidence', 'v19', 'deploy_log.txt');
  const deployLogExists = fs.existsSync(deployLogPath);

  // Mirror latest verify JSONs to public
  const publicVerifyDir = path.join('public', 'evidence', 'v19', 'verify');
  fs.mkdirSync(publicVerifyDir, { recursive: true });
  const toCopy = verify.slice(-5); // last 5
  for (const v of toCopy) {
    fs.copyFileSync(v.full, path.join(publicVerifyDir, v.name));
  }

  // Smoke locations
  const smokePhase5Dir = path.join('evidence', 'phase5', 'smoke');
  const smoke19Dir = path.join('evidence', 'v19', 'smoke');
  const smokePhase5 = list(smokePhase5Dir, n => n.endsWith('.json')).sort((a, b) => a.name.localeCompare(b.name));
  const smoke19 = list(smoke19Dir, n => n.endsWith('.json')).sort((a, b) => a.name.localeCompare(b.name));

  // Fetch CI runs (optional)
  const ciRuns = await fetchCiRuns();

  const outDir = path.join('public', 'evidence', 'v19');
  fs.mkdirSync(outDir, { recursive: true });

  const ciSection = ciRuns.length ? `
      <div class="card">
        <h3>CI Runs</h3>
        <ul>
          ${ciRuns.map(r => `<li><a href="${r.url}">${r.name}</a> — ${r.conclusion || r.status}</li>`).join('')}
        </ul>
      </div>` : '';

  const smokeSection = (smokePhase5.length || smoke19.length) ? `
      <div class="card">
        <h3>Smoke Tests</h3>
        <p><a href="/evidence/phase5/smoke/">/evidence/phase5/smoke/</a></p>
        ${smokePhase5.length ? `<p class="muted">Latest: ${smokePhase5[smokePhase5.length - 1].name}</p>` : ''}
      </div>` : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Evidence v19 — Zeropoint Protocol</title>
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#111;color:#eee;margin:0;padding:24px}
    h1{margin-top:0}
    a{color:#9cf}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}
    .card{border:1px solid #333;border-radius:10px;padding:16px;background:#1a1a1a}
    .muted{color:#bbb;font-size:.9em}
    code{background:#000;padding:2px 4px;border-radius:4px}
  </style>
  </head>
  <body>
    <h1>Evidence v19</h1>
    <div class="grid">
      <div class="card">
        <h3>Build Info</h3>
        <p><strong>Commit:</strong> <code>${buildInfo.commit || 'unknown'}</code></p>
        <p><strong>Build Time:</strong> <code>${buildInfo.buildTime || 'unknown'}</code></p>
        <p><strong>Env:</strong> <code>${buildInfo.env || 'prod'}</code></p>
      </div>
      <div class="card">
        <h3>Verification</h3>
        <p><a href="/evidence/v19/verify/">/evidence/v19/verify/</a></p>
        <p class="muted">Latest: ${latestVerify || 'n/a'}</p>
      </div>
      <div class="card">
        <h3>Deploy Log</h3>
        <p><a href="/evidence/v19/deploy_log.txt">/evidence/v19/deploy_log.txt</a></p>
        <p class="muted">${deployLogExists ? 'Present' : 'Not found'}</p>
      </div>
      <div class="card">
        <h3>Lighthouse</h3>
        <p><a href="/evidence/v19/lighthouse/lighthouse_report.html">/evidence/v19/lighthouse/lighthouse_report.html</a></p>
        <p class="muted">HTML report and metadata</p>
      </div>
      ${smokeSection}
      ${ciSection}
    </div>
  </body>
  </html>`;

  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
  console.log('Wrote public/evidence/v19/index.html and mirrored verify JSONs');
}

main();


