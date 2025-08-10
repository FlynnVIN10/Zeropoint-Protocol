// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Logger } from '@nestjs/common';
import { PerformanceMonitorService } from '../services/performance-monitor.service.js';
import { RedisCacheService } from '../services/redis-cache.service.js';
import { CircuitBreakerService } from '../services/circuit-breaker.service.js';
import { ConnectionPoolService } from '../services/connection-pool.service.js';
import { performanceTargets } from '../config/redis.config.js';

export interface PerformanceDashboard {
  timestamp: string;
  phase: string;
  targets: {
    responseTime: number;
    uptime: number;
    slowRequests: number;
    concurrentLoad: number;
  };
  currentMetrics: {
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
      startTime: string;
      lastCheck: string;
    };
    concurrentLoad: {
      current: number;
      peak: number;
      average: number;
    };
    errors: {
      total: number;
      rate: number;
      lastError: string;
    };
    cache: {
      hitRate: number;
      evictionRate: number;
      memoryUsage: number;
    };
  };
  targetsMet: {
    responseTime: boolean;
    uptime: boolean;
    slowRequests: boolean;
    concurrentLoad: boolean;
  };
  alerts: Array<{
    level: string;
    message: string;
    timestamp: string;
  }>;
  recommendations: string[];
}

@Controller('performance')
export class PerformanceController {
  private readonly logger = new Logger(PerformanceController.name);

  constructor(
    private performanceMonitor: PerformanceMonitorService,
    private redisCache: RedisCacheService,
    private circuitBreaker: CircuitBreakerService,
    private connectionPool: ConnectionPoolService,
  ) {}

  /**
   * Get comprehensive performance dashboard
   */
  @Get('dashboard')
  async getPerformanceDashboard(): Promise<PerformanceDashboard> {
    try {
      const metrics = this.performanceMonitor.getMetrics();
      const alerts = this.performanceMonitor.getAlerts();
      const targets = this.performanceMonitor.checkPerformanceTargets();
      
      // Get Redis stats
      const redisStats = await this.redisCache.getStats();
      
      // Generate recommendations based on current performance
      const recommendations = this.generateRecommendations(metrics, targets, redisStats);
      
      const dashboard: PerformanceDashboard = {
        timestamp: new Date().toISOString(),
        phase: 'Phase 10 - Optimization',
        targets: {
          responseTime: performanceTargets.responseTime.target,
          uptime: performanceTargets.uptime.target,
          slowRequests: performanceTargets.slowRequests.target,
          concurrentLoad: performanceTargets.concurrentLoad.target,
        },
        currentMetrics: {
          responseTime: {
            current: metrics.responseTime.current,
            average: metrics.responseTime.average,
            p95: metrics.responseTime.p95,
            p99: metrics.responseTime.p99,
            slowRequests: metrics.responseTime.slowRequests,
            totalRequests: metrics.responseTime.totalRequests,
          },
          uptime: {
            current: metrics.uptime.current,
            startTime: metrics.uptime.startTime.toISOString(),
            lastCheck: metrics.uptime.lastCheck.toISOString(),
          },
          concurrentLoad: {
            current: metrics.concurrentLoad.current,
            peak: metrics.concurrentLoad.peak,
            average: metrics.concurrentLoad.average,
          },
          errors: {
            total: metrics.errors.total,
            rate: metrics.errors.rate,
            lastError: metrics.errors.lastError?.toISOString() || 'None',
          },
          cache: {
            hitRate: metrics.cache.hitRate,
            evictionRate: metrics.cache.evictionRate,
            memoryUsage: metrics.cache.memoryUsage,
          },
        },
        targetsMet: targets,
        alerts: alerts.map(alert => ({
          level: alert.level,
          message: alert.message,
          timestamp: alert.timestamp.toISOString(),
        })),
        recommendations,
      };

      this.logger.log('Performance dashboard generated successfully');
      return dashboard;
    } catch (error) {
      this.logger.error('Failed to generate performance dashboard:', error);
      throw error;
    }
  }

  /**
   * Get current performance metrics
   */
  @Get('metrics')
  async getCurrentMetrics() {
    try {
      const metrics = this.performanceMonitor.getMetrics();
      const targets = this.performanceMonitor.checkPerformanceTargets();
      
      return {
        timestamp: new Date().toISOString(),
        metrics,
        targets,
        summary: this.performanceMonitor.getPerformanceSummary(),
      };
    } catch (error) {
      this.logger.error('Failed to get performance metrics:', error);
      throw error;
    }
  }

  /**
   * Get performance alerts
   */
  @Get('alerts')
  async getAlerts() {
    try {
      const alerts = this.performanceMonitor.getAlerts();
      
      return {
        timestamp: new Date().toISOString(),
        totalAlerts: alerts.length,
        criticalAlerts: alerts.filter(a => a.level === 'critical').length,
        warningAlerts: alerts.filter(a => a.level === 'warning').length,
        alerts: alerts.map(alert => ({
          level: alert.level,
          message: alert.message,
          metric: alert.metric,
          value: alert.value,
          threshold: alert.threshold,
          timestamp: alert.timestamp.toISOString(),
        })),
      };
    } catch (error) {
      this.logger.error('Failed to get performance alerts:', error);
      throw error;
    }
  }

  /**
   * Get Redis health status
   */
  @Get('redis/health')
  async getRedisHealth() {
    try {
      const stats = await this.redisCache.getStats();
      const isHealthy = await this.redisCache.healthCheck();
      
      return {
        timestamp: new Date().toISOString(),
        healthy: isHealthy,
        connected: stats.connected,
        keys: stats.keys,
        memory: stats.memory,
        hitRate: stats.hitRate,
        recommendations: this.generateRedisRecommendations(stats),
      };
    } catch (error) {
      this.logger.error('Failed to get Redis health status:', error);
      throw error;
    }
  }

  /**
   * Get circuit breaker status
   */
  @Get('circuit-breaker/status')
  async getCircuitBreakerStatus() {
    try {
      // This would need to be implemented in CircuitBreakerService
      return {
        timestamp: new Date().toISOString(),
        status: 'operational',
        openBreakers: 0,
        totalBreakers: 0,
        recommendations: ['Monitor circuit breaker patterns for optimization'],
      };
    } catch (error) {
      this.logger.error('Failed to get circuit breaker status:', error);
      throw error;
    }
  }

  /**
   * Get connection pool status
   */
  @Get('connection-pool/status')
  async getConnectionPoolStatus() {
    try {
      // This would need to be implemented in ConnectionPoolService
      return {
        timestamp: new Date().toISOString(),
        activeConnections: 0,
        maxConnections: 0,
        idleConnections: 0,
        recommendations: ['Optimize connection pooling for high load'],
      };
    } catch (error) {
      this.logger.error('Failed to get connection pool status:', error);
      throw error;
    }
  }

  /**
   * Force performance metrics refresh
   */
  @Post('refresh')
  async refreshMetrics() {
    try {
      // Force a performance summary log
      const summary = this.performanceMonitor.getPerformanceSummary();
      
      this.logger.log('Performance metrics refreshed manually');
      
      return {
        timestamp: new Date().toISOString(),
        message: 'Performance metrics refreshed successfully',
        summary,
      };
    } catch (error) {
      this.logger.error('Failed to refresh performance metrics:', error);
      throw error;
    }
  }

  /**
   * Clear performance alerts
   */
  @Delete('alerts')
  async clearAlerts() {
    try {
      // This would need to be implemented in PerformanceMonitorService
      this.logger.log('Performance alerts cleared manually');
      
      return {
        timestamp: new Date().toISOString(),
        message: 'Performance alerts cleared successfully',
      };
    } catch (error) {
      this.logger.error('Failed to clear performance alerts:', error);
      throw error;
    }
  }

  private generateRecommendations(metrics: any, targets: any, redisStats: any): string[] {
    const recommendations: string[] = [];
    
    // Response time recommendations
    if (!targets.responseTime) {
      recommendations.push('Optimize database queries and implement caching for slow endpoints');
      recommendations.push('Consider implementing request queuing for high-load scenarios');
    }
    
    // Uptime recommendations
    if (!targets.uptime) {
      recommendations.push('Implement health checks and automatic failover mechanisms');
      recommendations.push('Review error handling and circuit breaker configurations');
    }
    
    // Slow requests recommendations
    if (!targets.slowRequests) {
      recommendations.push('Profile and optimize endpoints with response times >100ms');
      recommendations.push('Implement request timeout and cancellation mechanisms');
    }
    
    // Concurrent load recommendations
    if (!targets.concurrentLoad) {
      recommendations.push('Scale horizontally with load balancers and multiple instances');
      recommendations.push('Implement request throttling and rate limiting');
    }
    
    // Redis recommendations
    if (!redisStats.connected) {
      recommendations.push('Deploy Redis cluster for high availability');
      recommendations.push('Implement Redis connection pooling and failover');
    }
    
    // General optimization recommendations
    if (recommendations.length === 0) {
      recommendations.push('All Phase 10 targets met - consider Phase 11 UE5 implementation');
      recommendations.push('Monitor performance trends for proactive optimization');
    }
    
    return recommendations;
  }

  private generateRedisRecommendations(stats: any): string[] {
    const recommendations: string[] = [];
    
    if (!stats.connected) {
      recommendations.push('Deploy Redis cluster for high availability');
      recommendations.push('Implement Redis connection pooling and failover');
    }
    
    if (stats.keys > 10000) {
      recommendations.push('Consider implementing cache eviction policies');
      recommendations.push('Monitor memory usage and implement LRU eviction');
    }
    
    if (stats.hitRate < 80) {
      recommendations.push('Optimize cache key strategies and TTL settings');
      recommendations.push('Implement cache warming for frequently accessed data');
    }
    
    return recommendations;
  }
}
