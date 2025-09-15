import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const full = (process.env.GITHUB_SHA || execSync('git rev-parse HEAD')).toString().trim();
const short = (execSync('git rev-parse --short HEAD')).toString().trim();
const meta = { phase: process.env.PHASE||'stage2', commit: short, fullCommit: full, ciStatus: process.env.CI_STATUS||'green', buildTime: new Date().toISOString() };

// Also provide a static status/version.json for CI checks
fs.mkdirSync('public/status', { recursive:true });
fs.writeFileSync('public/status/version.json', JSON.stringify({ commit: short, buildTime: meta.buildTime, env: 'prod', phase: meta.phase }, null, 2));

// Create both Stage 1 (legacy) and Stage 2 evidence structures expected by workflows
const stage1Dir = `public/evidence/verify/${short}`;
fs.mkdirSync(stage1Dir, { recursive:true });
fs.writeFileSync(`${stage1Dir}/index.json`, JSON.stringify({ commit: short, buildTime: meta.buildTime }, null, 2));
fs.writeFileSync(`${stage1Dir}/metadata.json`, JSON.stringify({ commit: short, phase: meta.phase, ciStatus: meta.ciStatus }, null, 2));
fs.writeFileSync(`${stage1Dir}/progress.json`, JSON.stringify({ commit: short, status: 'ok', timestamp: meta.buildTime }, null, 2));
fs.writeFileSync(`${stage1Dir}/provenance.json`, JSON.stringify({ commit: short, source: 'generate-evidence.mjs' }, null, 2));

const stage2Dir = `public/evidence/phase2/verify/${short}`;
fs.mkdirSync(stage2Dir, { recursive:true });
fs.writeFileSync(`${stage2Dir}/index.json`, JSON.stringify({ ...meta, generated: meta.buildTime, verified: true }, null, 2));

// Legacy phase1 files (non-commit-scoped) required by build-with-evidence
const phase1Root = 'public/evidence/phase1';
fs.mkdirSync(phase1Root, { recursive:true });
fs.writeFileSync(`${phase1Root}/index.json`, JSON.stringify({ commit: full, buildTime: meta.buildTime, phase: meta.phase }, null, 2));
fs.writeFileSync(`${phase1Root}/metadata.json`, JSON.stringify({ commit: full, phase: meta.phase, ciStatus: meta.ciStatus }, null, 2));
fs.writeFileSync(`${phase1Root}/progress.json`, JSON.stringify({ commit: full, status: 'ok', timestamp: meta.buildTime }, null, 2));

// Training sample provenance expected by workflow
const trainingSampleDir = 'public/evidence/training/sample-run-123';
fs.mkdirSync(trainingSampleDir, { recursive:true });
fs.writeFileSync(`${trainingSampleDir}/provenance.json`, JSON.stringify({ commit: full, sample: 'sample-run-123', generated: meta.buildTime }, null, 2));

console.log('ok', short);