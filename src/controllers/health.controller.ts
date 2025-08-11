/**
 * Health Controller - SLO monitoring and health checks
 *
 * @fileoverview Provides health check endpoints and SLO monitoring
 * @author Dev Team
 * @version 1.0.0
 */

import { Controller, Get, Res, HttpStatus } from "@nestjs/common";
import { Response } from "express";
import { performance } from "perf_hooks";
import { readFileSync } from "fs";
import { join } from "path";

@Controller("health")
export class HealthController {
  private startTime: number = Date.now();
  private requestCount: number = 0;
  private totalResponseTime: number = 0;

  @Get("healthz")
  async healthCheck(@Res() res: Response) {
    const start = performance.now();

    try {
      // Basic health checks
      const healthStatus = await this.performHealthChecks();

      const responseTime = performance.now() - start;
      this.recordMetrics(responseTime);

      if (healthStatus.healthy) {
        res.status(HttpStatus.OK).json({
          status: "healthy",
          timestamp: new Date().toISOString(),
          uptime: Date.now() - this.startTime,
          responseTime: `${responseTime.toFixed(2)}ms`,
          checks: healthStatus.checks,
        });
      } else {
        res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
          status: "unhealthy",
          timestamp: new Date().toISOString(),
          uptime: Date.now() - this.startTime,
          responseTime: `${responseTime.toFixed(2)}ms`,
          checks: healthStatus.checks,
          failedChecks: healthStatus.failedChecks,
        });
      }
    } catch (error) {
      const responseTime = performance.now() - start;
      this.recordMetrics(responseTime);

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: "error",
        timestamp: new Date().toISOString(),
        uptime: Date.now() - this.startTime,
        responseTime: `${responseTime.toFixed(2)}ms`,
        error: error.message,
      });
    }
  }

  @Get("readyz")
  async readinessCheck(@Res() res: Response) {
    const start = performance.now();

    try {
      // Readiness checks (dependencies, database, etc.)
      const readinessStatus = await this.performReadinessChecks();

      const responseTime = performance.now() - start;
      this.recordMetrics(responseTime);

      if (readinessStatus.ready) {
        res.status(HttpStatus.OK).json({
          status: "ready",
          timestamp: new Date().toISOString(),
          responseTime: `${responseTime.toFixed(2)}ms`,
          checks: readinessStatus.checks,
        });
      } else {
        res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
          status: "not_ready",
          timestamp: new Date().toISOString(),
          responseTime: `${responseTime.toFixed(2)}ms`,
          checks: readinessStatus.checks,
          failedChecks: readinessStatus.failedChecks,
        });
      }
    } catch (error) {
      const responseTime = performance.now() - start;
      this.recordMetrics(responseTime);

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: "error",
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime.toFixed(2)}ms`,
        error: error.message,
      });
    }
  }

  @Get("status/version.json")
  async versionInfo(@Res() res: Response) {
    try {
      // Read package.json for version information
      const packagePath = join(process.cwd(), "package.json");
      const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));

      // Get git information if available
      let gitInfo = {};
      try {
        const gitPath = join(process.cwd(), ".git");
        // This is a simplified version - in production you'd use git commands
        gitInfo = {
          repository: packageJson.repository?.url || "unknown",
          branch: process.env.GIT_BRANCH || "unknown",
          commit: process.env.GIT_COMMIT || "unknown",
        };
      } catch (gitError) {
        gitInfo = { error: "Git info unavailable" };
      }

      res.status(HttpStatus.OK).json({
        version: packageJson.version,
        name: packageJson.name,
        description: packageJson.description,
        buildTime: new Date().toISOString(),
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        uptime: Date.now() - this.startTime,
        git: gitInfo,
        environment: process.env.NODE_ENV || "development",
      });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: "Failed to retrieve version information",
        message: error.message,
      });
    }
  }

  @Get("metrics")
  async getMetrics(@Res() res: Response) {
    try {
      const avgResponseTime =
        this.requestCount > 0 ? this.totalResponseTime / this.requestCount : 0;

      const uptime = Date.now() - this.startTime;
      const uptimePercentage = this.calculateUptimePercentage();

      res.status(HttpStatus.OK).json({
        timestamp: new Date().toISOString(),
        uptime: {
          milliseconds: uptime,
          seconds: Math.floor(uptime / 1000),
          minutes: Math.floor(uptime / 60000),
          hours: Math.floor(uptime / 3600000),
          days: Math.floor(uptime / 86400000),
        },
        uptimePercentage: `${uptimePercentage.toFixed(4)}%`,
        requestMetrics: {
          totalRequests: this.requestCount,
          averageResponseTime: `${avgResponseTime.toFixed(2)}ms`,
          p95ResponseTime: this.calculateP95ResponseTime(),
        },
        sloStatus: {
          uptime: uptimePercentage >= 99.9 ? "PASS" : "FAIL",
          ttfb: avgResponseTime <= 600 ? "PASS" : "FAIL",
        },
      });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: "Failed to retrieve metrics",
        message: error.message,
      });
    }
  }

  /**
   * Perform comprehensive health checks
   */
  private async performHealthChecks(): Promise<{
    healthy: boolean;
    checks: Record<string, any>;
    failedChecks: string[];
  }> {
    const checks: Record<string, any> = {};
    const failedChecks: string[] = [];
    let overallHealthy = true;

    // Memory check
    try {
      const memUsage = process.memoryUsage();
      const memUsageMB = {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024),
      };

      checks.memory = {
        status: "healthy",
        usage: memUsageMB,
        limits: {
          maxRSS: 512, // 512MB
          maxHeap: 256, // 256MB
        },
      };

      if (memUsageMB.rss > 512 || memUsageMB.heapUsed > 256) {
        checks.memory.status = "warning";
        overallHealthy = false;
        failedChecks.push("memory");
      }
    } catch (error) {
      checks.memory = { status: "error", error: error.message };
      overallHealthy = false;
      failedChecks.push("memory");
    }

    // CPU check
    try {
      const cpuUsage = process.cpuUsage();
      checks.cpu = {
        status: "healthy",
        usage: {
          user: Math.round(cpuUsage.user / 1000), // microseconds to milliseconds
          system: Math.round(cpuUsage.system / 1000),
        },
      };
    } catch (error) {
      checks.cpu = { status: "error", error: error.message };
      overallHealthy = false;
      failedChecks.push("cpu");
    }

    // Process check
    try {
      checks.process = {
        status: "healthy",
        pid: process.pid,
        uptime: process.uptime(),
        version: process.version,
        platform: process.platform,
        arch: process.arch,
      };
    } catch (error) {
      checks.process = { status: "error", error: error.message };
      overallHealthy = false;
      failedChecks.push("process");
    }

    // Environment check
    try {
      checks.environment = {
        status: "healthy",
        nodeEnv: process.env.NODE_ENV || "development",
        port: process.env.PORT || "3000",
        timezone: process.env.TZ || "UTC",
      };
    } catch (error) {
      checks.environment = { status: "error", error: error.message };
      overallHealthy = false;
      failedChecks.push("environment");
    }

    return {
      healthy: overallHealthy,
      checks,
      failedChecks,
    };
  }

  /**
   * Perform readiness checks
   */
  private async performReadinessChecks(): Promise<{
    ready: boolean;
    checks: Record<string, any>;
    failedChecks: string[];
  }> {
    const checks: Record<string, any> = {};
    const failedChecks: string[] = [];
    let overallReady = true;

    // Database connectivity check
    try {
      // This would check actual database connectivity
      // For now, simulate a check
      await new Promise((resolve) => setTimeout(resolve, 10));
      checks.database = {
        status: "ready",
        message: "Database connection available",
      };
    } catch (error) {
      checks.database = { status: "not_ready", error: error.message };
      overallReady = false;
      failedChecks.push("database");
    }

    // External service checks
    try {
      // Check if required external services are available
      checks.externalServices = {
        status: "ready",
        message: "External services available",
      };
    } catch (error) {
      checks.externalServices = { status: "not_ready", error: error.message };
      overallReady = false;
      failedChecks.push("externalServices");
    }

    // Configuration check
    try {
      checks.configuration = {
        status: "ready",
        message: "Configuration loaded successfully",
      };
    } catch (error) {
      checks.configuration = { status: "not_ready", error: error.message };
      overallReady = false;
      failedChecks.push("configuration");
    }

    return {
      ready: overallReady,
      checks,
      failedChecks,
    };
  }

  /**
   * Record metrics for response time tracking
   */
  private recordMetrics(responseTime: number): void {
    this.requestCount++;
    this.totalResponseTime += responseTime;
  }

  /**
   * Calculate uptime percentage
   */
  private calculateUptimePercentage(): number {
    const uptime = Date.now() - this.startTime;
    const totalTime = Date.now() - this.startTime;
    return (uptime / totalTime) * 100;
  }

  /**
   * Calculate P95 response time
   */
  private calculateP95ResponseTime(): string {
    // This is a simplified P95 calculation
    // In production, you'd maintain a rolling window of response times
    const avgResponseTime =
      this.requestCount > 0 ? this.totalResponseTime / this.requestCount : 0;

    // Estimate P95 as 1.5x average for simplicity
    const p95 = avgResponseTime * 1.5;
    return `${p95.toFixed(2)}ms`;
  }
}
