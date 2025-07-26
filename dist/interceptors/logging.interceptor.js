var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var LoggingInterceptor_1;
import { Injectable, Logger } from '@nestjs/common';
import { tap, catchError } from 'rxjs/operators';
import { Counter, Histogram } from 'prom-client';
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
let LoggingInterceptor = LoggingInterceptor_1 = class LoggingInterceptor {
    constructor() {
        this.logger = new Logger(LoggingInterceptor_1.name);
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const startTime = Date.now();
        const requestId = this.generateRequestId();
        request.requestId = requestId;
        this.logRequest(request, requestId);
        const requestSizeBytes = this.getRequestSize(request);
        requestSize.observe({
            method: request.method,
            endpoint: request.url
        }, requestSizeBytes);
        return next.handle().pipe(tap((data) => {
            const duration = (Date.now() - startTime) / 1000;
            const statusCode = response.statusCode;
            this.logResponse(request, response, duration, requestId, data);
            this.recordMetrics(request, statusCode, duration, data);
        }), catchError((error) => {
            const duration = (Date.now() - startTime) / 1000;
            const statusCode = error.status || 500;
            this.logError(request, response, error, duration, requestId);
            this.recordMetrics(request, statusCode, duration, null, error);
            throw error;
        }));
    }
    logRequest(request, requestId) {
        var _a;
        const logData = {
            requestId,
            timestamp: new Date().toISOString(),
            method: request.method,
            url: request.url,
            ip: request.ip || request.connection.remoteAddress,
            userAgent: request.headers['user-agent'],
            userId: (_a = request.user) === null || _a === void 0 ? void 0 : _a.userId,
            headers: this.sanitizeHeaders(request.headers),
            body: this.sanitizeBody(request.body),
            query: request.query,
            params: request.params
        };
        this.logger.log(`Incoming request: ${request.method} ${request.url}`, logData);
    }
    logResponse(request, response, duration, requestId, data) {
        var _a;
        const logData = {
            requestId,
            timestamp: new Date().toISOString(),
            method: request.method,
            url: request.url,
            statusCode: response.statusCode,
            duration: `${duration.toFixed(3)}s`,
            userId: (_a = request.user) === null || _a === void 0 ? void 0 : _a.userId,
            responseSize: this.getResponseSize(data)
        };
        this.logger.log(`Response sent: ${request.method} ${request.url} - ${response.statusCode}`, logData);
    }
    logError(request, response, error, duration, requestId) {
        var _a;
        const logData = {
            requestId,
            timestamp: new Date().toISOString(),
            method: request.method,
            url: request.url,
            statusCode: error.status || 500,
            duration: `${duration.toFixed(3)}s`,
            userId: (_a = request.user) === null || _a === void 0 ? void 0 : _a.userId,
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            }
        };
        this.logger.error(`Request failed: ${request.method} ${request.url} - ${error.status || 500}`, logData);
    }
    recordMetrics(request, statusCode, duration, data, error) {
        const labels = {
            method: request.method,
            endpoint: request.url,
            status_code: statusCode.toString(),
            user_agent: this.getUserAgentCategory(request.headers['user-agent'])
        };
        requestCounter.inc(labels);
        requestDuration.observe({
            method: request.method,
            endpoint: request.url,
            status_code: statusCode.toString()
        }, duration);
        if (data) {
            const responseSizeBytes = this.getResponseSize(data);
            responseSize.observe({
                method: request.method,
                endpoint: request.url,
                status_code: statusCode.toString()
            }, responseSizeBytes);
        }
    }
    getRequestSize(request) {
        let size = 0;
        size += request.url.length;
        Object.entries(request.headers).forEach(([key, value]) => {
            size += key.length + (Array.isArray(value) ? value.join('').length : (value === null || value === void 0 ? void 0 : value.length) || 0);
        });
        if (request.body) {
            size += JSON.stringify(request.body).length;
        }
        return size;
    }
    getResponseSize(data) {
        if (!data)
            return 0;
        return JSON.stringify(data).length;
    }
    sanitizeHeaders(headers) {
        const sanitized = { ...headers };
        const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];
        sensitiveHeaders.forEach(header => {
            if (sanitized[header]) {
                sanitized[header] = '[REDACTED]';
            }
        });
        return sanitized;
    }
    sanitizeBody(body) {
        if (!body)
            return body;
        const sanitized = { ...body };
        const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
        sensitiveFields.forEach(field => {
            if (sanitized[field]) {
                sanitized[field] = '[REDACTED]';
            }
        });
        return sanitized;
    }
    getUserAgentCategory(userAgent) {
        if (!userAgent)
            return 'unknown';
        if (userAgent.includes('Mozilla'))
            return 'browser';
        if (userAgent.includes('curl'))
            return 'curl';
        if (userAgent.includes('Postman'))
            return 'postman';
        if (userAgent.includes('Insomnia'))
            return 'insomnia';
        if (userAgent.includes('axios'))
            return 'axios';
        if (userAgent.includes('fetch'))
            return 'fetch';
        return 'other';
    }
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
};
LoggingInterceptor = LoggingInterceptor_1 = __decorate([
    Injectable()
], LoggingInterceptor);
export { LoggingInterceptor };
//# sourceMappingURL=logging.interceptor.js.map