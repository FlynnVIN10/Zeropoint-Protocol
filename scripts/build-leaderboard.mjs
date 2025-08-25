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
function validateMetrics(metrics) {
  const required = ['run_id', 'model', 'started_at', 'ended_at', 'dataset', 'metrics'];
  const metricsRequired = ['loss', 'accuracy'];
  
  // Check required fields
  if (!required.every(field => metrics.hasOwnProperty(field) && metrics[field] !== null && metrics[field] !== undefined)) {
    return false;
  }
  
  // Check metrics object
  if (!metrics.metrics || !metricsRequired.every(field => metrics.metrics.hasOwnProperty(field))) {
    return false;
  }
  
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

// Build leaderboard from submission files
function buildLeaderboard() {
  try {
    const submissionsDir = join(__dirname, '..', 'evidence', 'training', 'submissions');
    const submissionFiles = findSubmissionFiles(submissionsDir);
    
    console.log(`Found ${submissionFiles.length} submission files`);
    
    const submissions = [];
    
    for (const file of submissionFiles) {
      try {
        const content = readFileSync(file, 'utf8');
        const metrics = JSON.parse(content);
        
        if (validateMetrics(metrics)) {
          submissions.push({
            run_id: metrics.run_id,
            model: metrics.model,
            started_at: metrics.started_at,
            ended_at: metrics.ended_at,
            dataset: metrics.dataset,
            loss: metrics.metrics.loss,
            accuracy: metrics.metrics.accuracy,
            notes: metrics.notes || '',
            file_path: file.replace(join(__dirname, '..'), '')
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
      unique_models: new Set(submissions.map(s => s.model)).size,
      datasets: submissions.reduce((acc, s) => {
        acc[s.dataset] = (acc[s.dataset] || 0) + 1;
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
    console.log(`   - Unique models: ${summary.unique_models}`);
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
