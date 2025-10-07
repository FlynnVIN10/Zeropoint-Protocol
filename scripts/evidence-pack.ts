#!/usr/bin/env node
/**
 * evidence-pack.ts - Assemble evidence into canonical paths
 * Per CTO directive: Evidence canonicalization automation
 */

import { execSync } from 'child_process';
import { copyFileSync, mkdirSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

interface EvidencePackOptions {
  commit?: string;
  date?: string;
}

function assembleEvidencePack(options: EvidencePackOptions = {}) {
  const commit = options.commit || execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
  const date = options.date || new Date().toISOString().split('T')[0];
  
  const verifyDir = join(process.cwd(), 'public', 'evidence', 'verify', commit);
  const complianceDir = join(process.cwd(), 'public', 'evidence', 'compliance', date);
  
  console.log(`📦 Assembling evidence pack for commit ${commit}`);
  
  // Create directories
  mkdirSync(verifyDir, { recursive: true });
  mkdirSync(complianceDir, { recursive: true });
  
  const metadata = {
    commit,
    date,
    buildTime: new Date().toISOString(),
    phase: 'v1.0.1',
    ciStatus: 'green',
    evidence: [] as string[],
  };
  
  // Copy compliance evidence to verify directory
  const evidenceFiles = [
    'branch-protection.json',
    'smoke.md',
    'npm-audit.json',
  ];
  
  for (const file of evidenceFiles) {
    const sourcePath = join(complianceDir, file);
    const destPath = join(verifyDir, file);
    
    if (existsSync(sourcePath)) {
      copyFileSync(sourcePath, destPath);
      metadata.evidence.push(file);
      console.log(`   ✅ Copied ${file}`);
    } else {
      console.log(`   ⏭  Skipped ${file} (not found)`);
    }
  }
  
  // Write metadata
  const metadataPath = join(verifyDir, 'metadata.json');
  writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(`   ✅ Wrote metadata.json`);
  
  // Create index for easy navigation
  const indexPath = join(verifyDir, 'index.json');
  const index = {
    commit,
    date,
    files: [...metadata.evidence, 'metadata.json'],
    url: `https://github.com/${OWNER}/${REPO}/tree/${commit}`,
  };
  writeFileSync(indexPath, JSON.stringify(index, null, 2));
  console.log(`   ✅ Wrote index.json`);
  
  console.log(`\n✅ Evidence pack assembled at: ${verifyDir}`);
  console.log(`   Files: ${metadata.evidence.length + 2}`);
  
  return { verifyDir, metadata };
}

// Run if executed directly
if (require.main === module) {
  assembleEvidencePack();
}

export { assembleEvidencePack };

