// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

export const redisConfig = {
  // Redis connection settings
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0'),
  
  // Redis URL for connection
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // Cache settings
  ttl: parseInt(process.env.REDIS_TTL || '300'), // 5 minutes default
  
  // Connection pool settings
  maxConnections: parseInt(process.env.REDIS_MAX_CONNECTIONS || '10'),
  minConnections: parseInt(process.env.REDIS_MIN_CONNECTIONS || '2'),
  
  // Retry settings
  maxRetries: parseInt(process.env.REDIS_MAX_RETRIES || '3'),
  retryDelay: parseInt(process.env.REDIS_RETRY_DELAY || '1000'),
  
  // Health check settings
  healthCheckInterval: parseInt(process.env.REDIS_HEALTH_CHECK_INTERVAL || '30000'), // 30 seconds
  
  // Performance thresholds
  maxLatency: parseInt(process.env.REDIS_MAX_LATENCY || '50'), // 50ms
  maxEvictionRate: parseFloat(process.env.REDIS_MAX_EVICTION_RATE || '0.01'), // 1%
  
  // Circuit breaker settings
  circuitBreakerThreshold: parseInt(process.env.CIRCUIT_BREAKER_THRESHOLD || '5'),
  circuitBreakerTimeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT || '30000'), // 30 seconds
  
  // Scaling settings
  enableScaling: process.env.ENABLE_SCALING === 'true',
  maxAgents: parseInt(process.env.MAX_AGENTS || '1000'),
  maxConcurrency: parseInt(process.env.MAX_CONCURRENCY || '25'),
  maxRequestsPerSec: parseInt(process.env.MAX_REQUESTS_PER_SEC || '100'),
};

export const redisHealthCheckConfig = {
  // Health check thresholds
  maxLatency: redisConfig.maxLatency,
  maxEvictionRate: redisConfig.maxEvictionRate,
  
  // Alert thresholds
  alertLatency: redisConfig.maxLatency * 2, // Alert at 2x max latency
  alertEvictionRate: redisConfig.maxEvictionRate * 2, // Alert at 2x max eviction rate
  
  // Check intervals
  checkInterval: redisConfig.healthCheckInterval,
  alertCooldown: 60000, // 1 minute cooldown between alerts
};

export const performanceTargets = {
  // Phase 10 targets from CTO directive
  responseTime: {
    target: 100, // <100ms average response time
    warning: 150, // Warning at 150ms
    critical: 200, // Critical at 200ms
  },
  uptime: {
    target: 99.9, // 99.9% uptime
    warning: 99.5, // Warning at 99.5%
    critical: 99.0, // Critical at 99.0%
  },
  slowRequests: {
    target: 5, // <5% slow requests
    warning: 10, // Warning at 10%
    critical: 15, // Critical at 15%
  },
  concurrentLoad: {
    target: 1000, // Support 1000+ concurrent agents
    warning: 800, // Warning at 800
    critical: 600, // Critical at 600
  },
};
