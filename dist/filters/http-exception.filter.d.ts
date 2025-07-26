import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
export declare class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger;
    catch(exception: unknown, host: ArgumentsHost): void;
    private getHttpStatus;
    private getErrorMessage;
    private getErrorType;
    private getErrorDetails;
    private sanitizeMessage;
    private logError;
    private generateRequestId;
}
