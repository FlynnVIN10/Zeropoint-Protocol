import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
export declare class LoggingInterceptor implements NestInterceptor {
    private readonly logger;
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private logRequest;
    private logResponse;
    private logError;
    private recordMetrics;
    private getRequestSize;
    private getResponseSize;
    private sanitizeHeaders;
    private sanitizeBody;
    private getUserAgentCategory;
    private generateRequestId;
}
