// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

@Injectable()
export class RedisCacheService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheService.name);
  private redisClient: RedisClientType;
  private isConnected = false;
  private readonly defaultTTL = 300; // 5 minutes
  private readonly prefix = 'zeropoint:';

  constructor(private configService: ConfigService) {
    this.initializeRedis();
  }

  private async initializeRedis(): Promise<void> {
    try {
      const redisUrl = this.configService.get<string>('REDIS_URL', 'redis://localhost:6379');
      
      this.redisClient = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              this.logger.error('Redis connection failed after 10 retries');
              return false;
            }
            return Math.min(retries * 100, 3000);
          },
        },
      });

      this.redisClient.on('error', (err) => {
        this.logger.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.redisClient.on('connect', () => {
        this.logger.log('Redis connected successfully');
        this.isConnected = true;
      });

      this.redisClient.on('ready', () => {
        this.logger.log('Redis client ready');
        this.isConnected = true;
      });

      await this.redisClient.connect();
    } catch (error) {
      this.logger.warn('Redis connection failed, falling back to in-memory cache:', error.message);
      this.isConnected = false;
    }
  }

  /**
   * Get cached data by key
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) {
      this.logger.debug('Redis not connected, cache miss for key:', key);
      return null;
    }

    try {
      const fullKey = this.prefix + key;
      const data = await this.redisClient.get(fullKey);
      
      if (data) {
        this.logger.debug('Cache hit for key:', key);
        return JSON.parse(data) as T;
      }
      
      this.logger.debug('Cache miss for key:', key);
      return null;
    } catch (error) {
      this.logger.error('Redis get error:', error);
      return null;
    }
  }

  /**
   * Set cached data with TTL
   */
  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    if (!this.isConnected) {
      this.logger.debug('Redis not connected, skipping cache set for key:', key);
      return;
    }

    try {
      const fullKey = this.prefix + key;
      const ttl = options.ttl || this.defaultTTL;
      const serializedData = JSON.stringify(data);
      
      await this.redisClient.setEx(fullKey, ttl, serializedData);
      this.logger.debug('Cache set for key:', key, 'TTL:', ttl);
    } catch (error) {
      this.logger.error('Redis set error:', error);
    }
  }

  /**
   * Delete cached data by key
   */
  async delete(key: string): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      const fullKey = this.prefix + key;
      await this.redisClient.del(fullKey);
      this.logger.debug('Cache deleted for key:', key);
    } catch (error) {
      this.logger.error('Redis delete error:', error);
    }
  }

  /**
   * Clear all cached data with prefix
   */
  async clearAll(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      const keys = await this.redisClient.keys(this.prefix + '*');
      if (keys.length > 0) {
        await this.redisClient.del(keys);
        this.logger.log(`Cleared ${keys.length} cache entries`);
      }
    } catch (error) {
      this.logger.error('Redis clear all error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    connected: boolean;
    keys: number;
    memory: string;
    hitRate: number;
  }> {
    if (!this.isConnected) {
      return {
        connected: false,
        keys: 0,
        memory: '0B',
        hitRate: 0,
      };
    }

    try {
      const info = await this.redisClient.info('memory');
      const keys = await this.redisClient.dbSize();
      
      // Parse memory info
      const memoryMatch = info.match(/used_memory_human:(\S+)/);
      const memory = memoryMatch ? memoryMatch[1] : '0B';

      return {
        connected: true,
        keys,
        memory,
        hitRate: 0, // Would need to track hits/misses for accurate rate
      };
    } catch (error) {
      this.logger.error('Redis stats error:', error);
      return {
        connected: false,
        keys: 0,
        memory: '0B',
        hitRate: 0,
      };
    }
  }

  /**
   * Health check for Redis connection
   */
  async healthCheck(): Promise<boolean> {
    if (!this.isConnected) {
      return false;
    }

    try {
      await this.redisClient.ping();
      return true;
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return false;
    }
  }

  /**
   * Get connection status
   */
  isRedisConnected(): boolean {
    return this.isConnected;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redisClient && this.isConnected) {
      await this.redisClient.quit();
      this.logger.log('Redis connection closed');
    }
  }
} 