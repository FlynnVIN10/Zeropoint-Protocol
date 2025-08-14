#!/usr/bin/env node

// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import axios from 'axios';
import { performance } from 'perf_hooks';

class Phase10OptimizedLoadTester {
  constructor(baseUrl = 'http://localhost:3000/v1') {
    this.baseUrl = baseUrl;
    this.token = null;
    this.results = [];
    this.config = {
      concurrency: 5, // Reduced from 10 to prevent overwhelming
      duration: 10000, // 10 seconds
      batchSize: 10,
      delayBetweenBatches: 100, // 100ms delay between batches
    };
  }

  async authenticate() {
    try {
      const response = await axios.post(`${this.baseUrl}/auth/login`, {
        username: 'loadtest',
        password: 'loadtest123'
      });

      if (response.data.success) {
        this.token = response.data.access_token;
        console.log('✅ Authentication successful');
        return true;
      } else {
        console.log('❌ Authentication failed:', response.data.message);
        return false;
      }
    } catch (error) {
      console.log('❌ Authentication failed:', error.message);
      return false;
    }
  }

  async testEndpoint(endpoint, method = 'GET', data = null) {
    const startTime = performance.now();
    const headers = this.token ? { Authorization: `Bearer ${this.token}` } : {};

    try {
      const config = {
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers,
        timeout: 5000, // 5 second timeout
      };

      if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
        config.data = data;
      }

      const response = await axios(config);
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      return {
        success: true,
        statusCode: response.status,
        responseTime,
        data: response.data
      };
    } catch (error) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      return {
        success: false,
        statusCode: error.response?.status || 0,
        responseTime,
        error: error.message
      };
    }
  }

  async runBatch(endpoint, method, data, batchSize) {
    const promises = [];
    for (let i = 0; i < batchSize; i++) {
      promises.push(this.testEndpoint(endpoint, method, data));
    }
    return Promise.all(promises);
  }

  async runOptimizedTest(endpoint, method, data) {
    console.log(`🚀 Testing ${method} ${endpoint} with optimized concurrency...`);
    
    const startTime = performance.now();
    const endTime = startTime + this.config.duration;
    const batches = [];

    // Create batches of requests
    while (performance.now() < endTime) {
      const batch = this.runBatch(endpoint, method, data, this.config.batchSize);
      batches.push(batch);
      
      // Add delay between batches to prevent overwhelming
      if (performance.now() + this.config.delayBetweenBatches < endTime) {
        await new Promise(resolve => setTimeout(resolve, this.config.delayBetweenBatches));
      }
    }

    // Wait for all batches to complete
    const batchResults = await Promise.all(batches);
    
    // Flatten results
    const results = batchResults.flat();
    this.results.push(...results);

    const totalTime = performance.now() - startTime;
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;

    console.log(`📊 ${method} ${endpoint} Results:`);
    console.log(`   Total Requests: ${results.length}`);
    console.log(`   Successful: ${successful.length}`);
    console.log(`   Failed: ${failed.length}`);
    console.log(`   Success Rate: ${((successful.length / results.length) * 100).toFixed(2)}%`);
    console.log(`   Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`   Total Time: ${totalTime.toFixed(2)}ms`);
    console.log('');

    return {
      endpoint,
      method,
      totalRequests: results.length,
      successful: successful.length,
      failed: failed.length,
      successRate: (successful.length / results.length) * 100,
      averageResponseTime: avgResponseTime,
      totalTime
    };
  }

  async runPhase10OptimizedTests() {
    console.log('🚀 Phase 10 Optimized Load Testing for Zeropoint Protocol');
    console.log('============================================================');
    console.log(`Configuration: ${this.config.concurrency} concurrent, ${this.config.duration}ms duration`);
    console.log(`Batch size: ${this.config.batchSize}, Delay: ${this.config.delayBetweenBatches}ms`);
    console.log('');

    if (!await this.authenticate()) {
      console.log('❌ Cannot proceed without authentication');
      return;
    }

    const testEndpoints = [
      { endpoint: '/advanced/status', method: 'GET' },
      { endpoint: '/advanced/summarize', method: 'POST', data: { text: 'This is a test text for summarization with optimized load testing.' } },
      { endpoint: '/advanced/sentiment', method: 'POST', data: { text: 'Great test message for sentiment analysis!' } },
      { endpoint: '/consensus/status', method: 'GET' },
      { endpoint: '/soulchain/telemetry', method: 'POST', data: {
        consensus: { entropy: 0.5, participants: 10, activeVoices: 7 },
        agents: [{ id: 'test_agent', intent: 'test', state: 'active', stake: 100 }],
        timestamp: new Date().toISOString()
      }},
    ];

    const testResults = [];

    for (const test of testEndpoints) {
      const result = await this.runOptimizedTest(test.endpoint, test.method, test.data);
      testResults.push(result);
    }

    this.printOptimizedResults(testResults);
  }

  printOptimizedResults(testResults) {
    console.log('============================================================');
    console.log('📊 PHASE 10 OPTIMIZED LOAD TEST RESULTS');
    console.log('============================================================');

    const totalRequests = testResults.reduce((sum, r) => sum + r.totalRequests, 0);
    const totalSuccessful = testResults.reduce((sum, r) => sum + r.successful, 0);
    const totalFailed = testResults.reduce((sum, r) => sum + r.failed, 0);
    const overallSuccessRate = (totalSuccessful / totalRequests) * 100;
    const avgResponseTime = testResults.reduce((sum, r) => sum + r.averageResponseTime, 0) / testResults.length;

    console.log(`Total Requests: ${totalRequests}`);
    console.log(`Successful: ${totalSuccessful}`);
    console.log(`Failed: ${totalFailed}`);
    console.log(`Success Rate: ${overallSuccessRate.toFixed(2)}%`);
    console.log(`Uptime: ${overallSuccessRate.toFixed(2)}%`);
    console.log(`📈 Response Time Metrics (ms):`);
    console.log(`  Average: ${avgResponseTime.toFixed(2)}`);
    console.log(`  Min: ${Math.min(...testResults.map(r => r.averageResponseTime)).toFixed(2)}`);
    console.log(`  Max: ${Math.max(...testResults.map(r => r.averageResponseTime)).toFixed(2)}`);

    console.log('');
    console.log('🎯 Phase 10 Targets:');
    console.log(`  <100ms Response Time: ${avgResponseTime < 100 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  99.9% Uptime: ${overallSuccessRate >= 99.9 ? '✅ PASS' : '❌ FAIL'}`);

    console.log('');
    console.log('📋 Optimization Recommendations:');
    if (avgResponseTime >= 100) {
      console.log('  🔧 Consider implementing connection pooling');
      console.log('  🔧 Add Redis caching for frequently accessed data');
      console.log('  🔧 Implement request queuing for high concurrency');
    }
    if (overallSuccessRate < 99.9) {
      console.log('  🔧 Review error handling and retry logic');
      console.log('  🔧 Implement circuit breaker pattern');
      console.log('  🔧 Add health checks and graceful degradation');
    }

    console.log('');
    console.log('✅ Phase 10 Optimized Load Testing Complete');
  }
}

async function main() {
  const tester = new Phase10OptimizedLoadTester();
  await tester.runPhase10OptimizedTests();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
} 