import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import * as crypto from 'crypto';

interface SecurityEvent {
  id: string;
  timestamp: Date;
  action: string;
  ip: string;
  userAgent: string;
  method: string;
  url: string;
  statusCode?: number;
  error?: string;
  metadata: any;
  soulchainHash: string;
}

@Injectable()
export class SecurityLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SecurityLoggingInterceptor.name);
  private readonly securityEvents: SecurityEvent[] = [];

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const startTime = Date.now();

    // Create security event
    const securityEvent: SecurityEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      action: this.determineAction(request),
      ip: this.getClientIp(request),
      userAgent: request.headers['user-agent'] || 'unknown',
      method: request.method,
      url: request.url,
      metadata: {
        headers: this.sanitizeHeaders(request.headers),
        body: this.sanitizeBody(request.body),
        query: request.query,
        params: request.params,
        startTime,
      },
      soulchainHash: '',
    };

    return next.handle().pipe(
      tap((data) => {
        // Log successful request
        securityEvent.statusCode = response.statusCode;
        securityEvent.metadata.responseTime = Date.now() - startTime;
        securityEvent.soulchainHash = this.generateSoulchainHash(securityEvent);
        
        this.logSecurityEvent(securityEvent);
        this.logToSoulchain('REQUEST_SUCCESS', securityEvent);
      }),
      catchError((error) => {
        // Log failed request
        securityEvent.statusCode = error.status || 500;
        securityEvent.error = error.message;
        securityEvent.metadata.responseTime = Date.now() - startTime;
        securityEvent.soulchainHash = this.generateSoulchainHash(securityEvent);
        
        this.logSecurityEvent(securityEvent);
        this.logToSoulchain('REQUEST_FAILED', securityEvent);
        
        throw error;
      }),
    );
  }

  private determineAction(request: Request): string {
    const url = request.url;
    const method = request.method;

    // Authentication endpoints
    if (url.includes('/auth/login') || url.includes('/auth/register')) {
      return 'AUTH_ATTEMPT';
    }

    // Protected endpoints
    if (url.includes('/v1/advanced/') || url.includes('/v1/agent/')) {
      return 'PROTECTED_ACCESS';
    }

    // Health check
    if (url.includes('/health')) {
      return 'HEALTH_CHECK';
    }

    // API endpoints
    if (url.startsWith('/v1/')) {
      return 'API_ACCESS';
    }

    return 'GENERAL_ACCESS';
  }

  private getClientIp(request: Request): string {
    return (
      request.headers['x-forwarded-for'] ||
      request.headers['x-real-ip'] ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      'unknown'
    ) as string;
  }

  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    
    // Remove sensitive headers
    delete sanitized.authorization;
    delete sanitized.cookie;
    delete sanitized['x-api-key'];
    
    return sanitized;
  }

  private sanitizeBody(body: any): any {
    if (!body) return null;
    
    const sanitized = { ...body };
    
    // Remove sensitive fields
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.secret;
    delete sanitized.key;
    
    return sanitized;
  }

  private generateSoulchainHash(event: SecurityEvent): string {
    const payload = {
      action: event.action,
      timestamp: event.timestamp.toISOString(),
      ip: event.ip,
      method: event.method,
      url: event.url,
      statusCode: event.statusCode,
      environment: process.env.NODE_ENV || 'development',
    };

    return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  }

  private logSecurityEvent(event: SecurityEvent): void {
    this.securityEvents.push(event);
    
    // Keep only last 1000 events
    if (this.securityEvents.length > 1000) {
      this.securityEvents.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      this.logger.log(`Security Event: ${event.action} - ${event.ip} - ${event.statusCode || 'pending'}`);
    }
  }

  private async logToSoulchain(action: string, event: SecurityEvent): Promise<void> {
    try {
      const soulchainPayload = {
        hashId: event.soulchainHash,
        action: `SOULSEC:${action}`,
        metadata: {
          service: 'security-logging',
          environment: process.env.NODE_ENV || 'development',
          version: process.env.APP_VERSION || '1.0.0',
          interceptor: 'SecurityLoggingInterceptor',
        },
        data: JSON.stringify({
          eventId: event.id,
          action: event.action,
          ip: event.ip,
          method: event.method,
          url: event.url,
          statusCode: event.statusCode,
          error: event.error,
          timestamp: event.timestamp,
        }),
        timestamp: new Date(),
        environment: process.env.NODE_ENV || 'development',
      };

      // In a real implementation, this would send to soulchain
      this.logger.log(`SOULSEC:LOG ${action} - ${soulchainPayload.hashId}`);
    } catch (error) {
      this.logger.error('Failed to log to soulchain', error);
    }
  }

  // Public methods for monitoring
  getSecurityEvents(): SecurityEvent[] {
    return this.securityEvents.slice(-100); // Last 100 events
  }

  getSecurityStats(): any {
    const events = this.securityEvents;
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return {
      totalEvents: events.length,
      eventsLastHour: events.filter(e => e.timestamp >= oneHourAgo).length,
      eventsLastDay: events.filter(e => e.timestamp >= oneDayAgo).length,
      failedRequests: events.filter(e => e.statusCode && e.statusCode >= 400).length,
      authAttempts: events.filter(e => e.action === 'AUTH_ATTEMPT').length,
      protectedAccess: events.filter(e => e.action === 'PROTECTED_ACCESS').length,
      uniqueIPs: new Set(events.map(e => e.ip)).size,
    };
  }
}