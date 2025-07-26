var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AllExceptionsFilter_1;
import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { checkIntent } from '../guards/synthient.guard.js';
import { Counter, Histogram } from 'prom-client';
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
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    constructor() {
        this.logger = new Logger(AllExceptionsFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const startTime = Date.now();
        const status = this.getHttpStatus(exception);
        const message = this.getErrorMessage(exception);
        const errorType = this.getErrorType(exception);
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
        this.logError(exception, request, status);
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
    getHttpStatus(exception) {
        if (exception instanceof HttpException) {
            return exception.getStatus();
        }
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
    getErrorMessage(exception) {
        if (exception instanceof HttpException) {
            const response = exception.getResponse();
            if (typeof response === 'string') {
                return response;
            }
            if (typeof response === 'object' && response !== null) {
                return response.message || exception.message;
            }
        }
        if (exception instanceof Error) {
            return exception.message;
        }
        return 'Internal server error';
    }
    getErrorType(exception) {
        if (exception instanceof HttpException) {
            return 'HTTP_EXCEPTION';
        }
        if (exception instanceof Error) {
            return exception.name || 'UNKNOWN_ERROR';
        }
        return 'UNKNOWN_ERROR';
    }
    getErrorDetails(exception) {
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
                cause: exception.cause
            };
        }
        return null;
    }
    sanitizeMessage(message) {
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
    logError(exception, request, status) {
        var _a;
        const logData = {
            timestamp: new Date().toISOString(),
            method: request.method,
            url: request.url,
            status,
            userAgent: request.headers['user-agent'],
            ip: request.ip || request.connection.remoteAddress,
            userId: (_a = request.user) === null || _a === void 0 ? void 0 : _a.userId,
            errorType: this.getErrorType(exception),
            message: this.getErrorMessage(exception)
        };
        if (status >= 500) {
            this.logger.error('Server error occurred', logData);
        }
        else if (status >= 400) {
            this.logger.warn('Client error occurred', logData);
        }
        else {
            this.logger.log('Error occurred', logData);
        }
    }
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
};
AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    Catch()
], AllExceptionsFilter);
export { AllExceptionsFilter };
//# sourceMappingURL=http-exception.filter.js.map