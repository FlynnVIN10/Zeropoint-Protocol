#!/usr/bin/env node

/**
 * Build injection script for Zeropoint Protocol
 * Replaces __BUILD_SHA__ and __BUILD_TIME__ tokens with actual values
 * Copies public/ to .out/ for deployment
 */

import { execSync } from 'child_process';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Get build information
function getBuildInfo() {
  try {
    const commit = execSync('git rev-parse --short HEAD', { cwd: rootDir, encoding: 'utf8' }).trim();
    const buildTime = new Date().toISOString();
    
    console.log(`Build Info: commit=${commit}, time=${buildTime}`);
    return { commit, buildTime };
  } catch (error) {
    console.error('Error getting build info:', error.message);
    process.exit(1);
  }
}

// Copy directory recursively
function copyDir(src, dest) {
  try {
    mkdirSync(dest, { recursive: true });
    
    const files = readdirSync(src);
    for (const file of files) {
      const srcPath = join(src, file);
      const destPath = join(dest, file);
      
      if (statSync(srcPath).isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        copyFileSync(srcPath, destPath);
      }
    }
  } catch (error) {
    console.error(`Error copying ${src} to ${dest}:`, error.message);
    process.exit(1);
  }
}

// Replace tokens in file content
function replaceTokens(content, commit, buildTime) {
  return content
    .replace(/__BUILD_SHA__/g, commit)
    .replace(/__BUILD_TIME__/g, buildTime);
}

// Process file for token replacement
function processFile(filePath, commit, buildTime) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const processed = replaceTokens(content, commit, buildTime);
    writeFileSync(filePath, processed, 'utf8');
    console.log(`Processed: ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Main execution
async function main() {
  console.log('Starting build injection...');
  
  // Get build info
  const { commit, buildTime } = getBuildInfo();
  
  // Create output directory
  const outDir = join(rootDir, '.out');
  const publicDir = join(rootDir, 'public');
  
  console.log(`Copying ${publicDir} to ${outDir}...`);
  
  // Copy public directory to .out
  copyDir(publicDir, outDir);
  
  // Process files for token replacement
  const filesToProcess = [
    join(outDir, 'status/health/index.html'),
    join(outDir, 'status/ready/index.html'),
    join(outDir, 'status/version/index.html'),
    join(outDir, 'evidence/phase5/index.html'),
    join(outDir, 'evidence/v19/index.html')
  ];
  
  console.log('Replacing build tokens...');
  
  for (const file of filesToProcess) {
    if (existsSync(file)) {
      processFile(file, commit, buildTime);
    } else {
      console.log(`Skipping (not found): ${file}`);
    }
  }
  
  // Create build info file
  const buildInfoPath = join(outDir, 'build-info.json');
  const buildInfo = {
    commit,
    buildTime,
    env: 'prod',
    injectedAt: new Date().toISOString()
  };
  
  writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));
  console.log(`Created: ${buildInfoPath}`);
  
  console.log('Build injection complete!');
  console.log(`Output directory: ${outDir}`);
  console.log(`Commit: ${commit}`);
  console.log(`Build time: ${buildTime}`);
  
  // Output for CI/CD
  console.log(`commit=${commit}`);
  console.log(`build_time=${buildTime}`);
  console.log(`out_dir=${outDir}`);
}

// Import required modules
import { readdirSync, statSync, existsSync } from 'fs';

// Run main function
main().catch(error => {
  console.error('Build injection failed:', error);
  process.exit(1);
});
