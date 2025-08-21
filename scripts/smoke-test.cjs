#!/usr/bin/env node

/**
 * Sonic MAX Cursor Playbook - Phase 5 Smoke Test
 * Tests endpoints: /api/healthz, /api/readyz, /status/version.json, /api/training/status, /consensus/proposals
 * Tag: [SONIC-MAX][PHASE5]
 */

const { fetchJSON } = require('./_lib/http.cjs');
const { writeJSON } = require('./_lib/fsx.cjs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'https://zeropointprotocol.ai';

const ENDPOINTS = [
  { path: '/api/healthz', name: 'Health Check' },
  { path: '/api/readyz', name: 'Readiness Check' },
  { path: '/status/version.json', name: 'Version Status' },
  { path: '/api/training/status', name: 'Training Status' },
  { path: '/consensus/proposals.json', name: 'Consensus Proposals' }
];

async function runSmokeTest() {
  console.log('🚀 Sonic MAX Cursor Playbook - Phase 5 Smoke Test');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log('─'.repeat(60));
  
  const results = [];
  const startTime = Date.now();
  
  for (const endpoint of ENDPOINTS) {
    process.stdout.write(`Testing ${endpoint.name}... `);
    
    try {
      const response = await fetchJSON(`${BASE_URL}${endpoint.path}`);
      const duration = Date.now() - startTime;
      
      const result = {
        endpoint: endpoint.name,
        path: endpoint.path,
        url: `${BASE_URL}${endpoint.path}`,
        status: 'success',
        statusCode: response.statusCode,
        duration: duration,
        timestamp: new Date().toISOString(),
        data: response.data
      };
      
      results.push(result);
      console.log(`✅ ${response.statusCode}`);
      
    } catch (error) {
      const result = {
        endpoint: endpoint.name,
        path: endpoint.path,
        url: `${BASE_URL}${endpoint.path}`,
        status: 'error',
        error: error.message,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
      
      results.push(result);
      console.log(`❌ ${error.message}`);
    }
  }
  
  const summary = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    totalEndpoints: ENDPOINTS.length,
    successful: results.filter(r => r.status === 'success').length,
    failed: results.filter(r => r.status === 'error').length,
    duration: Date.now() - startTime,
    results: results
  };
  
  // Save results to evidence directory
  const evidenceDir = 'evidence/phase5/smoke';
  const filename = `smoke-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const filepath = path.join(evidenceDir, filename);
  
  await writeJSON(filepath, summary);
  console.log(`\n📊 Smoke test results saved to: ${filepath}`);
  
  // Display summary
  console.log('\n' + '='.repeat(60));
  console.log('🎯 SMOKE TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Endpoints: ${summary.totalEndpoints}`);
  console.log(`Successful: ${summary.successful}`);
  console.log(`Failed: ${summary.failed}`);
  console.log(`Duration: ${summary.duration}ms`);
  console.log('='.repeat(60));
  
  // Exit with appropriate code
  const hasFailures = summary.failed > 0;
  process.exit(hasFailures ? 1 : 0);
}

// Run if called directly
if (require.main === module) {
  runSmokeTest().catch(error => {
    console.error('💥 Smoke test execution failed:', error.message);
    process.exit(1);
  });
}

module.exports = { runSmokeTest };
