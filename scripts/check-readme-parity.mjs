#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

function extractReadmeStructure() {
  try {
    const readme = readFileSync('README.md', 'utf8');
    const structureMatch = readme.match(/```\s*\n([\s\S]*?)\n```/);
    if (!structureMatch) {
      console.error('❌ No repository structure found in README.md');
      process.exit(1);
    }
    
    const structure = structureMatch[1];
    const lines = structure.split('\n').filter(line => line.trim());
    
    // Extract directory names from the structure
    const dirs = lines
      .filter(line => line.includes('├──') || line.includes('└──'))
      .map(line => {
        const match = line.match(/[├└]──\s*([^/\s]+)/);
        return match ? match[1].trim() : null;
      })
      .filter(Boolean);
    
    return dirs;
  } catch (error) {
    console.error('❌ Error reading README.md:', error.message);
    process.exit(1);
  }
}

function getActualRepoStructure() {
  try {
    const output = execSync('git ls-tree --name-only -d HEAD', { encoding: 'utf8' });
    const dirs = output.split('\n').filter(line => line.trim());
    return dirs;
  } catch (error) {
    console.error('❌ Error getting repo structure:', error.message);
    process.exit(1);
  }
}

function main() {
  console.log('🔍 Checking README ↔ Repo Tree Parity...');
  
  const readmeDirs = extractReadmeStructure();
  const actualDirs = getActualRepoStructure();
  
  console.log('📋 README structure:', readmeDirs);
  console.log('📁 Actual repo structure:', actualDirs);
  
  // Check for mismatches (exclude package.json as it's a file, not directory)
  const readmeDirsOnly = readmeDirs.filter(dir => dir !== 'package.json');
  const missingInReadme = actualDirs.filter(dir => !readmeDirsOnly.includes(dir));
  const extraInReadme = readmeDirsOnly.filter(dir => !actualDirs.includes(dir));
  
  if (missingInReadme.length > 0) {
    console.error('❌ Directories in repo but missing from README:', missingInReadme);
    process.exit(1);
  }
  
  if (extraInReadme.length > 0) {
    console.error('❌ Directories in README but not in repo:', extraInReadme);
    process.exit(1);
  }
  
  console.log('✅ README structure matches repo tree');
}

main();
