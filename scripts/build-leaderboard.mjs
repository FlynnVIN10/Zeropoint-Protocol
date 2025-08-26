#!/usr/bin/env node

/**
 * SCP v1 Leaderboard Builder
 * Scans training submissions and builds leaderboard
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUBMISSIONS_DIR = 'evidence/training/submissions';
const SCHEMA_FILE = 'evidence/schemas/metrics.schema.json';
const LEADERBOARD_FILE = 'evidence/training/leaderboard.json';

function validateMetrics(data) {
  // Simple validation for minimal schema
  const required = ['run_id', 'model', 'started_at', 'ended_at', 'dataset', 'metrics'];
  for (const key of required) {
    if (!data[key]) return false;
  }
  if (typeof data.metrics !== 'object' || typeof data.metrics.loss !== 'number' || typeof data.metrics.accuracy !== 'number') return false;
  return true;
}

// Recursively find all submission files
function findSubmissionFiles(dir, files = []) {
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      findSubmissionFiles(fullPath, files);
    } else if (item.endsWith('.json')) {
      files.push(fullPath);
    }
  }
  return files;
}

function buildLeaderboard() {
  const submissions = readdirSync(SUBMISSIONS_DIR, { recursive: true })
    .filter(file => file.endsWith('metrics.json'))
    .map(file => {
      const data = JSON.parse(readFileSync(join(SUBMISSIONS_DIR, file)));
      if (validateMetrics(data)) return data;
      return null;
    }).filter(Boolean);

  submissions.sort((a, b) => a.metrics.loss - b.metrics.loss);

  const summary = {
    total_submissions: submissions.length,
    unique_models: new Set(submissions.map(s => s.model)).size,
    best_loss: submissions[0]?.metrics.loss,
    average_loss: submissions.reduce((sum, s) => sum + s.metrics.loss, 0) / submissions.length
  };

  writeFileSync(LEADERBOARD_FILE, JSON.stringify({ entries: submissions, summary }, null, 2));
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  buildLeaderboard();
}

export { buildLeaderboard };
