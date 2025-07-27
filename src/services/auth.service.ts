// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity.js';
import { Session } from '../entities/session.entity.js';
import { AuditLog } from '../entities/audit-log.entity.js';
import { RegisterDto, LoginDto, ChangePasswordDto, UpdateProfileDto } from '../dto/auth.dto.js';
import { checkIntent } from '../guards/synthient.guard.js';
import { ConfigService } from '@nestjs/config';
import { soulchain } from '../agents/soulchain/soulchain.ledger.js';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async register(registerDto: RegisterDto, ipAddress: string, userAgent: string): Promise<any> {
    try {
      if (!checkIntent(registerDto.username + registerDto.email + registerDto.password)) {
        await this.logSoulchainEvent('register_blocked', 'Zeroth violation: Registration blocked', {
          username: registerDto.username,
          email: registerDto.email,
          ipAddress,
          userAgent
        });
        throw new UnauthorizedException('Zeroth violation: Registration blocked.');
      }

      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: [
          { username: registerDto.username },
          { email: registerDto.email }
        ]
      });

      if (existingUser) {
        await this.logSoulchainEvent('register_failed', 'Username or email already exists', {
          username: registerDto.username,
          email: registerDto.email,
          ipAddress,
          userAgent
        });
        throw new ConflictException('Username or email already exists');
      }

      // Create new user
      const user = this.userRepository.create({
        ...registerDto,
        roles: ['user'],
        preferences: {}
      });

      const savedUser = await this.userRepository.save(user);

      // Log registration to audit log
      await this.logAuditEvent(
        savedUser.id,
        'register',
        'auth',
        ipAddress,
        userAgent,
        { success: true }
      );

      // Log to Soulchain
      await this.logSoulchainEvent('register_success', 'User registered successfully', {
        userId: savedUser.id,
        username: savedUser.username,
        email: savedUser.email,
        ipAddress,
        userAgent
      });

      // Generate tokens
      const tokens = await this.generateTokens(savedUser);

      return {
        success: true,
        user: savedUser.toJSON(),
        ...tokens,
        message: 'User registered successfully'
      };
    } catch (error) {
      this.logger.error(`Registration error: ${error.message}`, error.stack);
      await this.logSoulchainEvent('register_error', error.message, {
        username: registerDto.username,
        email: registerDto.email,
        ipAddress,
        userAgent
      });
      throw error;
    }
  }

  async login(loginDto: LoginDto, ipAddress: string, userAgent: string): Promise<any> {
    try {
      if (!checkIntent(loginDto.username + loginDto.password)) {
        await this.logSoulchainEvent('login_blocked', 'Zeroth violation: Login blocked', {
          username: loginDto.username,
          ipAddress,
          userAgent
        });
        throw new UnauthorizedException('Zeroth violation: Login blocked.');
      }

      // Find user by username or email
      const user = await this.userRepository.findOne({
        where: [
          { username: loginDto.username },
          { email: loginDto.username }
        ]
      });

      if (!user || !user.isActive) {
        await this.logSoulchainEvent('login_failed', 'Invalid credentials - user not found or inactive', {
          username: loginDto.username,
          ipAddress,
          userAgent
        });
        await this.logAuditEvent(
          null,
          'login',
          'auth',
          ipAddress,
          userAgent,
          { success: false, reason: 'invalid_credentials' }
        );
        throw new UnauthorizedException('Invalid credentials');
      }

      // Validate password
      const isValidPassword = await user.validatePassword(loginDto.password);
      if (!isValidPassword) {
        await this.logSoulchainEvent('login_failed', 'Invalid password', {
          userId: user.id,
          username: user.username,
          ipAddress,
          userAgent
        });
        await this.logAuditEvent(
          user.id,
          'login',
          'auth',
          ipAddress,
          userAgent,
          { success: false, reason: 'invalid_password' }
        );
        throw new UnauthorizedException('Invalid credentials');
      }

      // Update last login
      user.lastLoginAt = new Date();
      await this.userRepository.save(user);

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Create session
      await this.createSession(user.id, tokens.refreshToken, ipAddress, userAgent);

      // Log successful login
      await this.logSoulchainEvent('login_success', 'Login successful', {
        userId: user.id,
        username: user.username,
        email: user.email,
        ipAddress,
        userAgent
      });
      await this.logAuditEvent(
        user.id,
        'login',
        'auth',
        ipAddress,
        userAgent,
        { success: true }
      );

      return {
        success: true,
        user: user.toJSON(),
        ...tokens,
        message: 'Login successful'
      };
    } catch (error) {
      this.logger.error(`Login error: ${error.message}`, error.stack);
      await this.logSoulchainEvent('login_error', error.message, {
        username: loginDto.username,
        ipAddress,
        userAgent
      });
      throw error;
    }
  }

  async logout(userId: string, refreshToken: string, ipAddress: string): Promise<any> {
    // Invalidate session
    await this.sessionRepository.update(
      { token: refreshToken, userId },
      { isActive: false }
    );

    // Log logout
    await this.logAuditEvent(
      userId,
      'logout',
      'auth',
      ipAddress,
      null,
      { success: true }
    );

    return {
      success: true,
      message: 'Logout successful'
    };
  }

  async refreshToken(refreshToken: string, ipAddress: string): Promise<any> {
    const session = await this.sessionRepository.findOne({
      where: { token: refreshToken, isActive: true },
      relations: ['user']
    });

    if (!session || session.isExpired()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Update session last used
    session.lastUsedAt = new Date();
    await this.sessionRepository.save(session);

    // Generate new tokens
    const tokens = await this.generateTokens(session.user);

    return {
      success: true,
      ...tokens,
      message: 'Token refreshed successfully'
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto, ipAddress: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate current password
    const isValidPassword = await user.validatePassword(changePasswordDto.currentPassword);
    if (!isValidPassword) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Update password
    user.password = changePasswordDto.newPassword;
    await this.userRepository.save(user);

    // Invalidate all sessions
    await this.sessionRepository.update(
      { userId },
      { isActive: false }
    );

    // Log password change
    await this.logAuditEvent(
      userId,
      'change_password',
      'auth',
      ipAddress,
      null,
      { success: true }
    );

    return {
      success: true,
      message: 'Password changed successfully'
    };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto, ipAddress: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is already taken
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateProfileDto.email }
      });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    // Update user
    Object.assign(user, updateProfileDto);
    await this.userRepository.save(user);

    // Log profile update
    await this.logAuditEvent(
      userId,
      'update_profile',
      'auth',
      ipAddress,
      null,
      { success: true, updatedFields: Object.keys(updateProfileDto) }
    );

    return {
      success: true,
      user: user.toJSON(),
      message: 'Profile updated successfully'
    };
  }

  async getUserProfile(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      user: user.toJSON()
    };
  }

  async getActiveSessions(userId: string): Promise<any> {
    const sessions = await this.sessionRepository.find({
      where: { userId, isActive: true },
      order: { lastUsedAt: 'DESC' }
    });

    return {
      success: true,
      sessions: sessions.map(session => session.toJSON())
    };
  }

  async revokeSession(userId: string, sessionId: string, ipAddress: string): Promise<any> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, userId }
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    session.isActive = false;
    await this.sessionRepository.save(session);

    // Log session revocation
    await this.logAuditEvent(
      userId,
      'revoke_session',
      'auth',
      ipAddress,
      null,
      { success: true, sessionId }
    );

    return {
      success: true,
      message: 'Session revoked successfully'
    };
  }

  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m'
    });

    const refreshToken = crypto.randomBytes(64).toString('hex');

    return {
      accessToken,
      refreshToken
    };
  }

  private async createSession(userId: string, refreshToken: string, ipAddress: string, userAgent: string): Promise<void> {
    const session = this.sessionRepository.create({
      userId,
      token: refreshToken,
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    await this.sessionRepository.save(session);
  }

  private async logAuditEvent(
    userId: string | null,
    action: string,
    resource: string,
    ipAddress: string,
    userAgent: string | null,
    details: any
  ): Promise<void> {
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

  private async logSoulchainEvent(action: string, reason: string, context: any): Promise<void> {
    try {
      const agentId = context.userId || context.username || 'anonymous';
      const amount = action.includes('success') ? 10 : action.includes('blocked') ? -20 : action.includes('failed') ? -10 : -5;

      await soulchain.addXPTransaction({
        agentId,
        amount,
        rationale: `Auth Service: ${action} - ${reason}`,
        timestamp: new Date().toISOString(),
        previousCid: null,
        tags: [
          {
            type: '#who',
            name: context.username || 'anonymous',
            did: context.userId ? `did:zeropoint:${context.userId}` : 'did:zeropoint:anonymous',
            handle: context.username ? `@${context.username}` : '@anonymous'
          },
          {
            type: '#intent',
            purpose: '#auth-service',
            validation: 'good-heart'
          },
          {
            type: '#thread',
            taskId: action,
            lineage: ['auth', 'service'],
            swarmLink: 'auth-service-swarm'
          },
          {
            type: '#layer',
            level: '#live'
          },
          {
            type: '#domain',
            field: 'security'
          }
        ]
      });
    } catch (error) {
      this.logger.error(`Failed to log auth event to Soulchain: ${error.message}`);
    }
  }

  async cleanupExpiredSessions(): Promise<void> {
    await this.sessionRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();
  }
} 