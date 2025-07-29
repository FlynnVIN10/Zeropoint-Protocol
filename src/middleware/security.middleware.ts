import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

interface IPAttempt {
  ip: string;
  attempts: number;
  firstAttempt: Date;
  lastAttempt: Date;
  isLocked: boolean;
  lockExpiry?: Date;
}

interface SecurityMetrics {
  totalRequests: number;
  blockedRequests: number;
  lockedIPs: number;
  rateLimitHits: number;
  lastUpdated: Date;
}

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityMiddleware.name);
  private readonly attemptsFile = path.join(process.cwd(), 'data', 'security-attempts.json');
  private readonly metricsFile = path.join(process.cwd(), 'data', 'security-metrics.json');
  private ipAttempts: Map<string, IPAttempt> = new Map();
  private metrics: SecurityMetrics = {
    totalRequests: 0,
    blockedRequests: 0,
    lockedIPs: 0,
    rateLimitHits: 0,
    lastUpdated: new Date(),
  };

  constructor() {
    this.loadAttempts();
    this.loadMetrics();
    this.startCleanupInterval();
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const clientIP = this.getClientIP(req);
    const now = new Date();

    // Update metrics
    this.metrics.totalRequests++;
    this.metrics.lastUpdated = now;

    // Check if IP is locked
    const ipAttempt = this.ipAttempts.get(clientIP);
    if (ipAttempt && ipAttempt.isLocked && ipAttempt.lockExpiry && ipAttempt.lockExpiry > now) {
      this.metrics.blockedRequests++;
      this.saveMetrics();
      
      this.logToSoulchain('IP_LOCKED', {
        ip: clientIP,
        reason: 'too_many_failed_attempts',
        lockExpiry: ipAttempt.lockExpiry,
        userAgent: req.headers['user-agent'],
        url: req.url,
      });

      return res.status(429).json({
        error: 'Too many failed attempts',
        message: 'IP address temporarily locked',
        retryAfter: Math.ceil((ipAttempt.lockExpiry.getTime() - now.getTime()) / 1000),
      });
    }

    // Check rate limiting
    if (this.isRateLimited(clientIP, req.url)) {
      this.metrics.rateLimitHits++;
      this.saveMetrics();
      
      this.logToSoulchain('RATE_LIMITED', {
        ip: clientIP,
        url: req.url,
        userAgent: req.headers['user-agent'],
        method: req.method,
      });

      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests from this IP',
        retryAfter: 60,
      });
    }

    // Track failed attempts for sensitive endpoints
    if (this.isSensitiveEndpoint(req.url)) {
      this.trackAttempt(clientIP, req);
    }

    // Add security headers
    this.addSecurityHeaders(res);

    next();
  }

  private getClientIP(req: Request): string {
    return (
      req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      'unknown'
    ) as string;
  }

  private isSensitiveEndpoint(url: string): boolean {
    const sensitivePatterns = [
      '/auth/login',
      '/auth/register',
      '/v1/advanced/',
      '/v1/agent/',
      '/admin/',
    ];

    return sensitivePatterns.some(pattern => url.includes(pattern));
  }

  private isRateLimited(ip: string, url: string): boolean {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = this.getRateLimitForEndpoint(url);

    // Get or create IP attempt record
    let ipAttempt = this.ipAttempts.get(ip);
    if (!ipAttempt) {
      ipAttempt = {
        ip,
        attempts: 0,
        firstAttempt: new Date(),
        lastAttempt: new Date(),
        isLocked: false,
      };
      this.ipAttempts.set(ip, ipAttempt);
    }

    // Check if we're in a new time window
    if (now - ipAttempt.lastAttempt.getTime() > windowMs) {
      ipAttempt.attempts = 1;
      ipAttempt.lastAttempt = new Date();
    } else {
      ipAttempt.attempts++;
      ipAttempt.lastAttempt = new Date();
    }

    return ipAttempt.attempts > maxRequests;
  }

  private getRateLimitForEndpoint(url: string): number {
    if (url.includes('/auth/')) {
      return 5; // 5 attempts per minute for auth
    }
    if (url.includes('/v1/advanced/')) {
      return 10; // 10 requests per minute for advanced endpoints
    }
    if (url.includes('/v1/agent/')) {
      return 20; // 20 requests per minute for agent endpoints
    }
    return 100; // 100 requests per minute for general endpoints
  }

  private trackAttempt(ip: string, req: Request): void {
    let ipAttempt = this.ipAttempts.get(ip);
    if (!ipAttempt) {
      ipAttempt = {
        ip,
        attempts: 0,
        firstAttempt: new Date(),
        lastAttempt: new Date(),
        isLocked: false,
      };
      this.ipAttempts.set(ip, ipAttempt);
    }

    // Increment attempts
    ipAttempt.attempts++;
    ipAttempt.lastAttempt = new Date();

    // Check if IP should be locked (5 failed attempts)
    if (ipAttempt.attempts >= 5 && !ipAttempt.isLocked) {
      ipAttempt.isLocked = true;
      ipAttempt.lockExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      this.metrics.lockedIPs++;

      this.logToSoulchain('IP_LOCKED', {
        ip,
        attempts: ipAttempt.attempts,
        lockExpiry: ipAttempt.lockExpiry,
        reason: 'failed_attempts_threshold',
        userAgent: req.headers['user-agent'],
        url: req.url,
      });

      this.logger.warn(`IP ${ip} locked due to ${ipAttempt.attempts} failed attempts`);
    }

    this.saveAttempts();
    this.saveMetrics();
  }

  private addSecurityHeaders(res: Response): void {
    // Content Security Policy
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:; frame-ancestors 'none';"
    );

    // XSS Protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Strict Transport Security
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions Policy
    res.setHeader(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=()'
    );
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupExpiredLocks();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  private cleanupExpiredLocks(): void {
    const now = new Date();
    let cleanedCount = 0;

    for (const [ip, attempt] of this.ipAttempts.entries()) {
      if (attempt.isLocked && attempt.lockExpiry && attempt.lockExpiry <= now) {
        attempt.isLocked = false;
        delete attempt.lockExpiry;
        attempt.attempts = 0;
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.metrics.lockedIPs -= cleanedCount;
      this.saveAttempts();
      this.saveMetrics();
      this.logger.log(`Cleaned up ${cleanedCount} expired IP locks`);
    }
  }

  private async logToSoulchain(action: string, data: any): Promise<void> {
    try {
      const soulchainPayload = {
        hashId: crypto.createHash('sha256').update(JSON.stringify({ action, data, timestamp: new Date() })).digest('hex'),
        action: `SOULSEC:${action}`,
        metadata: {
          service: 'security-middleware',
          environment: process.env.NODE_ENV || 'development',
          version: process.env.APP_VERSION || '1.0.0',
        },
        data: JSON.stringify(data),
        timestamp: new Date(),
        environment: process.env.NODE_ENV || 'development',
      };

      // In a real implementation, this would send to soulchain
      this.logger.log(`SOULSEC:LOG ${action} - ${soulchainPayload.hashId}`);
    } catch (error) {
      this.logger.error('Failed to log to soulchain', error);
    }
  }

  private loadAttempts(): void {
    try {
      if (fs.existsSync(this.attemptsFile)) {
        const data = JSON.parse(fs.readFileSync(this.attemptsFile, 'utf8'));
        this.ipAttempts = new Map(Object.entries(data).map(([ip, attempt]) => [
          ip,
          { ...attempt, firstAttempt: new Date(attempt.firstAttempt), lastAttempt: new Date(attempt.lastAttempt), lockExpiry: attempt.lockExpiry ? new Date(attempt.lockExpiry) : undefined }
        ]));
      }
    } catch (error) {
      this.logger.error('Failed to load IP attempts', error);
    }
  }

  private saveAttempts(): void {
    try {
      const data = Object.fromEntries(this.ipAttempts);
      fs.writeFileSync(this.attemptsFile, JSON.stringify(data, null, 2));
    } catch (error) {
      this.logger.error('Failed to save IP attempts', error);
    }
  }

  private loadMetrics(): void {
    try {
      if (fs.existsSync(this.metricsFile)) {
        this.metrics = JSON.parse(fs.readFileSync(this.metricsFile, 'utf8'));
        this.metrics.lastUpdated = new Date(this.metrics.lastUpdated);
      }
    } catch (error) {
      this.logger.error('Failed to load security metrics', error);
    }
  }

  private saveMetrics(): void {
    try {
      fs.writeFileSync(this.metricsFile, JSON.stringify(this.metrics, null, 2));
    } catch (error) {
      this.logger.error('Failed to save security metrics', error);
    }
  }

  // Public methods for monitoring
  getSecurityMetrics(): SecurityMetrics {
    return { ...this.metrics };
  }

  getLockedIPs(): string[] {
    return Array.from(this.ipAttempts.entries())
      .filter(([_, attempt]) => attempt.isLocked)
      .map(([ip, _]) => ip);
  }

  unlockIP(ip: string): boolean {
    const attempt = this.ipAttempts.get(ip);
    if (attempt && attempt.isLocked) {
      attempt.isLocked = false;
      delete attempt.lockExpiry;
      attempt.attempts = 0;
      this.metrics.lockedIPs--;
      this.saveAttempts();
      this.saveMetrics();
      
      this.logToSoulchain('IP_UNLOCKED', { ip, reason: 'manual_unlock' });
      return true;
    }
    return false;
  }
}