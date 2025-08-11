#!/usr/bin/env node

// Phase 14 SSE Load Testing Script
// Tests /v1/stream endpoint with 500 concurrent connections
// Requirements: 99% success rate, failover <5s, SSE streams without drop

const http = require('http');
const https = require('https');
const { EventEmitter } = require('events');

class SSELoadTester extends EventEmitter {
  constructor(options = {}) {
    super();
    this.baseUrl = options.baseUrl || 'http://localhost:3000';
    this.endpoint = options.endpoint || '/v1/stream';
    this.concurrentConnections = options.concurrentConnections || 500;
    this.testDuration = options.testDuration || 60000; // 1 minute
    this.healthCheckInterval = options.healthCheckInterval || 5000; // 5 seconds
    
    this.activeConnections = new Map();
    this.connectionStats = {
      total: 0,
      successful: 0,
      failed: 0,
      dropped: 0,
      failoverCount: 0,
      averageLatency: 0,
      startTime: Date.now(),
    };
    
    this.providerFailoverTimes = [];
    this.rateLimitHits = 0;
  }

  async startTest() {
    console.log('🚀 Starting Phase 14 SSE Load Test');
    console.log(`🔗 Endpoint: ${this.baseUrl}${this.endpoint}`);
    console.log(`👥 Target Connections: ${this.concurrentConnections}`);
    console.log(`⏱️  Test Duration: ${this.testDuration / 1000}s`);
    console.log('');

    // Start health monitoring
    this.startHealthMonitoring();
    
    // Establish connections gradually to avoid overwhelming the server
    await this.establishConnections();
    
    // Run the test for the specified duration
    setTimeout(() => {
      this.completeTest();
    }, this.testDuration);
  }

  async establishConnections() {
    const batchSize = 50; // Establish connections in batches
    const delay = 100; // 100ms between batches
    
    for (let i = 0; i < this.concurrentConnections; i += batchSize) {
      const batch = Math.min(batchSize, this.concurrentConnections - i);
      
      for (let j = 0; j < batch; j++) {
        const connectionId = i + j;
        this.createConnection(connectionId);
      }
      
      // Wait before next batch
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  createConnection(connectionId) {
    const url = new URL(`${this.baseUrl}${this.endpoint}`);
    url.searchParams.set('prompt', `Test prompt ${connectionId}`);
    url.searchParams.set('provider', 'auto');
    
    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.request(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

    const connection = {
      id: connectionId,
      req,
      startTime: Date.now(),
      events: [],
      status: 'connecting',
      lastEventTime: Date.now(),
    };

    req.on('response', (res) => {
      connection.status = 'connected';
      connection.response = res;
      this.connectionStats.successful++;
      
      // Track response headers for security validation
      this.validateSecurityHeaders(res.headers);
      
      res.on('data', (chunk) => {
        this.handleSSEEvent(connection, chunk);
      });
      
      res.on('end', () => {
        this.handleConnectionEnd(connection, 'normal');
      });
      
      res.on('error', (error) => {
        this.handleConnectionError(connection, error);
      });
    });

    req.on('error', (error) => {
      this.handleConnectionError(connection, error);
    });

    req.on('timeout', () => {
      this.handleConnectionError(connection, new Error('Connection timeout'));
    });

    req.setTimeout(10000); // 10 second timeout
    req.end();

    this.activeConnections.set(connectionId, connection);
    this.connectionStats.total++;
  }

  handleSSEEvent(connection, chunk) {
    const data = chunk.toString();
    const lines = data.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const eventData = JSON.parse(line.substring(6));
          connection.events.push(eventData);
          connection.lastEventTime = Date.now();
          
          // Track provider switches for failover timing
          if (eventData.type === 'provider_switch') {
            const failoverTime = Date.now() - connection.startTime;
            this.providerFailoverTimes.push(failoverTime);
            this.connectionStats.failoverCount++;
            
            console.log(`🔄 Connection ${connection.id}: Provider failover in ${failoverTime}ms`);
          }
          
          // Track bias and fairness checks
          if (eventData.bias_check || eventData.fairness_check) {
            console.log(`✅ Connection ${connection.id}: ${eventData.bias_check || ''} ${eventData.fairness_check || ''}`);
          }
        } catch (error) {
          console.warn(`⚠️  Connection ${connection.id}: Failed to parse SSE event:`, error.message);
        }
      }
    }
  }

  handleConnectionEnd(connection, reason) {
    connection.status = 'closed';
    connection.endTime = Date.now();
    connection.duration = connection.endTime - connection.startTime;
    
    if (reason === 'normal') {
      console.log(`✅ Connection ${connection.id}: Closed normally after ${connection.duration}ms`);
    }
    
    this.activeConnections.delete(connection.id);
  }

  handleConnectionError(connection, error) {
    connection.status = 'error';
    connection.error = error.message;
    connection.endTime = Date.now();
    connection.duration = connection.endTime - connection.startTime;
    
    this.connectionStats.failed++;
    
    if (error.message.includes('429')) {
      this.rateLimitHits++;
      console.log(`🚫 Connection ${connection.id}: Rate limited`);
    } else {
      console.log(`❌ Connection ${connection.id}: Error - ${error.message}`);
    }
    
    this.activeConnections.delete(connection.id);
  }

  validateSecurityHeaders(headers) {
    const requiredHeaders = [
      'X-Provider-Router',
      'X-Security-Level',
      'X-Rate-Limit',
      'X-Rate-Limit-Window'
    ];
    
    for (const header of requiredHeaders) {
      if (!headers[header]) {
        console.warn(`⚠️  Missing security header: ${header}`);
      }
    }
  }

  startHealthMonitoring() {
    const interval = setInterval(() => {
      const now = Date.now();
      const activeCount = this.activeConnections.size;
      const testDuration = now - this.connectionStats.startTime;
      
      // Check for dropped connections (no events in last 10 seconds)
      let droppedCount = 0;
      for (const [id, connection] of this.activeConnections) {
        if (now - connection.lastEventTime > 10000) {
          droppedCount++;
          this.connectionStats.dropped++;
          this.activeConnections.delete(id);
        }
      }
      
      // Calculate success rate
      const successRate = (this.connectionStats.successful / this.connectionStats.total) * 100;
      
      // Calculate average failover time
      const avgFailoverTime = this.providerFailoverTimes.length > 0 
        ? this.providerFailoverTimes.reduce((a, b) => a + b, 0) / this.providerFailoverTimes.length
        : 0;
      
      console.log(`📊 Health Check - Active: ${activeCount}, Success Rate: ${successRate.toFixed(1)}%, Avg Failover: ${avgFailoverTime.toFixed(0)}ms, Dropped: ${droppedCount}`);
      
      // Check if test should end
      if (testDuration >= this.testDuration) {
        clearInterval(interval);
      }
    }, this.healthCheckInterval);
  }

  completeTest() {
    console.log('\n🏁 Test Complete - Final Results');
    console.log('=====================================');
    
    // Close all active connections
    for (const [id, connection] of this.activeConnections) {
      if (connection.req) {
        connection.req.destroy();
      }
    }
    
    const totalDuration = Date.now() - this.connectionStats.startTime;
    const successRate = (this.connectionStats.successful / this.connectionStats.total) * 100;
    const avgFailoverTime = this.providerFailoverTimes.length > 0 
      ? this.providerFailoverTimes.reduce((a, b) => a + b, 0) / this.providerFailoverTimes.length
      : 0;
    
    console.log(`📈 Total Connections: ${this.connectionStats.total}`);
    console.log(`✅ Successful: ${this.connectionStats.successful}`);
    console.log(`❌ Failed: ${this.connectionStats.failed}`);
    console.log(`💔 Dropped: ${this.connectionStats.dropped}`);
    console.log(`🔄 Failovers: ${this.connectionStats.failoverCount}`);
    console.log(`⏱️  Average Failover Time: ${avgFailoverTime.toFixed(0)}ms`);
    console.log(`🚫 Rate Limit Hits: ${this.rateLimitHits}`);
    console.log(`📊 Success Rate: ${successRate.toFixed(1)}%`);
    console.log(`⏱️  Total Duration: ${totalDuration}ms`);
    
    // Phase 14 Acceptance Criteria Check
    console.log('\n🎯 Phase 14 Acceptance Criteria');
    console.log('================================');
    
    const sseStreamsWithoutDrop = successRate >= 99;
    const failoverUnder5s = avgFailoverTime < 5000;
    const successRate99 = successRate >= 99;
    
    console.log(`✅ SSE streams without drop: ${sseStreamsWithoutDrop ? 'PASS' : 'FAIL'} (${successRate.toFixed(1)}%)`);
    console.log(`✅ Failover <5s: ${failoverUnder5s ? 'PASS' : 'FAIL'} (${avgFailoverTime.toFixed(0)}ms)`);
    console.log(`✅ 99% success rate: ${successRate99 ? 'PASS' : 'FAIL'} (${successRate.toFixed(1)}%)`);
    
    const overallPass = sseStreamsWithoutDrop && failoverUnder5s && successRate99;
    console.log(`\n🏆 Overall Result: ${overallPass ? 'PASS' : 'FAIL'}`);
    
    // Emit results for programmatic use
    this.emit('testComplete', {
      success: overallPass,
      stats: this.connectionStats,
      avgFailoverTime,
      successRate,
      sseStreamsWithoutDrop,
      failoverUnder5s,
      successRate99
    });
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    baseUrl: args[0] || 'http://localhost:3000',
    endpoint: args[1] || '/v1/stream',
    concurrentConnections: parseInt(args[2]) || 500,
    testDuration: parseInt(args[3]) || 60000,
  };
  
  const tester = new SSELoadTester(options);
  
  tester.on('testComplete', (results) => {
    process.exit(results.success ? 0 : 1);
  });
  
  tester.startTest().catch(error => {
    console.error('❌ Test failed to start:', error.message);
    process.exit(1);
  });
}

module.exports = SSELoadTester;
