const { execSync } = require('node:child_process'), fs=require('fs'), path=require('path');
const short = (process.env.GITHUB_SHA || execSync('git rev-parse --short HEAD')).toString().trim();
const meta = { phase: process.env.PHASE||'stage2', commit: short, ciStatus: process.env.CI_STATUS||'green', buildTime: new Date().toISOString() };

fs.mkdirSync('public/status', { recursive:true });
fs.writeFileSync('public/status/version.json', JSON.stringify(meta, null, 2));

const dir = `public/evidence/phase2/verify/${short}`;
fs.mkdirSync(dir, { recursive:true });
fs.writeFileSync(`${dir}/index.json`, JSON.stringify({ ...meta, generated: meta.buildTime, verified: true }, null, 2));

console.log('ok', short);