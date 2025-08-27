#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

function readJSON(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

function list(dir, filter = () => true) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(filter).map(name => ({ name, full: path.join(dir, name) }));
}

function main() {
  const buildInfo = readJSON(path.join('public', 'build-info.json')) || {};
  const verifyDir = path.join('evidence', 'phase5', 'verify');
  const verify = list(verifyDir, n => n.endsWith('.json')).sort((a, b) => a.name.localeCompare(b.name));
  const latestVerify = verify[verify.length - 1]?.name || '';
  const deployLogPath = path.join('evidence', 'v19', 'deploy_log.txt');
  const deployLogExists = fs.existsSync(deployLogPath);

  const outDir = path.join('public', 'evidence', 'v19');
  fs.mkdirSync(outDir, { recursive: true });

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
        <p><a href="/evidence/phase5/verify/">/evidence/phase5/verify/</a></p>
        <p class="muted">Latest: ${latestVerify || 'n/a'}</p>
      </div>
      <div class="card">
        <h3>Deploy Log</h3>
        <p><a href="/evidence/v19/deploy_log.txt">/evidence/v19/deploy_log.txt</a></p>
        <p class="muted">${deployLogExists ? 'Present' : 'Not found'}</p>
      </div>
      <div class="card">
        <h3>Lighthouse</h3>
        <p><a href="/evidence/v19/lighthouse/">/evidence/v19/lighthouse/</a></p>
        <p class="muted">HTML reports</p>
      </div>
    </div>
  </body>
  </html>`;

  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
  console.log('Wrote public/evidence/v19/index.html');
}

main();


