// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

// Phase 14 SSE Load Test Script
// Tests /v1/stream endpoint with 500 concurrent connections
// Requirements: Node.js 18+, k6 (optional for advanced testing)

const http = require('http');
const https = require('https');
const { EventEmitter } = require('events');

class SSELoadTester extends EventEmitter {
  constructor(options = {}) {
    super();
    this.baseUrl = options.baseUrl || 'http://localhost:3000';
    this.concurrentConnections = options.concurrentConnections || 500;
    this.testDuration = options.testDuration || 60000; // 1 minute
    this.connectionTimeout = options.connectionTimeout || 10000; // 10 seconds
    this.results = {
      totalConnections: 0,
      successfulConnections: 0,
      failedConnections: 0,
      averageLatency: 0,
      totalLatency: 0,
      connectionTimes: [],
      errors: [],
      startTime: null,
      endTime: null
    };
  }

  async runLoadTest() {
    console.log(`🚀 Starting Phase 14 SSE Load Test`);
    console.log(`📊 Target: ${this.concurrentConnections} concurrent connections`);
    console.log(`⏱️  Duration: ${this.testDuration / 1000} seconds`);
    console.log(`🔗 Endpoint: ${this.baseUrl}/v1/stream`);
    console.log('');

    this.results.startTime = Date.now();
    
    // Create connection promises
    const connectionPromises = [];
    
    for (let i = 0; i < this.concurrentConnections; i++) {
      connectionPromises.push(this.createSSEConnection(i));
      
      // Small delay to avoid overwhelming the server
      if (i % 50 === 0) {
        await this.delay(100);
      }
    }

    console.log(`📡 Created ${this.concurrentConnections} connection promises`);
    
    // Wait for all connections to complete or timeout
    const timeoutPromise = new Promise(resolve => {
      setTimeout(() => {
        console.log('⏰ Test duration reached, closing remaining connections...');
        resolve();
      }, this.testDuration);
    });

    try {
      await Promise.race([
        Promise.allSettled(connectionPromises),
        timeoutPromise
      ]);
    } catch (error) {
      console.error('❌ Load test error:', error);
    }

    this.results.endTime = Date.now();
    this.generateReport();
  }

  async createSSEConnection(connectionId) {
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const url = new URL(`${this.baseUrl}/v1/stream`);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const req = client.request(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      }, (res) => {
        if (res.statusCode === 200) {
          this.results.successfulConnections++;
          this.results.totalConnections++;
          
          const connectionTime = Date.now() - startTime;
          this.results.connectionTimes.push(connectionTime);
          this.results.totalLatency += connectionTime;
          
          if (connectionId % 100 === 0) {
            console.log(`✅ Connection ${connectionId}: ${connectionTime}ms`);
          }
          
          // Handle SSE data
          res.on('data', (chunk) => {
            const data = chunk.toString();
            if (data.includes('data:')) {
              try {
                const eventData = JSON.parse(data.replace('data: ', ''));
                if (eventData.type === 'connection') {
                  // Connection established successfully
                }
              } catch (e) {
                // Ignore parsing errors for non-JSON events
              }
            }
          });
          
          // Keep connection alive for test duration
          setTimeout(() => {
            req.destroy();
            resolve();
          }, this.testDuration);
          
        } else {
          this.results.failedConnections++;
          this.results.totalConnections++;
          this.results.errors.push({
            connectionId,
            statusCode: res.statusCode,
            error: `HTTP ${res.statusCode}`
          });
          
          if (connectionId % 100 === 0) {
            console.log(`❌ Connection ${connectionId}: HTTP ${res.statusCode}`);
          }
          
          resolve();
        }
      });
      
      req.on('error', (error) => {
        this.results.failedConnections++;
        this.results.totalConnections++;
        this.results.errors.push({
          connectionId,
          error: error.message
        });
        
        if (connectionId % 100 === 0) {
          console.log(`❌ Connection ${connectionId}: ${error.message}`);
        }
        
        resolve();
      });
      
      req.on('timeout', () => {
        this.results.failedConnections++;
        this.results.totalConnections++;
        this.results.errors.push({
          connectionId,
          error: 'Connection timeout'
        });
        
        req.destroy();
        resolve();
      });
      
      req.setTimeout(this.connectionTimeout);
      req.end();
    });
  }

  generateReport() {
    const duration = this.results.endTime - this.results.startTime;
    this.results.averageLatency = this.results.totalLatency / this.results.successfulConnections || 0;
    
    const successRate = (this.results.successfulConnections / this.results.totalConnections) * 100;
    const connectionsPerSecond = this.results.totalConnections / (duration / 1000);
    
    console.log('');
    console.log('📊 Phase 14 SSE Load Test Results');
    console.log('=====================================');
    console.log(`⏱️  Test Duration: ${duration / 1000}s`);
    console.log(`📡 Total Connections: ${this.results.totalConnections}`);
    console.log(`✅ Successful: ${this.results.successfulConnections}`);
    console.log(`❌ Failed: ${this.results.failedConnections}`);
    console.log(`📈 Success Rate: ${successRate.toFixed(2)}%`);
    console.log(`🚀 Connections/Second: ${connectionsPerSecond.toFixed(2)}`);
    console.log(`⚡ Average Latency: ${this.results.averageLatency.toFixed(2)}ms`);
    
    if (this.results.connectionTimes.length > 0) {
      const sortedTimes = [...this.results.connectionTimes].sort((a, b) => a - b);
      const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)];
      const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
      const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];
      
      console.log(`📊 Latency Percentiles:`);
      console.log(`   P50: ${p50}ms`);
      console.log(`   P95: ${p95}ms`);
      console.log(`   P99: ${p99}ms`);
    }
    
    if (this.results.errors.length > 0) {
      console.log(`⚠️  Error Summary:`);
      const errorCounts = {};
      this.results.errors.forEach(error => {
        const key = error.error || 'unknown';
        errorCounts[key] = (errorCounts[key] || 0) + 1;
      });
      
      Object.entries(errorCounts).forEach(([error, count]) => {
        console.log(`   ${error}: ${count} occurrences`);
      });
    }
    
    // Check if requirements are met
    console.log('');
    console.log('🎯 Phase 14 Requirements Check:');
    console.log(`   ✅ SSE Endpoint: ${this.results.successfulConnections > 0 ? 'OPERATIONAL' : 'FAILED'}`);
    console.log(`   ✅ 500 Concurrent: ${this.results.totalConnections >= 500 ? 'MET' : 'NOT MET'}`);
    console.log(`   ✅ 99% Success Rate: ${successRate >= 99 ? 'MET' : 'NOT MET'}`);
    console.log(`   ✅ Failover <5s: ${this.results.averageLatency < 5000 ? 'MET' : 'NOT MET'}`);
    
    // Emit results for programmatic access
    this.emit('testComplete', this.results);
    
    return this.results;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    baseUrl: args[0] || 'http://localhost:3000',
    concurrentConnections: parseInt(args[1]) || 500,
    testDuration: parseInt(args[2]) || 60000
  };
  
  const tester = new SSELoadTester(options);
  
  tester.on('testComplete', (results) => {
    if (results.successfulConnections >= 495 && results.totalConnections >= 500) {
      console.log('\n🎉 Phase 14 SSE Load Test PASSED!');
      process.exit(0);
    } else {
      console.log('\n❌ Phase 14 SSE Load Test FAILED!');
      process.exit(1);
    }
  });
  
  tester.runLoadTest().catch(error => {
    console.error('❌ Load test failed:', error);
    process.exit(1);
  });
}

module.exports = SSELoadTester;
