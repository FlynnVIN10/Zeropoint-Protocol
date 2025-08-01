// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface PoolConfig {
  min: number;
  max: number;
  acquireTimeoutMillis: number;
  createTimeoutMillis: number;
  destroyTimeoutMillis: number;
  idleTimeoutMillis: number;
  reapIntervalMillis: number;
  createRetryIntervalMillis: number;
}

export interface PoolStats {
  total: number;
  idle: number;
  active: number;
  waiting: number;
}

@Injectable()
export class ConnectionPoolService {
  private readonly logger = new Logger(ConnectionPoolService.name);
  private pools: Map<string, any> = new Map();
  private config: PoolConfig;

  constructor(private configService: ConfigService) {
    this.config = {
      min: this.configService.get<number>('DB_POOL_MIN', 2),
      max: this.configService.get<number>('DB_POOL_MAX', 10),
      acquireTimeoutMillis: this.configService.get<number>('DB_POOL_ACQUIRE_TIMEOUT', 30000),
      createTimeoutMillis: this.configService.get<number>('DB_POOL_CREATE_TIMEOUT', 30000),
      destroyTimeoutMillis: this.configService.get<number>('DB_POOL_DESTROY_TIMEOUT', 5000),
      idleTimeoutMillis: this.configService.get<number>('DB_POOL_IDLE_TIMEOUT', 30000),
      reapIntervalMillis: this.configService.get<number>('DB_POOL_REAP_INTERVAL', 1000),
      createRetryIntervalMillis: this.configService.get<number>('DB_POOL_RETRY_INTERVAL', 200),
    };

    this.logger.log(`Connection pool service initialized with config: ${JSON.stringify(this.config)}`);
  }

  /**
   * Get or create a connection pool for a specific service
   */
  async getPool(serviceName: string): Promise<any> {
    if (this.pools.has(serviceName)) {
      return this.pools.get(serviceName);
    }

    // For now, we'll create a mock pool since TypeORM handles its own connection pooling
    // In a real implementation, this would create actual database connection pools
    const mockPool = this.createMockPool(serviceName);
    this.pools.set(serviceName, mockPool);
    
    this.logger.log(`Created connection pool for service: ${serviceName}`);
    return mockPool;
  }

  /**
   * Create a mock pool for demonstration purposes
   * In production, this would create actual database connection pools
   */
  private createMockPool(serviceName: string) {
    let activeConnections = 0;
    let totalConnections = 0;
    let waitingRequests = 0;

    return {
      name: serviceName,
      
      async acquire(): Promise<any> {
        waitingRequests++;
        
        // Simulate connection acquisition delay
        await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
        
        if (activeConnections >= this.config.max) {
          waitingRequests--;
          throw new Error('Connection pool exhausted');
        }

        activeConnections++;
        totalConnections++;
        waitingRequests--;

        this.logger.debug(`Connection acquired for ${serviceName}. Active: ${activeConnections}, Waiting: ${waitingRequests}`);

        // Return a mock connection
        return {
          id: `conn-${Date.now()}-${Math.random()}`,
          service: serviceName,
          release: () => {
            activeConnections--;
            this.logger.debug(`Connection released for ${serviceName}. Active: ${activeConnections}`);
          }
        };
      },

      async release(connection: any): Promise<void> {
        if (connection && connection.release) {
          connection.release();
        }
      },

      async destroy(): Promise<void> {
        activeConnections = 0;
        totalConnections = 0;
        waitingRequests = 0;
        this.logger.log(`Connection pool destroyed for service: ${serviceName}`);
      },

      getStats(): PoolStats {
        return {
          total: totalConnections,
          idle: Math.max(0, this.config.max - activeConnections),
          active: activeConnections,
          waiting: waitingRequests,
        };
      },

      config: this.config,
    };
  }

  /**
   * Get statistics for all pools
   */
  getAllPoolStats(): Record<string, PoolStats> {
    const stats: Record<string, PoolStats> = {};
    
    for (const [serviceName, pool] of this.pools.entries()) {
      stats[serviceName] = pool.getStats();
    }
    
    return stats;
  }

  /**
   * Get overall pool statistics
   */
  getOverallStats(): {
    totalPools: number;
    totalConnections: number;
    totalActive: number;
    totalIdle: number;
    totalWaiting: number;
  } {
    const allStats = this.getAllPoolStats();
    const totalPools = Object.keys(allStats).length;
    
    const totals = Object.values(allStats).reduce(
      (acc, stats) => ({
        totalConnections: acc.totalConnections + stats.total,
        totalActive: acc.totalActive + stats.active,
        totalIdle: acc.totalIdle + stats.idle,
        totalWaiting: acc.totalWaiting + stats.waiting,
      }),
      { totalConnections: 0, totalActive: 0, totalIdle: 0, totalWaiting: 0 }
    );

    return {
      totalPools,
      ...totals,
    };
  }

  /**
   * Health check for all pools
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    pools: Record<string, { healthy: boolean; error?: string }>;
  }> {
    const pools: Record<string, { healthy: boolean; error?: string }> = {};
    let overallHealthy = true;

    for (const [serviceName, pool] of this.pools.entries()) {
      try {
        const stats = pool.getStats();
        const healthy = stats.active <= pool.config.max && stats.waiting < 10;
        
        pools[serviceName] = { healthy };
        
        if (!healthy) {
          overallHealthy = false;
          pools[serviceName].error = `Pool exhausted: active=${stats.active}, waiting=${stats.waiting}`;
        }
      } catch (error) {
        overallHealthy = false;
        pools[serviceName] = { 
          healthy: false, 
          error: error.message 
        };
      }
    }

    return { healthy: overallHealthy, pools };
  }

  /**
   * Update pool configuration
   */
  updateConfig(newConfig: Partial<PoolConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger.log(`Connection pool config updated: ${JSON.stringify(newConfig)}`);
  }

  /**
   * Get current configuration
   */
  getConfig(): PoolConfig {
    return { ...this.config };
  }

  /**
   * Destroy all pools
   */
  async destroyAll(): Promise<void> {
    for (const [serviceName, pool] of this.pools.entries()) {
      try {
        await pool.destroy();
      } catch (error) {
        this.logger.error(`Error destroying pool ${serviceName}:`, error);
      }
    }
    
    this.pools.clear();
    this.logger.log('All connection pools destroyed');
  }
} 