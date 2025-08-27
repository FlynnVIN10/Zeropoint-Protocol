#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

function findUnverifiedClaims(content) {
  const unverifiedPatterns = [
    // Hardcoded metrics
    /\b\d+%\b/g, // Percentage values
    /\b\d+ms\b/g, // Response times
    /\b\d+k\s+req\/s\b/g, // Throughput
    /\b\d+,\d+\b/g, // Large numbers (agent counts, etc.)
    
    // Service status claims
    /Operational/g,
    /Online/g,
    /Active/g,
    /Running/g,
    
    // Performance metrics
    /CPU Usage/g,
    /Memory Usage/g,
    /Network I\/O/g,
    /Response Time/g,
    /Throughput/g,
    /Uptime/g,
    
    // Infrastructure claims
    /Data Centers/g,
    /Load Balancers/g,
    /Database Clusters/g,
    /CDN Nodes/g,
    
    // Version claims
    /Platform Version/g,
    /Build Date/g,
    /Last Restart/g,
    
    // Incident history
    /Resolved/g,
    /Completed/g,
    /Minor Performance Degradation/g,
    /Scheduled Maintenance/g,
  ];
  
  const violations = [];
  
  unverifiedPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      violations.push(...matches);
    }
  });
  
  return violations;
}

function checkStatusPage() {
  try {
    const candidatePaths = [
      'app/status/page.tsx',
      'app/(spa)/page.tsx'
    ];
    let statusContent = '';
    for (const p of candidatePaths) {
      if (existsSync(p)) { statusContent = readFileSync(p, 'utf8'); break; }
    }
    if (!statusContent) throw new Error('status page not found');
    const violations = findUnverifiedClaims(statusContent);
    
    if (violations.length > 0) {
      console.error('❌ Unverified claims found in status page:');
      violations.forEach(violation => console.error(`   ${violation}`));
      return violations;
    }
    
    return [];
  } catch (error) {
    console.error('❌ Error reading status page:', error.message);
    return ['ERROR_READING_FILE'];
  }
}

function verifyHealthEndpoints() {
  try {
    // CF Pages Functions endpoints (not Next.js routes)
    console.log('🔍 Checking health endpoints...');

    const cfHealthz = 'functions/api/healthz.ts';
    const cfReadyz  = 'functions/api/readyz.ts';

    if (!existsSync(cfHealthz) || !existsSync(cfReadyz)) {
      console.error('❌ Health endpoints not found');
      console.error(`Expected: ${cfHealthz}, ${cfReadyz}`);
      return false;
    }

    const healthzContent = readFileSync(cfHealthz, 'utf8');
    const readyzContent  = readFileSync(cfReadyz, 'utf8');

    const requiredHeaders = [
      'content-type',
      'cache-control',
      'x-content-type-options',
      'content-disposition',
      'strict-transport-security',
      'content-security-policy',
      'referrer-policy',
      'permissions-policy'
    ];

    const hasAll = (txt) => requiredHeaders.every(h => txt.toLowerCase().includes(h));

    if (!hasAll(healthzContent) || !hasAll(readyzContent)) {
      console.error('❌ Health endpoints missing required headers');
      return false;
    }

    console.log('✅ Health endpoints properly configured');
    return true;
  } catch (error) {
    console.error('❌ Error checking health endpoints:', error.message);
    return false;
  }
}

function main() {
  console.log('🔍 Verifying /status page only shows verified data...');
  
  // Check for unverified claims in status page
  const violations = checkStatusPage();
  
  if (violations.length > 0) {
    console.error(`❌ Found ${violations.length} unverified claims in status page`);
    process.exit(1);
  }
  
  // Verify health endpoints exist
  if (!verifyHealthEndpoints()) {
    console.error('❌ Health endpoints not properly configured');
    process.exit(1);
  }
  
  console.log('✅ Status page only contains verified data');
  console.log('✅ Health endpoints properly configured');
}

main();
