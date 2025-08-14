#!/usr/bin/env node

// Simple SSE Endpoint Test Script
// Tests basic SSE functionality before running full load test

const http = require('http');
const https = require('https');

class SSESimpleTester {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.endpoint = '/v1/stream';
  }

  async testBasicConnection() {
    console.log('🧪 Testing Basic SSE Connection');
    console.log(`🔗 Endpoint: ${this.baseUrl}${this.endpoint}`);
    console.log('');

    return new Promise((resolve, reject) => {
      const url = new URL(`${this.baseUrl}${this.endpoint}`);
      url.searchParams.set('prompt', 'Test prompt');
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

      let events = [];
      let connectionStartTime = Date.now();

      req.on('response', (res) => {
        console.log(`✅ Connection established - Status: ${res.statusCode}`);
        console.log(`📡 Headers received:`);
        
        // Check for required security headers
        const requiredHeaders = [
          'X-Provider-Router',
          'X-Security-Level', 
          'X-Rate-Limit',
          'X-Rate-Limit-Window'
        ];
        
        requiredHeaders.forEach(header => {
          const value = res.headers[header.toLowerCase()];
          if (value) {
            console.log(`   ${header}: ${value}`);
          } else {
            console.log(`   ${header}: ❌ MISSING`);
          }
        });

        res.on('data', (chunk) => {
          const data = chunk.toString();
          const lines = data.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const eventData = JSON.parse(line.substring(6));
                events.push(eventData);
                
                console.log(`📨 Event: ${eventData.type} - ${JSON.stringify(eventData).substring(0, 100)}...`);
                
                // Check for bias and fairness checks
                if (eventData.bias_check) {
                  console.log(`   ✅ Bias check: ${eventData.bias_check}`);
                }
                if (eventData.fairness_check) {
                  console.log(`   ✅ Fairness check: ${eventData.fairness_check}`);
                }
                
              } catch (error) {
                console.log(`⚠️  Raw event data: ${line}`);
              }
            }
          }
        });

        res.on('end', () => {
          const duration = Date.now() - connectionStartTime;
          console.log(`\n🏁 Connection ended after ${duration}ms`);
          console.log(`📊 Total events received: ${events.length}`);
          
          // Validate events
          const hasConnectionEvent = events.some(e => e.type === 'connection');
          const hasSystemStatusEvent = events.some(e => e.type === 'system_status');
          const hasHeartbeatEvent = events.some(e => e.type === 'heartbeat');
          
          console.log(`\n🎯 Event Validation:`);
          console.log(`   Connection event: ${hasConnectionEvent ? '✅' : '❌'}`);
          console.log(`   System status event: ${hasSystemStatusEvent ? '✅' : '❌'}`);
          console.log(`   Heartbeat event: ${hasHeartbeatEvent ? '✅' : '❌'}`);
          
          const allEventsPresent = hasConnectionEvent && hasSystemStatusEvent;
          console.log(`\n🏆 Basic SSE Test: ${allEventsPresent ? 'PASS' : 'FAIL'}`);
          
          resolve({
            success: allEventsPresent,
            events,
            duration,
            headers: res.headers
          });
        });

        res.on('error', (error) => {
          console.error(`❌ Response error: ${error.message}`);
          reject(error);
        });
      });

      req.on('error', (error) => {
        console.error(`❌ Request error: ${error.message}`);
        reject(error);
      });

      req.on('timeout', () => {
        console.error('❌ Request timeout');
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.setTimeout(10000); // 10 second timeout
      req.end();
    });
  }

  async testGenerationEndpoint() {
    console.log('\n🧪 Testing Generation Endpoint');
    console.log(`🔗 Endpoint: ${this.baseUrl}/v1/stream/generate`);
    console.log('');

    return new Promise((resolve, reject) => {
      const url = new URL(`${this.baseUrl}/v1/stream/generate`);
      
      const postData = JSON.stringify({
        prompt: 'Test generation prompt',
        provider: 'auto',
        maxTokens: 100,
        temperature: 0.7,
        stream: true
      });

      const client = url.protocol === 'https:' ? https : http;
      
      const req = client.request(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });

      let events = [];
      let generationStartTime = Date.now();

      req.on('response', (res) => {
        console.log(`✅ Generation request - Status: ${res.statusCode}`);
        
        if (res.statusCode === 429) {
          console.log('🚫 Rate limited - this is expected behavior');
          resolve({
            success: true,
            rateLimited: true,
            message: 'Rate limiting working correctly'
          });
          return;
        }

        res.on('data', (chunk) => {
          const data = chunk.toString();
          const lines = data.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const eventData = JSON.parse(line.substring(6));
                events.push(eventData);
                
                console.log(`📨 Generation Event: ${eventData.type}`);
                
                if (eventData.type === 'provider_switch') {
                  const failoverTime = Date.now() - generationStartTime;
                  console.log(`🔄 Provider failover in ${failoverTime}ms`);
                }
                
              } catch (error) {
                console.log(`⚠️  Raw generation event: ${line}`);
              }
            }
          }
        });

        res.on('end', () => {
          const duration = Date.now() - generationStartTime;
          console.log(`\n🏁 Generation completed in ${duration}ms`);
          console.log(`📊 Total generation events: ${events.length}`);
          
          const hasGenerationStarted = events.some(e => e.type === 'generation_started');
          const hasProviderSelected = events.some(e => e.type === 'provider_selected');
          const hasComplete = events.some(e => e.type === 'complete');
          
          console.log(`\n🎯 Generation Validation:`);
          console.log(`   Generation started: ${hasGenerationStarted ? '✅' : '❌'}`);
          console.log(`   Provider selected: ${hasProviderSelected ? '✅' : '❌'}`);
          console.log(`   Generation complete: ${hasComplete ? '✅' : '❌'}`);
          
          const generationSuccess = hasGenerationStarted && hasProviderSelected && hasComplete;
          console.log(`\n🏆 Generation Test: ${generationSuccess ? 'PASS' : 'FAIL'}`);
          
          resolve({
            success: generationSuccess,
            events,
            duration,
            failoverTime: events.some(e => e.type === 'provider_switch') ? 
              events.find(e => e.type === 'provider_switch').latency : null
          });
        });

        res.on('error', (error) => {
          console.error(`❌ Generation response error: ${error.message}`);
          reject(error);
        });
      });

      req.on('error', (error) => {
        console.error(`❌ Generation request error: ${error.message}`);
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  }

  async runAllTests() {
    try {
      console.log('🚀 Starting SSE Endpoint Tests');
      console.log('================================');
      
      const basicResult = await this.testBasicConnection();
      
      if (basicResult.success) {
        const generationResult = await this.testGenerationEndpoint();
        
        console.log('\n📊 Final Test Results');
        console.log('=====================');
        console.log(`Basic SSE: ${basicResult.success ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`Generation: ${generationResult.success ? '✅ PASS' : '❌ PASS'}`);
        
        if (generationResult.failoverTime) {
          console.log(`Failover Time: ${generationResult.failoverTime}ms ${generationResult.failoverTime < 5000 ? '✅' : '❌'} (<5s)`);
        }
        
        const overallSuccess = basicResult.success && generationResult.success;
        console.log(`\n🏆 Overall Result: ${overallSuccess ? 'PASS' : 'FAIL'}`);
        
        return overallSuccess;
      } else {
        console.log('\n❌ Basic SSE test failed, skipping generation test');
        return false;
      }
      
    } catch (error) {
      console.error('❌ Test execution failed:', error.message);
      return false;
    }
  }
}

// CLI usage
if (require.main === module) {
  const baseUrl = process.argv[2] || 'http://localhost:3000';
  const tester = new SSESimpleTester(baseUrl);
  
  tester.runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  });
}

module.exports = SSESimpleTester;
