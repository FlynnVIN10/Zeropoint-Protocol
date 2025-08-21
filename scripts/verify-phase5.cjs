#!/usr/bin/env node

/**
 * Sonic MAX Cursor Playbook - Phase 5 Verification Gate
 * Validates endpoints against JSON schemas using ajv
 * Tag: [SONIC-MAX][PHASE5]
 */

const { fetchJSON } = require('./_lib/http.cjs');
const { writeJSON } = require('./_lib/fsx.cjs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const BASE_URL = process.env.BASE_URL || 'https://zeropointprotocol.ai';

// Initialize AJV with formats
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

// Load schemas
const schemas = {
  'status-version': require('./_schemas/status-version.schema.json'),
  'healthz': require('./_schemas/healthz.schema.json'),
  'readyz': require('./_schemas/readyz.schema.json'),
  'training-status': require('./_schemas/training-status.schema.json'),
  'consensus-proposals': require('./_schemas/consensus-proposals.schema.json')
};

const ENDPOINTS = [
  { path: '/api/healthz', name: 'Health Check', schema: 'healthz' },
  { path: '/api/readyz', name: 'Readiness Check', schema: 'readyz' },
  { path: '/status/version.json', name: 'Version Status', schema: 'status-version' },
  { path: '/api/training/status', name: 'Training Status', schema: 'training-status' },
  { path: '/consensus/proposals.json', name: 'Consensus Proposals', schema: 'consensus-proposals' }
];

async function runVerificationGate() {
  console.log('🚀 Sonic MAX Cursor Playbook - Phase 5 Verification Gate');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log('─'.repeat(60));
  
  const results = [];
  const startTime = Date.now();
  let totalPassed = 0;
  let totalFailed = 0;
  
  for (const endpoint of ENDPOINTS) {
    process.stdout.write(`Verifying ${endpoint.name}... `);
    
    try {
      const response = await fetchJSON(`${BASE_URL}${endpoint.path}`);
      const schema = schemas[endpoint.schema];
      
      if (!schema) {
        throw new Error(`Schema not found for ${endpoint.schema}`);
      }
      
      // Validate against schema
      const validate = ajv.compile(schema);
      const isValid = validate(response.data);
      
      if (isValid) {
        totalPassed++;
        console.log(`✅ PASS`);
        
        results.push({
          endpoint: endpoint.name,
          path: endpoint.path,
          status: 'PASS',
          schema: endpoint.schema,
          timestamp: new Date().toISOString()
        });
      } else {
        totalFailed++;
        console.log(`❌ FAIL`);
        
        results.push({
          endpoint: endpoint.name,
          path: endpoint.path,
          status: 'FAIL',
          schema: endpoint.schema,
          errors: validate.errors,
          timestamp: new Date().toISOString()
        });
      }
      
    } catch (error) {
      totalFailed++;
      console.log(`❌ ERROR: ${error.message}`);
      
      results.push({
        endpoint: endpoint.name,
        path: endpoint.path,
        status: 'ERROR',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  const summary = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    totalEndpoints: ENDPOINTS.length,
    passed: totalPassed,
    failed: totalFailed,
    duration: Date.now() - startTime,
    results: results,
    overallStatus: totalFailed === 0 ? 'VERIFY PASS' : 'VERIFY FAIL'
  };
  
  // Save results to evidence directory
  const evidenceDir = 'evidence/phase5/verify';
  const filename = `verify-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const filepath = path.join(evidenceDir, filename);
  
  await writeJSON(filepath, summary);
  console.log(`\n📊 Verification results saved to: ${filepath}`);
  
  // Display summary
  console.log('\n' + '='.repeat(60));
  console.log('🎯 VERIFICATION GATE SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Endpoints: ${summary.totalEndpoints}`);
  console.log(`Passed: ${summary.passed}`);
  console.log(`Failed: ${summary.failed}`);
  console.log(`Duration: ${summary.duration}ms`);
  console.log(`Overall Status: ${summary.overallStatus}`);
  console.log('='.repeat(60));
  
  // Exit with appropriate code
  if (totalFailed === 0) {
    console.log('🎉 VERIFY PASS - All endpoints validated successfully');
    process.exit(0);
  } else {
    console.log('❌ VERIFY FAIL - Some endpoints failed validation');
    process.exit(2);
  }
}

// Run if called directly
if (require.main === module) {
  runVerificationGate().catch(error => {
    console.error('💥 Verification gate execution failed:', error.message);
    process.exit(1);
  });
}

module.exports = { runVerificationGate };
