#!/usr/bin/env node

/**
 * Synthiant Training Leaderboard Builder
 * Scans submissions and builds leaderboard
 */

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Schema validation function
function validateMetrics(metrics) {
  // Basic required field validation
  const required = ['synthiant_id', 'run_id', 'ts', 'loss', 'epoch', 'step', 'duration_s', 'commit', 'device', 'source'];
  
  for (const field of required) {
    if (!(field in metrics)) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }
  
  // Type validation
  if (typeof metrics.loss !== 'number' || metrics.loss < 0) {
    return { valid: false, error: 'Invalid loss value' };
  }
  
  if (typeof metrics.epoch !== 'number' || metrics.epoch < 0) {
    return { valid: false, error: 'Invalid epoch value' };
  }
  
  if (typeof metrics.step !== 'number' || metrics.step < 0) {
    return { valid: false, error: 'Invalid step value' };
  }
  
  if (typeof metrics.duration_s !== 'number' || metrics.duration_s < 0) {
    return { valid: false, error: 'Invalid duration value' };
  }
  
  // Commit hash validation
  if (!/^[a-f0-9]{7,40}$/.test(metrics.commit)) {
    return { valid: false, error: 'Invalid commit hash format' };
  }
  
  // Source validation
  const validSources = ['local', 'cloud', 'cluster', 'edge'];
  if (!validSources.includes(metrics.source)) {
    return { valid: false, error: 'Invalid source value' };
  }
  
  return { valid: true };
}

// Recursively find all metrics.json files
function findMetricsFiles(dir, files = []) {
  try {
    const items = readdirSync(dir);
    
    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        findMetricsFiles(fullPath, files);
      } else if (item === 'metrics.json') {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dir}:`, error.message);
  }
  
  return files;
}

// Build leaderboard from metrics files
function buildLeaderboard(metricsFiles) {
  const submissions = [];
  
  for (const file of metricsFiles) {
    try {
      const content = readFileSync(file, 'utf8');
      const metrics = JSON.parse(content);
      
      // Validate against schema
      const validation = validateMetrics(metrics);
      
      if (validation.valid) {
        submissions.push({
          synthiant_id: metrics.synthiant_id,
          run_id: metrics.run_id,
          ts: metrics.ts,
          loss: metrics.loss,
          epoch: metrics.epoch,
          step: metrics.step,
          duration_s: metrics.duration_s,
          commit: metrics.commit,
          device: metrics.device,
          source: metrics.source,
          notes: metrics.notes || '',
          file_path: file.replace(process.cwd(), '').replace(/\\/g, '/')
        });
      } else {
        console.warn(`Invalid metrics in ${file}: ${validation.error}`);
      }
    } catch (error) {
      console.warn(`Error reading ${file}:`, error.message);
    }
  }
  
  // Sort by loss (ascending - lower is better)
  submissions.sort((a, b) => a.loss - b.loss);
  
  // Take top 100 submissions
  const topSubmissions = submissions.slice(0, 100);
  
  return {
    generated_at: new Date().toISOString(),
    total_submissions: submissions.length,
    valid_submissions: submissions.length,
    top_submissions: topSubmissions,
    summary: {
      best_loss: submissions.length > 0 ? submissions[0].loss : null,
      worst_loss: submissions.length > 0 ? submissions[submissions.length - 1].loss : null,
      average_loss: submissions.length > 0 ? submissions.reduce((sum, s) => sum + s.loss, 0) / submissions.length : null,
      by_source: submissions.reduce((acc, s) => {
        acc[s.source] = (acc[s.source] || 0) + 1;
        return acc;
      }, {})
    }
  };
}

// Main execution
async function main() {
  const submissionsDir = join(__dirname, '../evidence/training/submissions');
  const outputFile = join(__dirname, '../evidence/training/leaderboard.json');
  
  console.log('🔍 Scanning for training submissions...');
  
  if (!statSync(submissionsDir, { throwIfNoEntry: false })) {
    console.log('📁 Creating submissions directory...');
    // Directory doesn't exist, create it with sample
    const sampleDir = join(submissionsDir, 'sample', '2025-08-24T00-00Z');
    mkdirSync(sampleDir, { recursive: true });
    
    const sampleMetrics = {
      synthiant_id: "sample_synthiant",
      run_id: "2025-08-24T00:00:00.000Z",
      ts: "2025-08-24T00:00:00.000Z",
      loss: 0.3452,
      epoch: 1,
      step: 120,
      duration_s: 95.1,
      commit: "8ac7004b",
      device: "macOS-14.0",
      source: "local",
      notes: "Sample submission for SCP v1 validation"
    };
    
    writeFileSync(join(sampleDir, 'metrics.json'), JSON.stringify(sampleMetrics, null, 2));
    console.log('✅ Created sample submission');
  }
  
  const metricsFiles = findMetricsFiles(submissionsDir);
  console.log(`📊 Found ${metricsFiles.length} metrics files`);
  
  const leaderboard = buildLeaderboard(metricsFiles);
  
  // Ensure output directory exists
  const outputDir = dirname(outputFile);
  if (!statSync(outputDir, { throwIfNoEntry: false })) {
    mkdirSync(outputDir, { recursive: true });
  }
  
  writeFileSync(outputFile, JSON.stringify(leaderboard, null, 2));
  console.log(`🏆 Leaderboard built with ${leaderboard.top_submissions.length} top submissions`);
  console.log(`📁 Written to: ${outputFile}`);
  
  // Display top 5
  if (leaderboard.top_submissions.length > 0) {
    console.log('\n🥇 Top 5 Submissions:');
    leaderboard.top_submissions.slice(0, 5).forEach((sub, i) => {
      console.log(`${i + 1}. ${sub.synthiant_id} - Loss: ${sub.loss} (${sub.source})`);
    });
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { buildLeaderboard, validateMetrics };
