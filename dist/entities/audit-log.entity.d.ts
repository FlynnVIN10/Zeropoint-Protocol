import { User } from './user.entity.js';
export declare class AuditLog {
    id: string;
    userId: string;
    user: User;
    action: string;
    resource: string;
    resourceId: string;
    ipAddress: string;
    userAgent: string;
    details: Record<string, any>;
    level: 'info' | 'warning' | 'error' | 'critical';
    status: 'success' | 'failure' | 'pending';
    errorMessage: string;
    createdAt: Date;
    static createLoginLog(userId: string, ipAddress: string, userAgent: string, success: boolean): Partial<AuditLog>;
    static createLogoutLog(userId: string, ipAddress: string): Partial<AuditLog>;
    static createAPILog(userId: string, action: string, resource: string, ipAddress: string, details: any): Partial<AuditLog>;
}
