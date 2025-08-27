#!/usr/bin/env node

/**
 * Dynamic Evidence Builder (DB-backed)
 * Reads training metrics from local DB (simulated) and writes evidence
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getCurrentCommit() {
  try { return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim(); }
  catch { return new Date().getTime().toString(16); }
}

function readDbRuns() {
  const dbPath = join(__dirname, '../evidence/training/runs.db.json');
  if (!existsSync(dbPath)) throw new Error('DB offline (runs.db.json missing)');
  const raw = readFileSync(dbPath, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data) || data.length === 0) throw new Error('No runs found in DB');
  return data;
}

function generateBuildInfo() {
  return { commit: getCurrentCommit(), buildTime: new Date().toISOString(), env: 'prod' };
}

async function main() {
  try {
    const commit = getCurrentCommit();
    const timestamp = new Date().toISOString();
    console.log(`Building evidence from DB commit=${commit} ts=${timestamp}`);

    const runs = readDbRuns();
    runs.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
    const latest = runs[0];

    const required = ['run_id','epoch','step','loss','duration_s','commit','ts'];
    const ok = required.every(k => latest[k] !== undefined);
    if (!ok) throw new Error('Latest run missing required fields');

    // Write outputs (assets + source)
    writeFileSync(join(__dirname, '../public/build-info.json'), JSON.stringify(generateBuildInfo(), null, 2));
    writeFileSync(join(__dirname, '../evidence/training/latest.json'), JSON.stringify(latest, null, 2));
    writeFileSync(join(__dirname, '../public/evidence/training/latest.json'), JSON.stringify(latest, null, 2));

    console.log('🎉 Evidence build completed from DB');
  } catch (error) {
    console.error('❌ Evidence build failed:', error.message);
    process.exit(1);
  }
}

main();
