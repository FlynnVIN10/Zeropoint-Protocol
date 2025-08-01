// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { Injectable, Logger } from '@nestjs/common';

export interface PerformanceMetrics {
  endpoint: string;
  responseTime: number;
  timestamp: Date;
  success: boolean;
  error?: string;
}

export interface OptimizationConfig {
  enableCaching: boolean;
  connectionPoolSize: number;
  batchSize: number;
  rateLimitPerMinute: number;
  cacheTTL: number;
}

@Injectable()
export class PerformanceOptimizerService {
  private readonly logger = new Logger(PerformanceOptimizerService.name);
  private metrics: PerformanceMetrics[] = [];
  private cache = new Map<string, { data: any; timestamp: number }>();
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;

  private config: OptimizationConfig = {
    enableCaching: true,
    connectionPoolSize: 10,
    batchSize: 50,
    rateLimitPerMinute: 1000,
    cacheTTL: 30000, // 30 seconds
  };

  /**
   * Record performance metrics for monitoring
   */
  recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // Keep only last 1000 metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Log performance issues
    if (metric.responseTime > 100) {
      this.logger.warn(`Slow response detected: ${metric.endpoint} - ${metric.responseTime}ms`);
    }

    if (!metric.success) {
      this.logger.error(`Request failed: ${metric.endpoint} - ${metric.error}`);
    }
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): {
    averageResponseTime: number;
    successRate: number;
    totalRequests: number;
    slowRequests: number;
  } {
    if (this.metrics.length === 0) {
      return {
        averageResponseTime: 0,
        successRate: 100,
        totalRequests: 0,
        slowRequests: 0,
      };
    }

    const totalRequests = this.metrics.length;
    const successfulRequests = this.metrics.filter(m => m.success).length;
    const slowRequests = this.metrics.filter(m => m.responseTime > 100).length;
    const averageResponseTime = this.metrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests;

    return {
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      successRate: Math.round((successfulRequests / totalRequests) * 100 * 100) / 100,
      totalRequests,
      slowRequests,
    };
  }

  /**
   * Cache management for frequently accessed data
   */
  getCachedData<T>(key: string): T | null {
    if (!this.config.enableCaching) return null;

    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.config.cacheTTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  setCachedData<T>(key: string, data: T): void {
    if (!this.config.enableCaching) return;

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });

    // Clean up old cache entries
    if (this.cache.size > 100) {
      const entries = Array.from(this.cache.entries());
      const sorted = entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toDelete = sorted.slice(0, 50);
      toDelete.forEach(([key]) => this.cache.delete(key));
    }
  }

  /**
   * Request queuing for high concurrency scenarios
   */
  async queueRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) return;

    this.isProcessingQueue = true;

    try {
      while (this.requestQueue.length > 0) {
        const batch = this.requestQueue.splice(0, this.config.batchSize);
        
        // Process batch concurrently
        await Promise.allSettled(batch.map(request => request()));
        
        // Small delay to prevent overwhelming the system
        if (this.requestQueue.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }

  /**
   * Update optimization configuration
   */
  updateConfig(newConfig: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger.log(`Performance config updated: ${JSON.stringify(newConfig)}`);
  }

  /**
   * Get current configuration
   */
  getConfig(): OptimizationConfig {
    return { ...this.config };
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
    this.logger.log('Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    hitRate: number;
    keys: string[];
  } {
    return {
      size: this.cache.size,
      hitRate: 0, // Would need to track hits/misses for accurate rate
      keys: Array.from(this.cache.keys()),
    };
  }
} 