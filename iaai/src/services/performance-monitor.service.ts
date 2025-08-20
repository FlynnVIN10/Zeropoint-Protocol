// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { Injectable, Logger } from "@nestjs/common";
import { performanceTargets } from "../config/redis.config.js";

export interface PerformanceMetrics {
  responseTime: {
    current: number;
    average: number;
    p95: number;
    p99: number;
    slowRequests: number;
    totalRequests: number;
  };
  uptime: {
    current: number;
    startTime: Date;
    lastCheck: Date;
    totalUptime: number;
    totalDowntime: number;
  };
  concurrentLoad: {
    current: number;
    peak: number;
    average: number;
    maxAgents: number;
  };
  errors: {
    total: number;
    rate: number;
    lastError: Date;
    errorTypes: Map<string, number>;
  };
  cache: {
    hitRate: number;
    missRate: number;
    evictionRate: number;
    memoryUsage: number;
  };
}

export interface PerformanceAlert {
  level: "info" | "warning" | "critical";
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: Date;
}

@Injectable()
export class PerformanceMonitorService {
  private readonly logger = new Logger(PerformanceMonitorService.name);
  private metrics: PerformanceMetrics;
  private alerts: PerformanceAlert[] = [];
  private startTime: Date;
  private requestTimes: number[] = [];
  private errorCount = 0;
  private totalRequests = 0;

  constructor() {
    this.startTime = new Date();
    this.initializeMetrics();
    this.startMonitoring();
  }

  private initializeMetrics(): void {
    this.metrics = {
      responseTime: {
        current: 0,
        average: 0,
        p95: 0,
        p99: 0,
        slowRequests: 0,
        totalRequests: 0,
      },
      uptime: {
        current: 100,
        startTime: this.startTime,
        lastCheck: new Date(),
        totalUptime: 0,
        totalDowntime: 0,
      },
      concurrentLoad: {
        current: 0,
        peak: 0,
        average: 0,
        maxAgents: performanceTargets.concurrentLoad.target,
      },
      errors: {
        total: 0,
        rate: 0,
        lastError: null,
        errorTypes: new Map(),
      },
      cache: {
        hitRate: 0,
        missRate: 0,
        evictionRate: 0,
        memoryUsage: 0,
      },
    };
  }

  private startMonitoring(): void {
    // Monitor uptime every 30 seconds
    setInterval(() => {
      this.updateUptime();
    }, 30000);

    // Clean up old request times every minute
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 60000);

    // Log performance summary every 5 minutes
    setInterval(() => {
      this.logPerformanceSummary();
    }, 300000);
  }

  /**
   * Record request response time
   */
  recordRequest(responseTime: number): void {
    this.totalRequests++;
    this.requestTimes.push(responseTime);

    // Update current response time
    this.metrics.responseTime.current = responseTime;

    // Track slow requests (>100ms as per Phase 10 target)
    if (responseTime > performanceTargets.responseTime.target) {
      this.metrics.responseTime.slowRequests++;
    }

    // Calculate percentiles
    this.calculatePercentiles();

    // Check for alerts
    this.checkResponseTimeAlerts(responseTime);
  }

  /**
   * Record error occurrence
   */
  recordError(errorType: string, error: Error): void {
    this.errorCount++;
    this.metrics.errors.total = this.errorCount;
    this.metrics.errors.lastError = new Date();

    // Track error types
    const currentCount = this.metrics.errors.errorTypes.get(errorType) || 0;
    this.metrics.errors.errorTypes.set(errorType, currentCount + 1);

    // Calculate error rate
    this.metrics.errors.rate = (this.errorCount / this.totalRequests) * 100;

    // Check for error rate alerts
    this.checkErrorRateAlerts();
  }

  /**
   * Update concurrent load metrics
   */
  updateConcurrentLoad(currentLoad: number): void {
    this.metrics.concurrentLoad.current = currentLoad;

    if (currentLoad > this.metrics.concurrentLoad.peak) {
      this.metrics.concurrentLoad.peak = currentLoad;
    }

    // Check for concurrent load alerts
    this.checkConcurrentLoadAlerts(currentLoad);
  }

  /**
   * Update cache metrics
   */
  updateCacheMetrics(
    hitRate: number,
    evictionRate: number,
    memoryUsage: number,
  ): void {
    this.metrics.cache.hitRate = hitRate;
    this.metrics.cache.evictionRate = evictionRate;
    this.metrics.cache.memoryUsage = memoryUsage;

    // Check for cache alerts
    this.checkCacheAlerts(evictionRate);
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get performance alerts
   */
  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  /**
   * Check if performance targets are met
   */
  checkPerformanceTargets(): {
    responseTime: boolean;
    uptime: boolean;
    slowRequests: boolean;
    concurrentLoad: boolean;
  } {
    const slowRequestRate =
      (this.metrics.responseTime.slowRequests / this.totalRequests) * 100;

    return {
      responseTime:
        this.metrics.responseTime.average <=
        performanceTargets.responseTime.target,
      uptime: this.metrics.uptime.current >= performanceTargets.uptime.target,
      slowRequests: slowRequestRate <= performanceTargets.slowRequests.target,
      concurrentLoad:
        this.metrics.concurrentLoad.current <=
        performanceTargets.concurrentLoad.target,
    };
  }

  /**
   * Get performance summary for reporting
   */
  getPerformanceSummary(): string {
    const targets = this.checkPerformanceTargets();
    const slowRequestRate =
      (this.metrics.responseTime.slowRequests / this.totalRequests) * 100;

    return `
Performance Summary - ${new Date().toISOString()}
================================================
Response Time: ${this.metrics.responseTime.average.toFixed(2)}ms (Target: <${performanceTargets.responseTime.target}ms) ${targets.responseTime ? "✅" : "❌"}
Uptime: ${this.metrics.uptime.current.toFixed(2)}% (Target: ${performanceTargets.uptime.target}%) ${targets.uptime ? "✅" : "❌"}
Slow Requests: ${slowRequestRate.toFixed(2)}% (Target: <${performanceTargets.slowRequests.target}%) ${targets.slowRequests ? "✅" : "❌"}
Concurrent Load: ${this.metrics.concurrentLoad.current} (Target: <${performanceTargets.concurrentLoad.target}) ${targets.concurrentLoad ? "✅" : "❌"}
Total Requests: ${this.totalRequests}
Error Rate: ${this.metrics.errors.rate.toFixed(2)}%
Cache Hit Rate: ${this.metrics.cache.hitRate.toFixed(2)}%
    `.trim();
  }

  private calculatePercentiles(): void {
    if (this.requestTimes.length === 0) return;

    const sorted = [...this.requestTimes].sort((a, b) => a - b);
    const total = sorted.length;

    // Calculate average
    this.metrics.responseTime.average =
      sorted.reduce((a, b) => a + b, 0) / total;

    // Calculate P95 and P99
    this.metrics.responseTime.p95 = sorted[Math.floor(total * 0.95)];
    this.metrics.responseTime.p99 = sorted[Math.floor(total * 0.99)];

    this.metrics.responseTime.totalRequests = total;
  }

  private updateUptime(): void {
    const now = new Date();
    const totalTime = now.getTime() - this.startTime.getTime();
    const uptime = this.metrics.uptime.totalUptime;
    const downtime = this.metrics.uptime.totalDowntime;

    // Calculate current uptime percentage
    this.metrics.uptime.current = (uptime / (uptime + downtime)) * 100 || 100;
    this.metrics.uptime.lastCheck = now;
  }

  private cleanupOldMetrics(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    this.requestTimes = this.requestTimes.filter((time) => time > oneHourAgo);

    // Keep only last 1000 requests for performance
    if (this.requestTimes.length > 1000) {
      this.requestTimes = this.requestTimes.slice(-1000);
    }
  }

  private checkResponseTimeAlerts(responseTime: number): void {
    if (responseTime > performanceTargets.responseTime.critical) {
      this.createAlert(
        "critical",
        "Response time exceeded critical threshold",
        "responseTime",
        responseTime,
        performanceTargets.responseTime.critical,
      );
    } else if (responseTime > performanceTargets.responseTime.warning) {
      this.createAlert(
        "warning",
        "Response time exceeded warning threshold",
        "responseTime",
        responseTime,
        performanceTargets.responseTime.warning,
      );
    }
  }

  private checkErrorRateAlerts(): void {
    if (this.metrics.errors.rate > 5) {
      // 5% error rate threshold
      this.createAlert(
        "critical",
        "Error rate exceeded 5% threshold",
        "errorRate",
        this.metrics.errors.rate,
        5,
      );
    }
  }

  private checkConcurrentLoadAlerts(currentLoad: number): void {
    if (currentLoad > performanceTargets.concurrentLoad.critical) {
      this.createAlert(
        "critical",
        "Concurrent load exceeded critical threshold",
        "concurrentLoad",
        currentLoad,
        performanceTargets.concurrentLoad.critical,
      );
    } else if (currentLoad > performanceTargets.concurrentLoad.warning) {
      this.createAlert(
        "warning",
        "Concurrent load exceeded warning threshold",
        "concurrentLoad",
        currentLoad,
        performanceTargets.concurrentLoad.warning,
      );
    }
  }

  private checkCacheAlerts(evictionRate: number): void {
    if (evictionRate > 0.1) {
      // Temporary fix - hardcoded threshold
      this.createAlert(
        "warning",
        "Cache eviction rate exceeded threshold",
        "evictionRate",
        evictionRate,
        0.1, // Temporary fix - hardcoded threshold
      );
    }
  }

  private createAlert(
    level: "info" | "warning" | "critical",
    message: string,
    metric: string,
    value: number,
    threshold: number,
  ): void {
    const alert: PerformanceAlert = {
      level,
      message,
      metric,
      value,
      threshold,
      timestamp: new Date(),
    };

    this.alerts.push(alert);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    // Log critical alerts immediately
    if (level === "critical") {
      this.logger.error(
        `CRITICAL ALERT: ${message} - ${metric}: ${value} (threshold: ${threshold})`,
      );
    } else if (level === "warning") {
      this.logger.warn(
        `WARNING: ${message} - ${metric}: ${value} (threshold: ${threshold})`,
      );
    }
  }

  private logPerformanceSummary(): void {
    this.logger.log(this.getPerformanceSummary());
  }
}
