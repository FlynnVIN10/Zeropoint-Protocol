#!/usr/bin/env node
/**
 * branch-protection-dump.ts - Fetch and store branch protection settings
 * Per CTO directive: Evidence automation for branch protection
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const OWNER = 'FlynnVIN10';
const REPO = 'Zeropoint-Protocol';
const BRANCH = 'main';

async function dumpBranchProtection() {
  const date = new Date().toISOString().split('T')[0];
  const outputDir = join(process.cwd(), 'public', 'evidence', 'compliance', date);
  const outputFile = join(outputDir, 'branch-protection.json');
  
  try {
    // Create output directory
    mkdirSync(outputDir, { recursive: true });
    
    // Fetch branch protection settings via GitHub CLI
    const command = `gh api repos/${OWNER}/${REPO}/branches/${BRANCH}/protection -H "Accept: application/vnd.github+json"`;
    const output = execSync(command, { encoding: 'utf-8' });
    
    // Parse and pretty-print
    const protection = JSON.parse(output);
    writeFileSync(outputFile, JSON.stringify(protection, null, 2));
    
    console.log(`✅ Branch protection dumped to: ${outputFile}`);
    
    // Verify required settings
    const required_reviewers = protection.required_pull_request_reviews?.required_approving_review_count || 0;
    const required_checks = protection.required_status_checks?.contexts || [];
    const force_push_allowed = protection.allow_force_pushes?.enabled || false;
    
    console.log(`   - Required reviewers: ${required_reviewers}`);
    console.log(`   - Required status checks: ${required_checks.join(', ')}`);
    console.log(`   - Force push allowed: ${force_push_allowed}`);
    
    // Validate per CTO directive
    if (required_reviewers < 1) {
      console.warn('⚠️  WARNING: Less than 1 required reviewer');
    }
    if (!required_checks.includes('build-test') && !required_checks.includes('ci-local')) {
      console.warn('⚠️  WARNING: Neither build-test nor ci-local required');
    }
    if (force_push_allowed) {
      console.warn('⚠️  WARNING: Force push is allowed');
    }
    
  } catch (error) {
    console.error('❌ Failed to dump branch protection:', error);
    process.exit(1);
  }
}

dumpBranchProtection();

