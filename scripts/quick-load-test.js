#!/usr/bin/env node

// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import axios from 'axios';
import { performance } from 'perf_hooks';

class QuickLoadTester {
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
        timeout: 5000
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

  async runQuickTest() {
    console.log('🚀 Quick Load Test for Phase 10');
    console.log('='.repeat(50));
    
    const endpoints = [
      { path: '/advanced/status', method: 'GET' },
      { path: '/advanced/summarize', method: 'POST', data: { text: 'Quick test text' } },
      { path: '/advanced/sentiment', method: 'POST', data: { text: 'Great test message!' } },
      { path: '/consensus/status', method: 'GET' },
      { path: '/soulchain/telemetry', method: 'POST', data: {
        consensus: { entropy: 0.5, participants: 10, activeVoices: 7 },
        agents: [{ id: 'test_agent', intent: 'test', state: 'active', stake: 100 }],
        timestamp: new Date().toISOString()
      }}
    ];

    for (const endpoint of endpoints) {
      console.log(`\nTesting ${endpoint.method} ${endpoint.path}...`);
      const result = await this.testEndpoint(endpoint.path, endpoint.method, endpoint.data);
      
      if (result.success) {
        console.log(`✅ Success: ${result.status} (${result.responseTime.toFixed(2)}ms)`);
      } else {
        console.log(`❌ Failed: ${result.error} (${result.responseTime.toFixed(2)}ms)`);
      }
    }
    
    this.printResults();
  }

  printResults() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 QUICK LOAD TEST RESULTS');
    console.log('='.repeat(50));
    
    const successRate = (this.results.successful / this.results.total) * 100;
    const avgResponseTime = this.results.responseTimes.reduce((a, b) => a + b, 0) / this.results.responseTimes.length;
    
    console.log(`Total Requests: ${this.results.total}`);
    console.log(`Successful: ${this.results.successful}`);
    console.log(`Failed: ${this.results.failed}`);
    console.log(`Success Rate: ${successRate.toFixed(2)}%`);
    console.log(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    
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
  const tester = new QuickLoadTester();
  
  try {
    const authSuccess = await tester.authenticate();
    if (!authSuccess) {
      console.error('❌ Cannot proceed without authentication');
      process.exit(1);
    }
    
    await tester.runQuickTest();
    
  } catch (error) {
    console.error('❌ Quick load test failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
} 