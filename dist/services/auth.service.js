var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity.js';
import { Session } from '../entities/session.entity.js';
import { AuditLog } from '../entities/audit-log.entity.js';
import { checkIntent } from '../guards/synthient.guard.js';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
let AuthService = class AuthService {
    constructor(userRepository, sessionRepository, auditLogRepository, jwtService, configService) {
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
        this.auditLogRepository = auditLogRepository;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async register(registerDto, ipAddress, userAgent) {
        if (!checkIntent(registerDto.username + registerDto.email + registerDto.password)) {
            throw new UnauthorizedException('Zeroth violation: Registration blocked.');
        }
        const existingUser = await this.userRepository.findOne({
            where: [
                { username: registerDto.username },
                { email: registerDto.email }
            ]
        });
        if (existingUser) {
            throw new ConflictException('Username or email already exists');
        }
        const user = this.userRepository.create({
            ...registerDto,
            roles: ['user'],
            preferences: {}
        });
        const savedUser = await this.userRepository.save(user);
        await this.logAuditEvent(savedUser.id, 'register', 'auth', ipAddress, userAgent, { success: true });
        const tokens = await this.generateTokens(savedUser);
        return {
            success: true,
            user: savedUser.toJSON(),
            ...tokens,
            message: 'User registered successfully'
        };
    }
    async login(loginDto, ipAddress, userAgent) {
        if (!checkIntent(loginDto.username + loginDto.password)) {
            throw new UnauthorizedException('Zeroth violation: Login blocked.');
        }
        const user = await this.userRepository.findOne({
            where: [
                { username: loginDto.username },
                { email: loginDto.username }
            ]
        });
        if (!user || !user.isActive) {
            await this.logAuditEvent(null, 'login', 'auth', ipAddress, userAgent, { success: false, reason: 'invalid_credentials' });
            throw new UnauthorizedException('Invalid credentials');
        }
        const isValidPassword = await user.validatePassword(loginDto.password);
        if (!isValidPassword) {
            await this.logAuditEvent(user.id, 'login', 'auth', ipAddress, userAgent, { success: false, reason: 'invalid_password' });
            throw new UnauthorizedException('Invalid credentials');
        }
        user.lastLoginAt = new Date();
        await this.userRepository.save(user);
        const tokens = await this.generateTokens(user);
        await this.createSession(user.id, tokens.refreshToken, ipAddress, userAgent);
        await this.logAuditEvent(user.id, 'login', 'auth', ipAddress, userAgent, { success: true });
        return {
            success: true,
            user: user.toJSON(),
            ...tokens,
            message: 'Login successful'
        };
    }
    async logout(userId, refreshToken, ipAddress) {
        await this.sessionRepository.update({ token: refreshToken, userId }, { isActive: false });
        await this.logAuditEvent(userId, 'logout', 'auth', ipAddress, null, { success: true });
        return {
            success: true,
            message: 'Logout successful'
        };
    }
    async refreshToken(refreshToken, ipAddress) {
        const session = await this.sessionRepository.findOne({
            where: { token: refreshToken, isActive: true },
            relations: ['user']
        });
        if (!session || session.isExpired()) {
            throw new UnauthorizedException('Invalid refresh token');
        }
        session.lastUsedAt = new Date();
        await this.sessionRepository.save(session);
        const tokens = await this.generateTokens(session.user);
        return {
            success: true,
            ...tokens,
            message: 'Token refreshed successfully'
        };
    }
    async changePassword(userId, changePasswordDto, ipAddress) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const isValidPassword = await user.validatePassword(changePasswordDto.currentPassword);
        if (!isValidPassword) {
            throw new BadRequestException('Current password is incorrect');
        }
        user.password = changePasswordDto.newPassword;
        await this.userRepository.save(user);
        await this.sessionRepository.update({ userId }, { isActive: false });
        await this.logAuditEvent(userId, 'change_password', 'auth', ipAddress, null, { success: true });
        return {
            success: true,
            message: 'Password changed successfully'
        };
    }
    async updateProfile(userId, updateProfileDto, ipAddress) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        if (updateProfileDto.email && updateProfileDto.email !== user.email) {
            const existingUser = await this.userRepository.findOne({
                where: { email: updateProfileDto.email }
            });
            if (existingUser) {
                throw new ConflictException('Email already exists');
            }
        }
        Object.assign(user, updateProfileDto);
        await this.userRepository.save(user);
        await this.logAuditEvent(userId, 'update_profile', 'auth', ipAddress, null, { success: true, updatedFields: Object.keys(updateProfileDto) });
        return {
            success: true,
            user: user.toJSON(),
            message: 'Profile updated successfully'
        };
    }
    async getUserProfile(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return {
            success: true,
            user: user.toJSON()
        };
    }
    async getActiveSessions(userId) {
        const sessions = await this.sessionRepository.find({
            where: { userId, isActive: true },
            order: { lastUsedAt: 'DESC' }
        });
        return {
            success: true,
            sessions: sessions.map(session => session.toJSON())
        };
    }
    async revokeSession(userId, sessionId, ipAddress) {
        const session = await this.sessionRepository.findOne({
            where: { id: sessionId, userId }
        });
        if (!session) {
            throw new NotFoundException('Session not found');
        }
        session.isActive = false;
        await this.sessionRepository.save(session);
        await this.logAuditEvent(userId, 'revoke_session', 'auth', ipAddress, null, { success: true, sessionId });
        return {
            success: true,
            message: 'Session revoked successfully'
        };
    }
    async generateTokens(user) {
        const payload = {
            sub: user.id,
            username: user.username,
            email: user.email,
            roles: user.roles
        };
        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_SECRET'),
            expiresIn: '15m'
        });
        const refreshToken = crypto.randomBytes(64).toString('hex');
        return {
            accessToken,
            refreshToken
        };
    }
    async createSession(userId, refreshToken, ipAddress, userAgent) {
        const session = this.sessionRepository.create({
            userId,
            token: refreshToken,
            ipAddress,
            userAgent,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });
        await this.sessionRepository.save(session);
    }
    async logAuditEvent(userId, action, resource, ipAddress, userAgent, details) {
        const auditLog = this.auditLogRepository.create({
            userId,
            action,
            resource,
            ipAddress,
            userAgent,
            details
        });
        await this.auditLogRepository.save(auditLog);
    }
    async cleanupExpiredSessions() {
        await this.sessionRepository
            .createQueryBuilder()
            .delete()
            .where('expiresAt < :now', { now: new Date() })
            .execute();
    }
};
AuthService = __decorate([
    Injectable(),
    __param(0, InjectRepository(User)),
    __param(1, InjectRepository(Session)),
    __param(2, InjectRepository(AuditLog)),
    __metadata("design:paramtypes", [Repository,
        Repository,
        Repository,
        JwtService,
        ConfigService])
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map