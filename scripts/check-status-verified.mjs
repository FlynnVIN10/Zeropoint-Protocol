#!/usr/bin/env node

import { readFileSync } from 'fs';

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
    const statusContent = readFileSync('app/status/page.tsx', 'utf8');
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
    // Check for health endpoints
    console.log('🔍 Checking health endpoints...');
    
    const healthzPath = 'app/api/healthz/route.ts';
    const readyzPath = 'app/api/readyz/route.ts';
    
    if (!fs.existsSync(healthzPath) || !fs.existsSync(readyzPath)) {
      console.error('❌ Health endpoints not found');
      console.error(`Expected: ${healthzPath}, ${readyzPath}`);
      return false;
    }
    
    // Check that they export dynamic = 'force-dynamic'
    const healthzContent = fs.readFileSync(healthzPath, 'utf8');
    const readyzContent = fs.readFileSync(readyzPath, 'utf8');
    
    if (!healthzContent.includes("export const dynamic = 'force-dynamic'") || 
        !readyzContent.includes("export const dynamic = 'force-dynamic'")) {
      console.error('❌ Health endpoints must export dynamic = "force-dynamic"');
      return false;
    }
    
    console.log('✅ Health endpoints properly configured');
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
