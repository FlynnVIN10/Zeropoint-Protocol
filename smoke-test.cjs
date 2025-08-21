#!/usr/bin/env node

/**
 * Zeropoint Protocol Platform Smoke Test
 * Comprehensive validation of all platform endpoints and functionality
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  localPort: 3001,
  localBaseUrl: 'http://localhost:3001',
  publicBaseUrl: 'https://zeropointprotocol.ai',
  timeout: 10000,
  endpoints: [
    { path: '/', name: 'Homepage', expectedStatus: 200 },
    { path: '/robots.txt', name: 'Robots.txt', expectedStatus: 200 },
    { path: '/sitemap.xml', name: 'Sitemap', expectedStatus: 200 },
    { path: '/api/healthz', name: 'Health Check', expectedStatus: 200 },
    { path: '/api/readyz', name: 'Readiness Check', expectedStatus: 200 },
    { path: '/consensus/proposals', name: 'Consensus Proposals', expectedStatus: [200, 308] },
    { path: '/status/version', name: 'Version Status', expectedStatus: 200 }
  ]
};

// Test results storage
const testResults = {
  timestamp: new Date().toISOString(),
  local: { passed: 0, failed: 0, results: [] },
  public: { passed: 0, failed: 0, results: [] },
  summary: {}
};

// Utility function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      timeout: CONFIG.timeout,
      ...options
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          url: url
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Test individual endpoint
async function testEndpoint(baseUrl, endpoint) {
  const url = `${baseUrl}${endpoint.path}`;
  const startTime = Date.now();
  
  try {
    const response = await makeRequest(url);
    const duration = Date.now() - startTime;
    
    const result = {
      endpoint: endpoint.name,
      path: endpoint.path,
      url: url,
      statusCode: response.statusCode,
      expectedStatus: endpoint.expectedStatus,
      duration: duration,
      success: Array.isArray(endpoint.expectedStatus) ? endpoint.expectedStatus.includes(response.statusCode) : response.statusCode === endpoint.expectedStatus,
      headers: response.headers,
      data: response.data
    };

    // Validate response data for API endpoints
    if (endpoint.path.startsWith('/api/')) {
      try {
        const jsonData = JSON.parse(response.data);
        result.validJson = true;
        result.dataStructure = Object.keys(jsonData);
        
        // Specific validations for healthz and readyz
        if (endpoint.path === '/api/healthz') {
          result.healthCheckValid = jsonData.status === 'ok' && jsonData.commit && jsonData.buildTime;
        } else if (endpoint.path === '/api/readyz') {
          result.readyCheckValid = jsonData.ready === true;
        }
      } catch (e) {
        result.validJson = false;
        result.jsonError = e.message;
      }
    }

    return result;
  } catch (error) {
    return {
      endpoint: endpoint.name,
      path: endpoint.path,
      url: url,
      error: error.message,
      success: false,
      duration: Date.now() - startTime
    };
  }
}

// Run all tests for a specific environment
async function runTests(environment, baseUrl) {
  console.log(`\n🧪 Running ${environment} smoke tests...`);
  console.log(`📍 Base URL: ${baseUrl}`);
  console.log('─'.repeat(60));
  
  const results = [];
  
  for (const endpoint of CONFIG.endpoints) {
    process.stdout.write(`Testing ${endpoint.name}... `);
    const result = await testEndpoint(baseUrl, endpoint);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ ${result.statusCode}`);
      testResults[environment].passed++;
    } else {
      console.log(`❌ ${result.error || result.statusCode}`);
      testResults[environment].failed++;
    }
  }
  
  testResults[environment].results = results;
  return results;
}

// Generate detailed report
function generateReport() {
  const report = {
    timestamp: testResults.timestamp,
    summary: {
      local: {
        total: testResults.local.passed + testResults.local.failed,
        passed: testResults.local.passed,
        failed: testResults.local.failed,
        successRate: `${((testResults.local.passed / (testResults.local.passed + testResults.local.failed)) * 100).toFixed(1)}%`
      },
      public: {
        total: testResults.public.passed + testResults.public.failed,
        passed: testResults.public.passed,
        failed: testResults.public.failed,
        successRate: `${((testResults.public.passed / (testResults.public.passed + testResults.public.failed)) * 100).toFixed(1)}%`
      }
    },
    details: {
      local: testResults.local.results,
      public: testResults.public.results
    }
  };

  return report;
}

// Save report to file
function saveReport(report) {
  const reportDir = 'evidence/smoke';
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const filename = `smoke-test-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const filepath = path.join(reportDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
  console.log(`\n📊 Report saved to: ${filepath}`);
  
  return filepath;
}

// Display summary
function displaySummary(report) {
  console.log('\n' + '='.repeat(80));
  console.log('🚀 ZEROPOINT PROTOCOL PLATFORM SMOKE TEST RESULTS');
  console.log('='.repeat(80));
  
  console.log(`\n📅 Test executed: ${new Date(report.timestamp).toLocaleString()}`);
  
  console.log('\n🏠 LOCAL ENVIRONMENT:');
  console.log(`   Total: ${report.summary.local.total} | Passed: ${report.summary.local.passed} | Failed: ${report.summary.local.failed}`);
  console.log(`   Success Rate: ${report.summary.local.successRate}`);
  
  console.log('\n🌐 PUBLIC WEBSITE:');
  console.log(`   Total: ${report.summary.public.total} | Passed: ${report.summary.public.passed} | Failed: ${report.summary.public.failed}`);
  console.log(`   Success Rate: ${report.summary.public.successRate}`);
  
  // Show failed tests
  const allFailed = [...report.details.local.filter(r => !r.success), ...report.details.public.filter(r => !r.success)];
  if (allFailed.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    allFailed.forEach(fail => {
      console.log(`   ${fail.endpoint} (${fail.path}): ${fail.error || `Status ${fail.statusCode}`}`);
    });
  }
  
  // Overall status
  const totalTests = report.summary.local.total + report.summary.public.total;
  const totalPassed = report.summary.local.passed + report.summary.public.passed;
  const overallSuccess = totalPassed === totalTests;
  
  console.log('\n' + '─'.repeat(80));
  console.log(`🎯 OVERALL STATUS: ${overallSuccess ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  console.log(`📊 Total Tests: ${totalTests} | Passed: ${totalPassed} | Failed: ${totalTests - totalPassed}`);
  console.log('─'.repeat(80));
}

// Main execution
async function main() {
  console.log('🚀 Starting Zeropoint Protocol Platform Smoke Test...');
  console.log(`⏰ ${new Date().toLocaleString()}`);
  
  try {
    // Test local environment
    await runTests('local', CONFIG.localBaseUrl);
    
    // Test public website
    await runTests('public', CONFIG.publicBaseUrl);
    
    // Generate and save report
    const report = generateReport();
    const reportPath = saveReport(report);
    
    // Display summary
    displaySummary(report);
    
    // Exit with appropriate code
    const hasFailures = testResults.local.failed > 0 || testResults.public.failed > 0;
    process.exit(hasFailures ? 1 : 0);
    
  } catch (error) {
    console.error('\n💥 Smoke test execution failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { runTests, generateReport };
