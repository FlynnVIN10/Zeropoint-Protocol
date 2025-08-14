#!/usr/bin/env node

// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import axios from 'axios';
import { performance } from 'perf_hooks';

class LoadTester {
  constructor(baseUrl = 'http://localhost:3000/v1') {
    this.baseUrl = baseUrl;
    this.results = {
      total: 0,
      successful: 0,
      failed: 0,
      responseTimes: [],
      errors: []
    };
    this.authToken = null;
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

  async testEndpoint(endpoint, method = 'GET', data = null, headers = {}) {
    const startTime = performance.now();
    try {
      const requestHeaders = {
        'Content-Type': 'application/json',
        ...headers
      };
      
      // Add auth token if available
      if (this.authToken) {
        requestHeaders['Authorization'] = `Bearer ${this.authToken}`;
      }
      
      const config = {
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: requestHeaders,
        timeout: 5000
      };
      
      // Only add data for POST/PUT/PATCH requests
      if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        config.data = data;
      }
      
      const response = await axios(config);
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      this.results.total++;
      this.results.successful++;
      this.results.responseTimes.push(responseTime);
      
      return {
        success: true,
        status: response.status,
        responseTime,
        data: response.data
      };
    } catch (error) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      this.results.total++;
      this.results.failed++;
      this.results.responseTimes.push(responseTime);
      this.results.errors.push({
        endpoint,
        error: error.message,
        responseTime
      });
      
      return {
        success: false,
        error: error.message,
        responseTime
      };
    }
  }

  async runConcurrentTests(endpoint, method, data, concurrency = 10, duration = 30000) {
    console.log(`\n🚀 Load testing ${endpoint} with ${concurrency} concurrent requests for ${duration}ms`);
    
    const startTime = Date.now();
    const promises = [];
    
    while (Date.now() - startTime < duration) {
      for (let i = 0; i < concurrency; i++) {
        promises.push(this.testEndpoint(endpoint, method, data));
      }
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between batches
    }
    
    await Promise.all(promises);
  }

  async runAdvancedEndpoints() {
    console.log('\n📊 Testing /v1/advanced/* endpoints');
    
    const advancedEndpoints = [
      { path: '/advanced/status', method: 'GET' },
      { path: '/advanced/summarize', method: 'POST', data: { text: 'This is a test text for summarization. It contains multiple sentences to test the summarization endpoint under load conditions.' } },
      { path: '/advanced/context-prompt', method: 'POST', data: { prompt: 'Test prompt', context: 'Test context' } },
      { path: '/advanced/semantic-search', method: 'POST', data: { query: 'test query', documents: ['doc1', 'doc2'] } },
      { path: '/advanced/sentiment', method: 'POST', data: { text: 'This is a positive test message for sentiment analysis.' } },
      { path: '/advanced/entities', method: 'POST', data: { text: 'John Doe works at Zeropoint Protocol in Austin, Texas.' } },
      { path: '/advanced/translate', method: 'POST', data: { text: 'Hello world', targetLanguage: 'es' } }
    ];

    for (const endpoint of advancedEndpoints) {
      await this.runConcurrentTests(endpoint.path, endpoint.method, endpoint.data, 5, 10000);
    }
  }

  async runScalingEndpoints() {
    console.log('\n📈 Testing /v1/scaling/* endpoints');
    
    const scalingEndpoints = [
      { path: '/scaling/predict', method: 'POST', data: { timeWindow: 3600, trafficPattern: { peak: 1000, offpeak: 100 } } },
      { path: '/scaling/expand', method: 'POST', data: { nodes: 5, reason: 'Load testing expansion' } },
      { path: '/scaling/status', method: 'GET' }
    ];

    for (const endpoint of scalingEndpoints) {
      await this.runConcurrentTests(endpoint.path, endpoint.method, endpoint.data, 3, 8000);
    }
  }

  async runConsensusEndpoints() {
    console.log('\n🔄 Testing /v1/consensus/* endpoints');
    
    const consensusEndpoints = [
      { path: '/consensus/sync', method: 'POST', data: { 
        proposalId: 'load-test-1', 
        consensusData: {
          votes: [{ voter: 'user1', choice: 'yes', weight: 100, timestamp: new Date(), signature: 'sig1' }],
          quorum: 1,
          threshold: 0.5,
          timestamp: new Date()
        }
      }},
      { path: '/consensus/intent', method: 'POST', data: { intent: 'Load test intent', stakeAmount: 150 } },
      { path: '/consensus/pass', method: 'POST', data: { 
        proposalId: 'load-test-1', 
        votes: [{ voter: 'user1', choice: 'yes', weight: 100, timestamp: new Date(), signature: 'sig1' }]
      }},
      { path: '/consensus/status', method: 'GET' },
      { path: '/soulchain/telemetry', method: 'POST', data: {
        consensus: { entropy: 0.45, participants: 15, activeVoices: 11, passiveStances: 4, consensusRatio: 0.73 },
        agents: [{ id: 'agent_001', intent: 'support', state: 'active', stake: 500 }],
        timestamp: new Date().toISOString()
      }}
    ];

    for (const endpoint of consensusEndpoints) {
      await this.runConcurrentTests(endpoint.path, endpoint.method, endpoint.data, 4, 12000);
    }
  }

  calculateMetrics() {
    const responseTimes = this.results.responseTimes;
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const sortedTimes = [...responseTimes].sort((a, b) => a - b);
    const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
    const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];
    
    const successRate = (this.results.successful / this.results.total) * 100;
    const uptime = successRate; // Simplified uptime calculation
    
    return {
      total: this.results.total,
      successful: this.results.successful,
      failed: this.results.failed,
      successRate: successRate.toFixed(2),
      uptime: uptime.toFixed(2),
      avgResponseTime: avgResponseTime.toFixed(2),
      p95ResponseTime: p95.toFixed(2),
      p99ResponseTime: p99.toFixed(2),
      minResponseTime: Math.min(...responseTimes).toFixed(2),
      maxResponseTime: Math.max(...responseTimes).toFixed(2)
    };
  }

  printResults() {
    const metrics = this.calculateMetrics();
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 LOAD TEST RESULTS');
    console.log('='.repeat(80));
    console.log(`Total Requests: ${metrics.total}`);
    console.log(`Successful: ${metrics.successful}`);
    console.log(`Failed: ${metrics.failed}`);
    console.log(`Success Rate: ${metrics.successRate}%`);
    console.log(`Uptime: ${metrics.uptime}%`);
    console.log('\n📈 Response Time Metrics (ms):');
    console.log(`  Average: ${metrics.avgResponseTime}`);
    console.log(`  95th Percentile: ${metrics.p95ResponseTime}`);
    console.log(`  99th Percentile: ${metrics.p99ResponseTime}`);
    console.log(`  Min: ${metrics.minResponseTime}`);
    console.log(`  Max: ${metrics.maxResponseTime}`);
    
    if (this.results.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.results.errors.slice(0, 10).forEach(error => {
        console.log(`  ${error.endpoint}: ${error.error}`);
      });
      if (this.results.errors.length > 10) {
        console.log(`  ... and ${this.results.errors.length - 10} more errors`);
      }
    }
    
    // Phase 10 targets
    const targets = {
      responseTime: parseFloat(metrics.avgResponseTime) < 100,
      uptime: parseFloat(metrics.uptime) >= 99.9
    };
    
    console.log('\n🎯 Phase 10 Targets:');
    console.log(`  <100ms Response Time: ${targets.responseTime ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  99.9% Uptime: ${targets.uptime ? '✅ PASS' : '❌ FAIL'}`);
    
    return targets;
  }
}

async function main() {
  console.log('🚀 Starting Phase 10 Load Testing for Zeropoint Protocol');
  console.log('='.repeat(80));
  
  const loadTester = new LoadTester();
  
  try {
    // Authenticate first
    const authSuccess = await loadTester.authenticate();
    if (!authSuccess) {
      console.error('❌ Cannot proceed without authentication');
      process.exit(1);
    }
    
    // Test all endpoint categories
    await loadTester.runAdvancedEndpoints();
    await loadTester.runScalingEndpoints();
    await loadTester.runConsensusEndpoints();
    
    // Print comprehensive results
    const targets = loadTester.printResults();
    
    // Exit with appropriate code
    const allPassed = targets.responseTime && targets.uptime;
    process.exit(allPassed ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Load testing failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default LoadTester; 