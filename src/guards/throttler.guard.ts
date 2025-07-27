// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { Counter, Histogram } from 'prom-client';

// Prometheus metrics for throttling
const throttleCounter = new Counter({
  name: 'throttle_requests_total',
  help: 'Total throttled requests',
  labelNames: ['ip', 'endpoint', 'method', 'reason']
});

const throttleDuration = new Histogram({
  name: 'throttle_duration_seconds',
  help: 'Throttle processing duration',
  labelNames: ['ip', 'endpoint'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1]
});

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    // Use IP address as the primary tracker
    const ip = this.getClientIp(req);
    
    // Add user ID if available for authenticated requests
    const userId = req.user?.userId;
    if (userId) {
      return Promise.resolve(`${ip}:${userId}`);
    }
    
    return Promise.resolve(ip);
  }

  protected getClientIp(req: Record<string, any>): string {
    // Check for forwarded headers (when behind proxy)
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }
    
    // Check for real IP header
    const realIp = req.headers['x-real-ip'];
    if (realIp) {
      return realIp;
    }
    
    // Fallback to connection remote address
    return req.ip || req.connection?.remoteAddress || 'unknown';
  }

  protected async handleRequest(
    requestProps: any,
  ): Promise<boolean> {
    const startTime = Date.now();
    const request = requestProps.request;
    const response = requestProps.response;
    
    const ip = this.getClientIp(request);
    const endpoint = request.url;
    const method = request.method;
    
    try {
      const result = await super.handleRequest(requestProps);
      
      const duration = (Date.now() - startTime) / 1000;
      throttleDuration.observe({ ip, endpoint }, duration);
      
      if (!result) {
        // Request was throttled
        throttleCounter.inc({
          ip,
          endpoint,
          method,
          reason: 'rate_limit_exceeded'
        });
        
        // Add rate limit headers
        response.header('X-RateLimit-Limit', requestProps.limit.toString());
        response.header('X-RateLimit-Remaining', '0');
        response.header('X-RateLimit-Reset', new Date(Date.now() + requestProps.ttl).toISOString());
        response.header('Retry-After', Math.ceil(requestProps.ttl / 1000).toString());
        
        // Log throttling event
        console.warn(`Rate limit exceeded for IP: ${ip}, Endpoint: ${endpoint}, Method: ${method}`);
      }
      
      return result;
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      throttleDuration.observe({ ip, endpoint }, duration);
      
      throttleCounter.inc({
        ip,
        endpoint,
        method,
        reason: 'throttle_error'
      });
      
      console.error(`Throttling error for IP: ${ip}, Endpoint: ${endpoint}`, error);
      return true; // Allow request on error
    }
  }

  protected getThrottleOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const endpoint = request.url;
    const method = request.method;
    
    // Different limits for different endpoints
    const endpointLimits: Record<string, { limit: number; ttl: number }> = {
      '/v1/auth/login': { limit: 5, ttl: 300000 }, // 5 attempts per 5 minutes
      '/v1/auth/register': { limit: 3, ttl: 600000 }, // 3 attempts per 10 minutes
      '/v1/auth/forgot-password': { limit: 3, ttl: 600000 }, // 3 attempts per 10 minutes
      '/v1/health': { limit: 100, ttl: 60000 }, // 100 requests per minute
      '/v1/metrics': { limit: 10, ttl: 60000 }, // 10 requests per minute
    };
    
    // Check for specific endpoint limits
    for (const [pattern, options] of Object.entries(endpointLimits)) {
      if (endpoint.startsWith(pattern)) {
        return options;
      }
    }
    
    // Default limits based on method
    const methodLimits: Record<string, { limit: number; ttl: number }> = {
      GET: { limit: 100, ttl: 60000 }, // 100 GET requests per minute
      POST: { limit: 20, ttl: 60000 }, // 20 POST requests per minute
      PUT: { limit: 20, ttl: 60000 }, // 20 PUT requests per minute
      DELETE: { limit: 10, ttl: 60000 }, // 10 DELETE requests per minute
      PATCH: { limit: 20, ttl: 60000 }, // 20 PATCH requests per minute
    };
    
    return methodLimits[method] || { limit: 20, ttl: 60000 };
  }

  protected async getThrottleLimit(context: ExecutionContext): Promise<number> {
    const options = this.getThrottleOptions(context);
    return options.limit;
  }

  protected async getThrottleTTL(context: ExecutionContext): Promise<number> {
    const options = this.getThrottleOptions(context);
    return options.ttl;
  }

  protected async handleThrottling(
    context: ExecutionContext,
    limit: number,
    ttl: number,
  ): Promise<void> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    
    const ip = this.getClientIp(request);
    const endpoint = request.url;
    const method = request.method;
    
    // Log throttling event
    console.warn(`Request throttled - IP: ${ip}, Endpoint: ${endpoint}, Method: ${method}, Limit: ${limit}, TTL: ${ttl}ms`);
    
    // Increment throttle counter
    throttleCounter.inc({
      ip,
      endpoint,
      method,
      reason: 'throttled'
    });
    
    // Set rate limit headers
    response.header('X-RateLimit-Limit', limit.toString());
    response.header('X-RateLimit-Remaining', '0');
    response.header('X-RateLimit-Reset', new Date(Date.now() + ttl).toISOString());
    response.header('Retry-After', Math.ceil(ttl / 1000).toString());
    
    // Return 429 Too Many Requests
    response.status(429).json({
      statusCode: 429,
      message: 'Too Many Requests',
      error: 'ThrottlerException',
      timestamp: new Date().toISOString(),
      retryAfter: Math.ceil(ttl / 1000),
      limit,
      ttl
    });
  }
} 