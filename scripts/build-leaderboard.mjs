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

// Schema validation function
function validateMetrics(metrics, schema) {
  // Basic validation - in production, use a proper JSON schema validator
  const required = ['synthiant_id', 'run_id', 'epoch', 'step', 'loss', 'duration_s', 'commit', 'ts', 'source'];
  return required.every(field => metrics.hasOwnProperty(field) && metrics[field] !== null && metrics[field] !== undefined);
}

// Recursively find all metrics.json files
function findMetricsFiles(dir, files = []) {
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
  
  return files;
}

// Build leaderboard from metrics files
function buildLeaderboard() {
  try {
    const submissionsDir = join(__dirname, '..', 'evidence', 'training', 'submissions');
    const metricsFiles = findMetricsFiles(submissionsDir);
    
    console.log(`Found ${metricsFiles.length} metrics files`);
    
    const submissions = [];
    
    for (const file of metricsFiles) {
      try {
        const content = readFileSync(file, 'utf8');
        const metrics = JSON.parse(content);
        
        if (validateMetrics(metrics)) {
          submissions.push({
            synthiant_id: metrics.synthiant_id,
            run_id: metrics.run_id,
            ts: metrics.ts,
            loss: metrics.loss,
            source: metrics.source,
            epoch: metrics.epoch,
            step: metrics.step,
            duration_s: metrics.duration_s,
            commit: metrics.commit,
            device: metrics.device || 'unknown',
            notes: metrics.notes || ''
          });
        } else {
          console.warn(`Invalid metrics in ${file}`);
        }
      } catch (error) {
        console.warn(`Error reading ${file}:`, error.message);
      }
    }
    
    // Sort by loss (ascending - lower is better)
    submissions.sort((a, b) => a.loss - b.loss);
    
    // Take top 100 submissions
    const topSubmissions = submissions.slice(0, 100);
    
    // Generate summary statistics
    const summary = {
      total_submissions: submissions.length,
      unique_synthiants: new Set(submissions.map(s => s.synthiant_id)).size,
      sources: submissions.reduce((acc, s) => {
        acc[s.source] = (acc[s.source] || 0) + 1;
        return acc;
      }, {}),
      best_loss: submissions.length > 0 ? submissions[0].loss : null,
      average_loss: submissions.length > 0 ? submissions.reduce((sum, s) => sum + s.loss, 0) / submissions.length : null,
      generated_at: new Date().toISOString()
    };
    
    const leaderboard = {
      summary,
      submissions: topSubmissions
    };
    
    // Write leaderboard
    const outputPath = join(__dirname, '..', 'evidence', 'training', 'leaderboard.json');
    writeFileSync(outputPath, JSON.stringify(leaderboard, null, 2));
    
    console.log(`✅ Leaderboard built successfully:`);
    console.log(`   - Total submissions: ${summary.total_submissions}`);
    console.log(`   - Unique synthiants: ${summary.unique_synthiants}`);
    console.log(`   - Best loss: ${summary.best_loss}`);
    console.log(`   - Output: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Error building leaderboard:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  buildLeaderboard();
}

export { buildLeaderboard };
