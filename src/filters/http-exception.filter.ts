import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { checkIntent } from '../guards/synthient.guard.js';
import { Counter, Histogram } from 'prom-client';

// Prometheus metrics for error tracking
const errorCounter = new Counter({
  name: 'http_errors_total',
  help: 'Total HTTP errors by status code and endpoint',
  labelNames: ['status_code', 'endpoint', 'method', 'error_type']
});

const errorDuration = new Histogram({
  name: 'http_error_duration_seconds',
  help: 'HTTP error response duration',
  labelNames: ['status_code', 'endpoint', 'method'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    const startTime = Date.now();
    
    // Determine status and message
    const status = this.getHttpStatus(exception);
    const message = this.getErrorMessage(exception);
    const errorType = this.getErrorType(exception);
    
    // Zeroth-gate error reporting
    if (!checkIntent('error-report')) {
      this.logger.warn(`Zeroth violation: Error reporting blocked for ${request.method} ${request.url}`);
      response.status(HttpStatus.FORBIDDEN).json({
        statusCode: HttpStatus.FORBIDDEN,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: 'Zeroth violation: Error reporting blocked.',
        error: 'FORBIDDEN'
      });
      return;
    }

    // Log error details
    this.logError(exception, request, status);

    // Record Prometheus metrics
    const duration = (Date.now() - startTime) / 1000;
    errorCounter.inc({
      status_code: status.toString(),
      endpoint: request.url,
      method: request.method,
      error_type: errorType
    });
    errorDuration.observe({
      status_code: status.toString(),
      endpoint: request.url,
      method: request.method
    }, duration);

    // Construct error response
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: this.sanitizeMessage(message),
      error: errorType,
      requestId: request.headers['x-request-id'] || this.generateRequestId(),
      ...(process.env.NODE_ENV === 'development' && {
        stack: exception instanceof Error ? exception.stack : undefined,
        details: this.getErrorDetails(exception)
      })
    };

    response.status(status).json(errorResponse);
  }

  private getHttpStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    
    // Handle specific error types
    if (exception instanceof Error) {
      const errorName = exception.name;
      switch (errorName) {
        case 'ValidationError':
          return HttpStatus.BAD_REQUEST;
        case 'UnauthorizedError':
          return HttpStatus.UNAUTHORIZED;
        case 'ForbiddenError':
          return HttpStatus.FORBIDDEN;
        case 'NotFoundError':
          return HttpStatus.NOT_FOUND;
        case 'ConflictError':
          return HttpStatus.CONFLICT;
        case 'TimeoutError':
          return HttpStatus.REQUEST_TIMEOUT;
        default:
          return HttpStatus.INTERNAL_SERVER_ERROR;
      }
    }
    
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getErrorMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'string') {
        return response;
      }
      if (typeof response === 'object' && response !== null) {
        return (response as any).message || exception.message;
      }
    }
    
    if (exception instanceof Error) {
      return exception.message;
    }
    
    return 'Internal server error';
  }

  private getErrorType(exception: unknown): string {
    if (exception instanceof HttpException) {
      return 'HTTP_EXCEPTION';
    }
    
    if (exception instanceof Error) {
      return exception.name || 'UNKNOWN_ERROR';
    }
    
    return 'UNKNOWN_ERROR';
  }

  private getErrorDetails(exception: unknown): any {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && response !== null) {
        return response;
      }
    }
    
    if (exception instanceof Error) {
      return {
        name: exception.name,
        message: exception.message,
        cause: (exception as any).cause
      };
    }
    
    return null;
  }

  private sanitizeMessage(message: string): string {
    // Remove sensitive information from error messages
    const sensitivePatterns = [
      /password['"]?\s*[:=]\s*['"][^'"]*['"]/gi,
      /token['"]?\s*[:=]\s*['"][^'"]*['"]/gi,
      /secret['"]?\s*[:=]\s*['"][^'"]*['"]/gi,
      /key['"]?\s*[:=]\s*['"][^'"]*['"]/gi
    ];
    
    let sanitized = message;
    sensitivePatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '$1: [REDACTED]');
    });
    
    return sanitized;
  }

  private logError(exception: unknown, request: Request, status: number): void {
    const logData = {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      status,
      userAgent: request.headers['user-agent'],
      ip: request.ip || request.connection.remoteAddress,
      userId: (request as any).user?.userId,
      errorType: this.getErrorType(exception),
      message: this.getErrorMessage(exception)
    };

    if (status >= 500) {
      this.logger.error('Server error occurred', logData);
    } else if (status >= 400) {
      this.logger.warn('Client error occurred', logData);
    } else {
      this.logger.log('Error occurred', logData);
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 