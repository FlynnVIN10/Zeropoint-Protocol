#!/usr/bin/env node

// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import axios from 'axios';
import { performance } from 'perf_hooks';

class Phase10LoadTester {
  constructor(baseUrl = 'http://localhost:3000/v1') {
    this.baseUrl = baseUrl;
    this.authToken = null;
    this.results = {
      total: 0,
      successful: 0,
      failed: 0,
      responseTimes: []
    };
  }

  async authenticate() {
    try {
      const response = await axios.post(`${this.baseUrl}/auth/login`, {
        username: 'loadtest',
        password: 'loadtest123'
      });
      
      if (response.data.success) {
        this.authToken = response.data.access_token;
        console.log('✅ Authentication successful');
        return true;
      }
    } catch (error) {
      console.error('❌ Authentication failed:', error.message);
      return false;
    }
  }

  async testEndpoint(endpoint, method = 'GET', data = null) {
    const startTime = performance.now();
    this.results.total++;
    
    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }
      
      const config = {
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers,
        timeout: 2000 // Reduced timeout for faster failure detection
      };
      
      // Only add data for POST/PUT/PATCH requests
      if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        config.data = data;
      }
      
      const response = await axios(config);
      
      const responseTime = performance.now() - startTime;
      this.results.responseTimes.push(responseTime);
      this.results.successful++;
      
      return {
        success: true,
        responseTime,
        status: response.status
      };
    } catch (error) {
      const responseTime = performance.now() - startTime;
      this.results.responseTimes.push(responseTime);
      this.results.failed++;
      
      return {
        success: false,
        responseTime,
        error: error.message,
        status: error.response?.status
      };
    }
  }

  async runConcurrentTests(endpoint, method, data, concurrency = 3, duration = 5000) {
    console.log(`🚀 Testing ${endpoint} with ${concurrency} concurrent requests for ${duration}ms`);
    
    const startTime = Date.now();
    const promises = [];
    
    while (Date.now() - startTime < duration) {
      for (let i = 0; i < concurrency; i++) {
        promises.push(this.testEndpoint(endpoint, method, data));
      }
      await new Promise(resolve => setTimeout(resolve, 50)); // Reduced delay
    }
    
    await Promise.all(promises);
  }

  async runPhase10Tests() {
    console.log('🚀 Phase 10 Load Testing for Zeropoint Protocol');
    console.log('='.repeat(60));
    
    // Test advanced endpoints with moderate load
    console.log('\n📊 Testing /v1/advanced/* endpoints');
    const advancedEndpoints = [
      { path: '/advanced/status', method: 'GET' },
      { path: '/advanced/summarize', method: 'POST', data: { text: 'Quick test for load testing.' } },
      { path: '/advanced/sentiment', method: 'POST', data: { text: 'Great test message!' } }
    ];

    for (const endpoint of advancedEndpoints) {
      await this.runConcurrentTests(endpoint.path, endpoint.method, endpoint.data, 3, 3000);
    }
    
    // Test consensus endpoints
    console.log('\n🔄 Testing /v1/consensus/* endpoints');
    const consensusEndpoints = [
      { path: '/consensus/status', method: 'GET' },
      { path: '/soulchain/telemetry', method: 'POST', data: {
        consensus: { entropy: 0.5, participants: 10, activeVoices: 7 },
        agents: [{ id: 'test_agent', intent: 'test', state: 'active', stake: 100 }],
        timestamp: new Date().toISOString()
      }}
    ];

    for (const endpoint of consensusEndpoints) {
      await this.runConcurrentTests(endpoint.path, endpoint.method, endpoint.data, 3, 3000);
    }
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 PHASE 10 LOAD TEST RESULTS');
    console.log('='.repeat(60));
    
    const successRate = (this.results.successful / this.results.total) * 100;
    const avgResponseTime = this.results.responseTimes.reduce((a, b) => a + b, 0) / this.results.responseTimes.length;
    const sortedTimes = [...this.results.responseTimes].sort((a, b) => a - b);
    const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
    const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];
    
    console.log(`Total Requests: ${this.results.total}`);
    console.log(`Successful: ${this.results.successful}`);
    console.log(`Failed: ${this.results.failed}`);
    console.log(`Success Rate: ${successRate.toFixed(2)}%`);
    console.log(`Uptime: ${successRate.toFixed(2)}%`);
    
    console.log('\n📈 Response Time Metrics (ms):');
    console.log(`  Average: ${avgResponseTime.toFixed(2)}`);
    console.log(`  95th Percentile: ${p95.toFixed(2)}`);
    console.log(`  99th Percentile: ${p99.toFixed(2)}`);
    console.log(`  Min: ${Math.min(...this.results.responseTimes).toFixed(2)}`);
    console.log(`  Max: ${Math.max(...this.results.responseTimes).toFixed(2)}`);
    
    const targets = {
      responseTime: avgResponseTime < 100,
      uptime: successRate >= 99.9
    };
    
    console.log('\n🎯 Phase 10 Targets:');
    console.log(`  <100ms Response Time: ${targets.responseTime ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  99.9% Uptime: ${targets.uptime ? '✅ PASS' : '❌ FAIL'}`);
    
    return targets;
  }
}

async function main() {
  const tester = new Phase10LoadTester();
  
  try {
    const authSuccess = await tester.authenticate();
    if (!authSuccess) {
      console.error('❌ Cannot proceed without authentication');
      process.exit(1);
    }
    
    await tester.runPhase10Tests();
    const targets = tester.printResults();
    
    // Exit with appropriate code
    const allPassed = targets.responseTime && targets.uptime;
    process.exit(allPassed ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Phase 10 load testing failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
} 