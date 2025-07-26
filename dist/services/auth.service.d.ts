import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity.js';
import { Session } from '../entities/session.entity.js';
import { AuditLog } from '../entities/audit-log.entity.js';
import { RegisterDto, LoginDto, ChangePasswordDto, UpdateProfileDto } from '../dto/auth.dto.js';
import { ConfigService } from '@nestjs/config';
export declare class AuthService {
    private userRepository;
    private sessionRepository;
    private auditLogRepository;
    private jwtService;
    private configService;
    constructor(userRepository: Repository<User>, sessionRepository: Repository<Session>, auditLogRepository: Repository<AuditLog>, jwtService: JwtService, configService: ConfigService);
    register(registerDto: RegisterDto, ipAddress: string, userAgent: string): Promise<any>;
    login(loginDto: LoginDto, ipAddress: string, userAgent: string): Promise<any>;
    logout(userId: string, refreshToken: string, ipAddress: string): Promise<any>;
    refreshToken(refreshToken: string, ipAddress: string): Promise<any>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto, ipAddress: string): Promise<any>;
    updateProfile(userId: string, updateProfileDto: UpdateProfileDto, ipAddress: string): Promise<any>;
    getUserProfile(userId: string): Promise<any>;
    getActiveSessions(userId: string): Promise<any>;
    revokeSession(userId: string, sessionId: string, ipAddress: string): Promise<any>;
    private generateTokens;
    private createSession;
    private logAuditEvent;
    cleanupExpiredSessions(): Promise<void>;
}
