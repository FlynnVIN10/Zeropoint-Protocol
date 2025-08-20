// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module.js";
import { performance } from "perf_hooks";

describe("Consensus Timeout Tests - Extreme Load Scenarios", () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("Extreme Load Testing (20 concurrent users, 50 requests/batch)", () => {
    const CONCURRENT_USERS = 20;
    const REQUESTS_PER_BATCH = 50;
    const TIMEOUT_THRESHOLD = 100; // 100ms target
    const UPTIME_THRESHOLD = 99.9; // 99.9% uptime target

    it("should handle extreme load on consensus endpoints", async () => {
      const startTime = performance.now();
      const results = [];
      const errors = [];

      // Create concurrent user sessions
      const userSessions = [];
      for (let i = 0; i < CONCURRENT_USERS; i++) {
        try {
          const response = await request(app.getHttpServer())
            .post("/v1/auth/login")
            .send({
              username: `loadtest${i}`,
              password: "loadtest123",
            });

          if (response.status === 200) {
            userSessions.push(response.body.access_token);
          }
        } catch (error) {
          // Continue without authentication for public endpoints
        }
      }

      // Test consensus status endpoint under extreme load
      const consensusPromises = [];
      for (let i = 0; i < REQUESTS_PER_BATCH; i++) {
        for (const token of userSessions) {
          const promise = request(app.getHttpServer())
            .get("/v1/consensus/status")
            .set("Authorization", `Bearer ${token}`)
            .timeout(10000)
            .then((response) => ({
              success: true,
              statusCode: response.status,
              responseTime: response.body.responseTime || 0,
              endpoint: "/v1/consensus/status",
            }))
            .catch((error) => ({
              success: false,
              statusCode: error.status || 0,
              error: error.message,
              endpoint: "/v1/consensus/status",
            }));

          consensusPromises.push(promise);
        }
      }

      // Test advanced endpoints under extreme load
      const advancedPromises = [];
      for (let i = 0; i < REQUESTS_PER_BATCH; i++) {
        for (const token of userSessions) {
          const promise = request(app.getHttpServer())
            .get("/v1/advanced/status")
            .set("Authorization", `Bearer ${token}`)
            .timeout(10000)
            .then((response) => ({
              success: true,
              statusCode: response.status,
              responseTime: response.body.responseTime || 0,
              endpoint: "/v1/advanced/status",
            }))
            .catch((error) => ({
              success: false,
              statusCode: error.status || 0,
              error: error.message,
              endpoint: "/v1/advanced/status",
            }));

          advancedPromises.push(promise);
        }
      }

      // Test scaling endpoints under extreme load
      const scalingPromises = [];
      for (let i = 0; i < REQUESTS_PER_BATCH; i++) {
        for (const token of userSessions) {
          const promise = request(app.getHttpServer())
            .post("/v1/scaling/predict")
            .set("Authorization", `Bearer ${token}`)
            .send({
              load: Math.random() * 100,
              timestamp: new Date().toISOString(),
            })
            .timeout(10000)
            .then((response) => ({
              success: true,
              statusCode: response.status,
              responseTime: response.body.responseTime || 0,
              endpoint: "/v1/scaling/predict",
            }))
            .catch((error) => ({
              success: false,
              statusCode: error.status || 0,
              error: error.message,
              endpoint: "/v1/scaling/predict",
            }));

          scalingPromises.push(promise);
        }
      }

      // Execute all promises concurrently
      const allPromises = [
        ...consensusPromises,
        ...advancedPromises,
        ...scalingPromises,
      ];
      const batchResults = await Promise.all(allPromises);

      const endTime = performance.now();
      const totalDuration = endTime - startTime;

      // Analyze results
      const successful = batchResults.filter((r) => r.success);
      const failed = batchResults.filter((r) => !r.success);
      const totalRequests = batchResults.length;
      const successRate = (successful.length / totalRequests) * 100;

      // Calculate response times
      const responseTimes = successful
        .map((r) => r.responseTime)
        .filter((t) => t > 0);
      const avgResponseTime =
        responseTimes.length > 0
          ? responseTimes.reduce((sum, time) => sum + time, 0) /
            responseTimes.length
          : 0;

      const slowRequests = responseTimes.filter(
        (time) => time > TIMEOUT_THRESHOLD,
      ).length;
      const slowRequestRate = (slowRequests / responseTimes.length) * 100;

      // Log results
      console.log("\n📊 Extreme Load Test Results:");
      console.log(`Total Requests: ${totalRequests}`);
      console.log(`Successful: ${successful.length}`);
      console.log(`Failed: ${failed.length}`);
      console.log(`Success Rate: ${successRate.toFixed(2)}%`);
      console.log(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
      console.log(
        `Slow Requests (>${TIMEOUT_THRESHOLD}ms): ${slowRequests} (${slowRequestRate.toFixed(2)}%)`,
      );
      console.log(`Total Duration: ${totalDuration.toFixed(2)}ms`);
      console.log(
        `Requests/sec: ${(totalRequests / (totalDuration / 1000)).toFixed(2)}`,
      );

      // Assertions
      expect(successRate).toBeGreaterThanOrEqual(UPTIME_THRESHOLD);
      expect(avgResponseTime).toBeLessThan(TIMEOUT_THRESHOLD);
      expect(slowRequestRate).toBeLessThan(5); // Less than 5% slow requests
    }, 60000); // 60 second timeout

    it("should handle burst requests on telemetry endpoint", async () => {
      const BURST_SIZE = 100;
      const burstPromises = [];

      for (let i = 0; i < BURST_SIZE; i++) {
        const promise = request(app.getHttpServer())
          .post("/v1/soulchain/telemetry")
          .send({
            consensus: {
              entropy: Math.random(),
              participants: Math.floor(Math.random() * 100),
              activeVoices: Math.floor(Math.random() * 50),
              passiveStances: Math.floor(Math.random() * 50),
              consensusRatio: Math.random(),
            },
            agents: [
              {
                id: `agent-${i}`,
                intent: "test",
                state: "active",
                stake: Math.random() * 100,
              },
            ],
            timestamp: new Date().toISOString(),
          })
          .timeout(5000)
          .then((response) => ({
            success: true,
            statusCode: response.status,
            responseTime: response.body.responseTime || 0,
          }))
          .catch((error) => ({
            success: false,
            statusCode: error.status || 0,
            error: error.message,
          }));

        burstPromises.push(promise);
      }

      const results = await Promise.all(burstPromises);
      const successful = results.filter((r) => r.success);
      const successRate = (successful.length / BURST_SIZE) * 100;

      console.log(`\n📊 Burst Test Results:`);
      console.log(`Burst Size: ${BURST_SIZE}`);
      console.log(`Success Rate: ${successRate.toFixed(2)}%`);

      expect(successRate).toBeGreaterThanOrEqual(95); // 95% success rate for burst
    }, 30000);

    it("should maintain performance under sustained load", async () => {
      const SUSTAINED_DURATION = 30000; // 30 seconds
      const REQUESTS_PER_SECOND = 10;
      const totalRequests = Math.floor(
        (SUSTAINED_DURATION / 1000) * REQUESTS_PER_SECOND,
      );

      const startTime = performance.now();
      const results = [];
      let requestCount = 0;

      const makeRequest = async () => {
        try {
          const response = await request(app.getHttpServer())
            .get("/v1/consensus/status")
            .timeout(5000);

          results.push({
            success: true,
            statusCode: response.status,
            responseTime: response.body.responseTime || 0,
            timestamp: Date.now(),
          });
        } catch (error) {
          results.push({
            success: false,
            statusCode: error.status || 0,
            error: error.message,
            timestamp: Date.now(),
          });
        }
        requestCount++;
      };

      // Send requests at regular intervals
      const interval = setInterval(makeRequest, 1000 / REQUESTS_PER_SECOND);

      // Wait for sustained duration
      await new Promise((resolve) => setTimeout(resolve, SUSTAINED_DURATION));
      clearInterval(interval);

      const endTime = performance.now();
      const totalDuration = endTime - startTime;

      const successful = results.filter((r) => r.success);
      const successRate = (successful.length / results.length) * 100;
      const responseTimes = successful
        .map((r) => r.responseTime)
        .filter((t) => t > 0);
      const avgResponseTime =
        responseTimes.length > 0
          ? responseTimes.reduce((sum, time) => sum + time, 0) /
            responseTimes.length
          : 0;

      console.log(`\n📊 Sustained Load Test Results:`);
      console.log(`Duration: ${(totalDuration / 1000).toFixed(2)}s`);
      console.log(`Total Requests: ${results.length}`);
      console.log(`Success Rate: ${successRate.toFixed(2)}%`);
      console.log(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`);

      expect(successRate).toBeGreaterThanOrEqual(UPTIME_THRESHOLD);
      expect(avgResponseTime).toBeLessThan(TIMEOUT_THRESHOLD);
    }, 40000);

    it("should handle circuit breaker activation under extreme load", async () => {
      // This test verifies that circuit breakers activate properly under extreme load
      const OVERLOAD_REQUESTS = 200;
      const overloadPromises = [];

      for (let i = 0; i < OVERLOAD_REQUESTS; i++) {
        const promise = request(app.getHttpServer())
          .post("/v1/advanced/process")
          .send({
            data: "x".repeat(10000), // Large payload to trigger processing
            timestamp: new Date().toISOString(),
          })
          .timeout(2000)
          .then((response) => ({
            success: true,
            statusCode: response.status,
            circuitBreaker: response.body.circuitBreaker || false,
          }))
          .catch((error) => ({
            success: false,
            statusCode: error.status || 0,
            circuitBreaker: error.message.includes("circuit") || false,
            error: error.message,
          }));

        overloadPromises.push(promise);
      }

      const results = await Promise.all(overloadPromises);
      const circuitBreakerActivations = results.filter(
        (r) => r.circuitBreaker,
      ).length;
      const activationRate = (circuitBreakerActivations / results.length) * 100;

      console.log(`\n📊 Circuit Breaker Test Results:`);
      console.log(`Overload Requests: ${OVERLOAD_REQUESTS}`);
      console.log(`Circuit Breaker Activations: ${circuitBreakerActivations}`);
      console.log(`Activation Rate: ${activationRate.toFixed(2)}%`);

      // Circuit breakers should activate under extreme load
      expect(activationRate).toBeGreaterThan(0);
    }, 30000);
  });

  describe("Performance Optimization Validation", () => {
    it("should validate Redis caching performance", async () => {
      const cacheTestRequests = 50;
      const results = [];

      for (let i = 0; i < cacheTestRequests; i++) {
        const startTime = performance.now();

        try {
          const response = await request(app.getHttpServer())
            .get("/v1/consensus/status")
            .timeout(5000);

          const endTime = performance.now();
          const responseTime = endTime - startTime;

          results.push({
            success: true,
            responseTime,
            cached: response.headers["x-cache-hit"] === "true",
          });
        } catch (error) {
          results.push({
            success: false,
            error: error.message,
          });
        }
      }

      const successful = results.filter((r) => r.success);
      const cachedResponses = successful.filter((r) => r.cached).length;
      const cacheHitRate = (cachedResponses / successful.length) * 100;
      const avgResponseTime =
        successful.length > 0
          ? successful.reduce((sum, r) => sum + r.responseTime, 0) /
            successful.length
          : 0;

      console.log(`\n📊 Cache Performance Results:`);
      console.log(`Cache Hit Rate: ${cacheHitRate.toFixed(2)}%`);
      console.log(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`);

      expect(cacheHitRate).toBeGreaterThan(0); // Should have some cache hits
      expect(avgResponseTime).toBeLessThan(100); // Should be fast with caching
    });

    it("should validate connection pooling under load", async () => {
      const poolTestRequests = 100;
      const concurrentPromises = [];

      for (let i = 0; i < poolTestRequests; i++) {
        const promise = request(app.getHttpServer())
          .get("/v1/health/detailed")
          .timeout(5000)
          .then((response) => ({
            success: true,
            statusCode: response.status,
            poolStats: response.body.connectionPool || {},
          }))
          .catch((error) => ({
            success: false,
            error: error.message,
          }));

        concurrentPromises.push(promise);
      }

      const results = await Promise.all(concurrentPromises);
      const successful = results.filter((r) => r.success);
      const successRate = (successful.length / results.length) * 100;

      console.log(`\n📊 Connection Pool Test Results:`);
      console.log(`Success Rate: ${successRate.toFixed(2)}%`);

      expect(successRate).toBeGreaterThanOrEqual(95); // Should handle concurrent requests well
    });
  });
});
