#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const SUBMISSIONS_DIR = join(__dirname, '../evidence/training/submissions');
const SCHEMA_FILE = join(__dirname, '../evidence/schemas/metrics.schema.json');
const LEADERBOARD_FILE = join(__dirname, '../evidence/training/leaderboard.json');
const MAX_ENTRIES = 100;

// Simple JSON schema validation
function validateMetrics(metrics, schema) {
  try {
    // Check required fields
    for (const field of schema.required) {
      if (!(field in metrics)) {
        return { valid: false, error: `Missing required field: ${field}` };
      }
    }

    // Check synthiant_id pattern
    if (!/^[a-zA-Z0-9_-]+$/.test(metrics.synthiant_id)) {
      return { valid: false, error: 'Invalid synthiant_id format' };
    }

    // Check run_id pattern
    if (!/^[a-zA-Z0-9_-]+$/.test(metrics.run_id)) {
      return { valid: false, error: 'Invalid run_id format' };
    }

    // Check timestamp format
    if (isNaN(Date.parse(metrics.timestamp))) {
      return { valid: false, error: 'Invalid timestamp format' };
    }

    // Check loss is number and non-negative
    if (typeof metrics.loss !== 'number' || metrics.loss < 0) {
      return { valid: false, error: 'Loss must be a non-negative number' };
    }

    // Check source enum
    const validSources = ['local', 'cloud', 'cluster', 'edge', 'hybrid'];
    if (!validSources.includes(metrics.source)) {
      return { valid: false, error: 'Invalid source value' };
    }

    // Check commit hash pattern
    if (!/^[a-f0-9]+$/.test(metrics.commit)) {
      return { valid: false, error: 'Invalid commit hash format' };
    }

    // Check device enum
    const validDevices = ['cpu', 'gpu', 'tpu', 'npu', 'hybrid'];
    if (!validDevices.includes(metrics.device)) {
      return { valid: false, error: 'Invalid device value' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: `Validation error: ${error.message}` };
  }
}

// Recursively find all metrics.json files
function findMetricsFiles(dir) {
  const files = [];
  
  try {
    const items = readdirSync(dir);
    
    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...findMetricsFiles(fullPath));
      } else if (item === 'metrics.json') {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dir}: ${error.message}`);
  }
  
  return files;
}

// Build leaderboard from valid submissions
function buildLeaderboard() {
  console.log('Building Synthiant Training Leaderboard...');
  
  try {
    // Read schema
    const schema = JSON.parse(readFileSync(SCHEMA_FILE, 'utf8'));
    console.log('✓ Schema loaded');
    
    // Find all metrics files
    const metricsFiles = findMetricsFiles(SUBMISSIONS_DIR);
    console.log(`✓ Found ${metricsFiles.length} metrics files`);
    
    const validSubmissions = [];
    const invalidSubmissions = [];
    
    // Process each metrics file
    for (const file of metricsFiles) {
      try {
        const metrics = JSON.parse(readFileSync(file, 'utf8'));
        const validation = validateMetrics(metrics, schema);
        
        if (validation.valid) {
          validSubmissions.push({
            synthiant_id: metrics.synthiant_id,
            run_id: metrics.run_id,
            timestamp: metrics.timestamp,
            loss: metrics.loss,
            source: metrics.source,
            commit: metrics.commit,
            device: metrics.device,
            file_path: file.replace(join(__dirname, '..'), '')
          });
        } else {
          invalidSubmissions.push({
            file: file,
            error: validation.error
          });
        }
      } catch (error) {
        invalidSubmissions.push({
          file: file,
          error: `JSON parse error: ${error.message}`
        });
      }
    }
    
    console.log(`✓ Valid submissions: ${validSubmissions.length}`);
    if (invalidSubmissions.length > 0) {
      console.log(`⚠ Invalid submissions: ${invalidSubmissions.length}`);
      console.log('Invalid submissions:');
      invalidSubmissions.forEach(sub => {
        console.log(`  ${sub.file}: ${sub.error}`);
      });
    }
    
    // Sort by loss (ascending - lower is better) and timestamp (descending - newer first)
    validSubmissions.sort((a, b) => {
      if (a.loss !== b.loss) {
        return a.loss - b.loss;
      }
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    // Take top N entries
    const leaderboard = validSubmissions.slice(0, MAX_ENTRIES);
    
    // Add metadata
    const leaderboardData = {
      generated_at: new Date().toISOString(),
      total_submissions: validSubmissions.length,
      invalid_submissions: invalidSubmissions.length,
      max_entries: MAX_ENTRIES,
      entries: leaderboard
    };
    
    // Write leaderboard
    writeFileSync(LEADERBOARD_FILE, JSON.stringify(leaderboardData, null, 2));
    console.log(`✓ Leaderboard written to ${LEADERBOARD_FILE}`);
    console.log(`✓ Top ${leaderboard.length} entries included`);
    
    // Display top 10
    if (leaderboard.length > 0) {
      console.log('\nTop 10 Leaderboard:');
      console.log('Rank | Synthiant ID | Loss | Source | Device | Timestamp');
      console.log('-----|--------------|------|--------|--------|-----------');
      leaderboard.slice(0, 10).forEach((entry, index) => {
        const rank = index + 1;
        const timestamp = new Date(entry.timestamp).toISOString().split('T')[0];
        console.log(`${rank.toString().padStart(4)} | ${entry.synthiant_id.padEnd(13)} | ${entry.loss.toFixed(6)} | ${entry.source.padEnd(6)} | ${entry.device.padEnd(6)} | ${timestamp}`);
      });
    }
    
    return { success: true, validCount: validSubmissions.length, invalidCount: invalidSubmissions.length };
    
  } catch (error) {
    console.error(`Error building leaderboard: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const result = buildLeaderboard();
  process.exit(result.success ? 0 : 1);
}

export { buildLeaderboard, validateMetrics };
