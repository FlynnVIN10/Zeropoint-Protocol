// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import { PerformanceMonitorService } from "../services/performance-monitor.service.js";

@Injectable()
export class PerformanceMonitorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceMonitorInterceptor.name);

  constructor(private performanceMonitor: PerformanceMonitorService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    // Extract request information
    const method = request.method;
    const url = request.url;
    const userAgent = request.get("User-Agent") || "Unknown";
    const ip = request.ip || request.connection?.remoteAddress || "Unknown";

    this.logger.debug(`Request started: ${method} ${url} from ${ip}`);

    return next.handle().pipe(
      tap((data) => {
        const responseTime = Date.now() - startTime;

        // Record performance metrics
        this.performanceMonitor.recordRequest(responseTime);

        // Log successful request
        this.logger.debug(
          `Request completed: ${method} ${url} - ${responseTime}ms - Status: ${response.statusCode}`,
        );

        // Add performance headers
        response.set("X-Response-Time", `${responseTime}ms`);
        response.set("X-Performance-Target", "100ms");

        // Check if response time meets Phase 10 targets
        if (responseTime > 100) {
          this.logger.warn(
            `Slow request detected: ${method} ${url} - ${responseTime}ms (Target: <100ms)`,
          );
        }
      }),
      catchError((error) => {
        const responseTime = Date.now() - startTime;

        // Record error metrics
        this.performanceMonitor.recordError(
          error.constructor.name || "UnknownError",
          error,
        );

        // Log error with performance data
        this.logger.error(
          `Request failed: ${method} ${url} - ${responseTime}ms - Error: ${error.message}`,
          error.stack,
        );

        // Re-throw the error
        throw error;
      }),
    );
  }
}
