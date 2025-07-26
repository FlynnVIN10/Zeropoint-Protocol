var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity.js';
let AuditLog = class AuditLog {
    static createLoginLog(userId, ipAddress, userAgent, success) {
        return {
            userId,
            action: 'login',
            resource: 'auth',
            ipAddress,
            userAgent,
            level: success ? 'info' : 'warning',
            status: success ? 'success' : 'failure',
            details: { success }
        };
    }
    static createLogoutLog(userId, ipAddress) {
        return {
            userId,
            action: 'logout',
            resource: 'auth',
            ipAddress,
            level: 'info',
            status: 'success'
        };
    }
    static createAPILog(userId, action, resource, ipAddress, details) {
        return {
            userId,
            action,
            resource,
            ipAddress,
            level: 'info',
            status: 'success',
            details
        };
    }
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], AuditLog.prototype, "id", void 0);
__decorate([
    Column({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "userId", void 0);
__decorate([
    ManyToOne(() => User, { nullable: true }),
    JoinColumn({ name: 'userId' }),
    __metadata("design:type", User)
], AuditLog.prototype, "user", void 0);
__decorate([
    Column({ length: 100 }),
    __metadata("design:type", String)
], AuditLog.prototype, "action", void 0);
__decorate([
    Column({ length: 100, nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "resource", void 0);
__decorate([
    Column({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "resourceId", void 0);
__decorate([
    Column({ length: 45, nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "ipAddress", void 0);
__decorate([
    Column({ length: 500, nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "userAgent", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "details", void 0);
__decorate([
    Column({ length: 20, default: 'info' }),
    __metadata("design:type", String)
], AuditLog.prototype, "level", void 0);
__decorate([
    Column({ length: 50, default: 'success' }),
    __metadata("design:type", String)
], AuditLog.prototype, "status", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "errorMessage", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], AuditLog.prototype, "createdAt", void 0);
AuditLog = __decorate([
    Entity('audit_logs'),
    Index(['userId']),
    Index(['action']),
    Index(['createdAt']),
    Index(['ipAddress'])
], AuditLog);
export { AuditLog };
//# sourceMappingURL=audit-log.entity.js.map