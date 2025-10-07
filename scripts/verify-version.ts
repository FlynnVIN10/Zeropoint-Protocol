#!/usr/bin/env node
/**
 * verify-version.ts - Assert version.json ciStatus === "green"
 * Per CTO directive: CI gate enforcement
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface VersionFile {
  phase: string;
  commit: string;
  ciStatus: string;
  buildTime: string;
}

function verifyVersion(expectGreen = false) {
  const versionPath = join(process.cwd(), 'public', 'status', 'version.json');
  
  try {
    const content = readFileSync(versionPath, 'utf-8');
    const version: VersionFile = JSON.parse(content);
    
    console.log('📄 version.json contents:');
    console.log(`   - phase: ${version.phase}`);
    console.log(`   - commit: ${version.commit}`);
    console.log(`   - ciStatus: ${version.ciStatus}`);
    console.log(`   - buildTime: ${version.buildTime}`);
    
    // Validate required fields
    const requiredFields = ['phase', 'commit', 'ciStatus', 'buildTime'];
    const missing = requiredFields.filter(field => !version[field as keyof VersionFile]);
    
    if (missing.length > 0) {
      console.error(`❌ Missing required fields: ${missing.join(', ')}`);
      process.exit(1);
    }
    
    // Validate commit SHA format (7+ hex chars or "local")
    if (version.commit !== 'local' && !/^[0-9a-f]{7,}$/.test(version.commit)) {
      console.error(`❌ Invalid commit SHA format: ${version.commit}`);
      process.exit(1);
    }
    
    // Validate ciStatus
    const validStatuses = ['green', 'local', 'yellow', 'red'];
    if (!validStatuses.includes(version.ciStatus)) {
      console.error(`❌ Invalid ciStatus: ${version.ciStatus}`);
      console.error(`   Valid values: ${validStatuses.join(', ')}`);
      process.exit(1);
    }
    
    // If expectGreen flag set (for production), enforce green status
    if (expectGreen && version.ciStatus !== 'green') {
      console.error(`❌ Expected ciStatus="green", got "${version.ciStatus}"`);
      process.exit(1);
    }
    
    console.log('✅ version.json validation passed');
    
    return version;
    
  } catch (error) {
    console.error('❌ Failed to verify version.json:', error);
    process.exit(1);
  }
}

// Check for --expect-green flag
const expectGreen = process.argv.includes('--expect-green');

verifyVersion(expectGreen);

