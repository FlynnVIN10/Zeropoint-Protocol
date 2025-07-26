import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { Counter, Histogram } from 'prom-client';

// Prometheus metrics for request tracking
const requestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'endpoint', 'status_code', 'user_agent']
});

const requestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'endpoint', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const requestSize = new Histogram({
  name: 'http_request_size_bytes',
  help: 'HTTP request size in bytes',
  labelNames: ['method', 'endpoint'],
  buckets: [100, 1000, 10000, 100000, 1000000]
});

const responseSize = new Histogram({
  name: 'http_response_size_bytes',
  help: 'HTTP response size in bytes',
  labelNames: ['method', 'endpoint', 'status_code'],
  buckets: [100, 1000, 10000, 100000, 1000000]
});

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    // Add request ID to request object
    (request as any).requestId = requestId;

    // Log request details
    this.logRequest(request, requestId);

    // Record request size
    const requestSizeBytes = this.getRequestSize(request);
    requestSize.observe({
      method: request.method,
      endpoint: request.url
    }, requestSizeBytes);

    return next.handle().pipe(
      tap((data) => {
        const duration = (Date.now() - startTime) / 1000;
        const statusCode = response.statusCode;
        
        // Log successful response
        this.logResponse(request, response, duration, requestId, data);
        
        // Record metrics
        this.recordMetrics(request, statusCode, duration, data);
      }),
      catchError((error) => {
        const duration = (Date.now() - startTime) / 1000;
        const statusCode = error.status || 500;
        
        // Log error response
        this.logError(request, response, error, duration, requestId);
        
        // Record error metrics
        this.recordMetrics(request, statusCode, duration, null, error);
        
        throw error;
      })
    );
  }

  private logRequest(request: Request, requestId: string): void {
    const logData = {
      requestId,
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      ip: request.ip || request.connection.remoteAddress,
      userAgent: request.headers['user-agent'],
      userId: (request as any).user?.userId,
      headers: this.sanitizeHeaders(request.headers),
      body: this.sanitizeBody(request.body),
      query: request.query,
      params: request.params
    };

    this.logger.log(`Incoming request: ${request.method} ${request.url}`, logData);
  }

  private logResponse(request: Request, response: Response, duration: number, requestId: string, data: any): void {
    const logData = {
      requestId,
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      statusCode: response.statusCode,
      duration: `${duration.toFixed(3)}s`,
      userId: (request as any).user?.userId,
      responseSize: this.getResponseSize(data)
    };

    this.logger.log(`Response sent: ${request.method} ${request.url} - ${response.statusCode}`, logData);
  }

  private logError(request: Request, response: Response, error: any, duration: number, requestId: string): void {
    const logData = {
      requestId,
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      statusCode: error.status || 500,
      duration: `${duration.toFixed(3)}s`,
      userId: (request as any).user?.userId,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    };

    this.logger.error(`Request failed: ${request.method} ${request.url} - ${error.status || 500}`, logData);
  }

  private recordMetrics(request: Request, statusCode: number, duration: number, data?: any, error?: any): void {
    const labels = {
      method: request.method,
      endpoint: request.url,
      status_code: statusCode.toString(),
      user_agent: this.getUserAgentCategory(request.headers['user-agent'])
    };

    // Record request counter
    requestCounter.inc(labels);

    // Record request duration
    requestDuration.observe({
      method: request.method,
      endpoint: request.url,
      status_code: statusCode.toString()
    }, duration);

    // Record response size if data is available
    if (data) {
      const responseSizeBytes = this.getResponseSize(data);
      responseSize.observe({
        method: request.method,
        endpoint: request.url,
        status_code: statusCode.toString()
      }, responseSizeBytes);
    }
  }

  private getRequestSize(request: Request): number {
    let size = 0;
    
    // URL size
    size += request.url.length;
    
    // Headers size
    Object.entries(request.headers).forEach(([key, value]) => {
      size += key.length + (Array.isArray(value) ? value.join('').length : value?.length || 0);
    });
    
    // Body size
    if (request.body) {
      size += JSON.stringify(request.body).length;
    }
    
    return size;
  }

  private getResponseSize(data: any): number {
    if (!data) return 0;
    return JSON.stringify(data).length;
  }

  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];
    
    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;
    
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  private getUserAgentCategory(userAgent?: string): string {
    if (!userAgent) return 'unknown';
    
    if (userAgent.includes('Mozilla')) return 'browser';
    if (userAgent.includes('curl')) return 'curl';
    if (userAgent.includes('Postman')) return 'postman';
    if (userAgent.includes('Insomnia')) return 'insomnia';
    if (userAgent.includes('axios')) return 'axios';
    if (userAgent.includes('fetch')) return 'fetch';
    
    return 'other';
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 