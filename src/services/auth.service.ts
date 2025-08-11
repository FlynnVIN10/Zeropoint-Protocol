// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity.js";
import { Session } from "../entities/session.entity.js";
import { AuditLog } from "../entities/audit-log.entity.js";
import {
  RegisterDto,
  LoginDto,
  ChangePasswordDto,
  UpdateProfileDto,
} from "../dto/auth.dto.js";
import { checkIntent } from "../guards/synthient.guard.js";
import { ConfigService } from "@nestjs/config";
import { soulchain } from "../agents/soulchain/soulchain.ledger.js";
import { v4 as uuidv4 } from "uuid";
import * as crypto from "crypto";
import { RedisCacheService } from "./redis-cache.service.js";
import { CircuitBreakerService } from "./circuit-breaker.service.js";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly userCache = new Map<
    string,
    { user: User; timestamp: number }
  >();
  private readonly sessionCache = new Map<
    string,
    { session: Session; timestamp: number }
  >();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly SESSION_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisCache: RedisCacheService,
    private circuitBreaker: CircuitBreakerService,
  ) {}

  async register(
    registerDto: RegisterDto,
    ipAddress: string,
    userAgent: string,
  ): Promise<any> {
    return this.circuitBreaker.execute("auth_register", async () => {
      try {
        if (
          !checkIntent(
            registerDto.username + registerDto.email + registerDto.password,
          )
        ) {
          await this.logSoulchainEvent(
            "register_blocked",
            "Zeroth violation: Registration blocked",
            {
              username: registerDto.username,
              email: registerDto.email,
              ipAddress,
              userAgent,
            },
          );
          throw new UnauthorizedException(
            "Zeroth violation: Registration blocked.",
          );
        }

        // Check if user already exists (with caching)
        const existingUser = await this.getUserByUsernameOrEmail(
          registerDto.username,
          registerDto.email,
        );

        if (existingUser) {
          await this.logSoulchainEvent(
            "register_failed",
            "Username or email already exists",
            {
              username: registerDto.username,
              email: registerDto.email,
              ipAddress,
              userAgent,
            },
          );
          throw new ConflictException("Username or email already exists");
        }

        // Create new user
        const user = this.userRepository.create({
          ...registerDto,
          roles: ["user"],
          preferences: {},
        });

        const savedUser = await this.userRepository.save(user);

        // Cache the new user
        this.cacheUser(savedUser);

        // Log to Soulchain
        await this.logSoulchainEvent(
          "register_success",
          "User registered successfully",
          {
            userId: savedUser.id,
            username: savedUser.username,
            email: savedUser.email,
            ipAddress,
            userAgent,
          },
        );

        // Generate tokens
        const tokens = await this.generateTokens(savedUser);

        return {
          success: true,
          user: savedUser.toJSON(),
          ...tokens,
          message: "User registered successfully",
        };
      } catch (error) {
        this.logger.error(`Registration failed: ${error.message}`);
        throw error;
      }
    });
  }

  async login(
    loginDto: LoginDto,
    ipAddress: string,
    userAgent: string,
  ): Promise<any> {
    return this.circuitBreaker.execute("auth_login", async () => {
      try {
        if (!checkIntent(loginDto.username + loginDto.password)) {
          await this.logSoulchainEvent(
            "login_blocked",
            "Zeroth violation: Login blocked",
            {
              username: loginDto.username,
              ipAddress,
              userAgent,
            },
          );
          throw new UnauthorizedException("Zeroth violation: Login blocked.");
        }

        // Get user from cache first, then database
        const user = await this.getUserByUsername(loginDto.username);

        if (!user) {
          await this.logSoulchainEvent("login_failed", "Invalid credentials", {
            username: loginDto.username,
            ipAddress,
            userAgent,
          });
          throw new UnauthorizedException("Invalid credentials");
        }

        // Validate password
        const isValidPassword = await user.validatePassword(loginDto.password);
        if (!isValidPassword) {
          await this.logSoulchainEvent("login_failed", "Invalid credentials", {
            username: loginDto.username,
            ipAddress,
            userAgent,
          });
          throw new UnauthorizedException("Invalid credentials");
        }

        // Generate tokens
        const tokens = await this.generateTokens(user);

        // Create session
        await this.createSession(
          user.id,
          tokens.refreshToken,
          ipAddress,
          userAgent,
        );

        // Log successful login
        await this.logSoulchainEvent(
          "login_success",
          "User logged in successfully",
          {
            userId: user.id,
            username: user.username,
            ipAddress,
            userAgent,
          },
        );

        return {
          success: true,
          user: user.toJSON(),
          ...tokens,
          message: "Login successful",
        };
      } catch (error) {
        this.logger.error(`Login failed: ${error.message}`);
        throw error;
      }
    });
  }

  async logout(
    userId: string,
    refreshToken: string,
    ipAddress: string,
  ): Promise<any> {
    return this.circuitBreaker.execute("auth_logout", async () => {
      try {
        // Remove session from cache and database
        await this.removeSession(userId, refreshToken);

        // Log logout
        await this.logSoulchainEvent(
          "logout_success",
          "User logged out successfully",
          {
            userId,
            ipAddress,
          },
        );

        return {
          success: true,
          message: "Logout successful",
        };
      } catch (error) {
        this.logger.error(`Logout failed: ${error.message}`);
        throw error;
      }
    });
  }

  async refreshToken(refreshToken: string, ipAddress: string): Promise<any> {
    return this.circuitBreaker.execute("auth_refresh", async () => {
      try {
        // Get session from cache first
        const session = await this.getSessionByToken(refreshToken);

        if (!session || session.expiresAt < new Date()) {
          throw new UnauthorizedException("Invalid or expired refresh token");
        }

        // Get user
        const user = await this.getUserById(session.userId);
        if (!user) {
          throw new UnauthorizedException("User not found");
        }

        // Generate new tokens
        const tokens = await this.generateTokens(user);

        // Update session
        await this.updateSession(session.id, tokens.refreshToken);

        return {
          success: true,
          ...tokens,
          message: "Token refreshed successfully",
        };
      } catch (error) {
        this.logger.error(`Token refresh failed: ${error.message}`);
        throw error;
      }
    });
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
    ipAddress: string,
  ): Promise<any> {
    return this.circuitBreaker.execute("auth_change_password", async () => {
      try {
        const user = await this.getUserById(userId);
        if (!user) {
          throw new NotFoundException("User not found");
        }

        // Validate current password
        const isValidPassword = await user.validatePassword(
          changePasswordDto.currentPassword,
        );
        if (!isValidPassword) {
          throw new UnauthorizedException("Current password is incorrect");
        }

        // Update password
        user.password = changePasswordDto.newPassword;
        await this.userRepository.save(user);

        // Clear user cache
        this.clearUserCache(userId);

        // Log password change
        await this.logSoulchainEvent(
          "password_changed",
          "Password changed successfully",
          {
            userId,
            ipAddress,
          },
        );

        return {
          success: true,
          message: "Password changed successfully",
        };
      } catch (error) {
        this.logger.error(`Password change failed: ${error.message}`);
        throw error;
      }
    });
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
    ipAddress: string,
  ): Promise<any> {
    return this.circuitBreaker.execute("auth_update_profile", async () => {
      try {
        const user = await this.getUserById(userId);
        if (!user) {
          throw new NotFoundException("User not found");
        }

        // Update user profile
        Object.assign(user, updateProfileDto);
        const updatedUser = await this.userRepository.save(user);

        // Update cache
        this.cacheUser(updatedUser);

        // Log profile update
        await this.logSoulchainEvent(
          "profile_updated",
          "Profile updated successfully",
          {
            userId,
            ipAddress,
          },
        );

        return {
          success: true,
          user: updatedUser.toJSON(),
          message: "Profile updated successfully",
        };
      } catch (error) {
        this.logger.error(`Profile update failed: ${error.message}`);
        throw error;
      }
    });
  }

  async getUserProfile(userId: string): Promise<any> {
    return this.circuitBreaker.execute("auth_get_profile", async () => {
      try {
        const user = await this.getUserById(userId);
        if (!user) {
          throw new NotFoundException("User not found");
        }

        return {
          success: true,
          user: user.toJSON(),
        };
      } catch (error) {
        this.logger.error(`Get profile failed: ${error.message}`);
        throw error;
      }
    });
  }

  async getActiveSessions(userId: string): Promise<any> {
    return this.circuitBreaker.execute("auth_get_sessions", async () => {
      try {
        const sessions = await this.sessionRepository
          .createQueryBuilder("session")
          .where("session.userId = :userId", { userId })
          .andWhere("session.expiresAt > :now", { now: new Date() })
          .orderBy("session.createdAt", "DESC")
          .getMany();

        return {
          success: true,
          sessions: sessions.map((session) => ({
            id: session.id,
            ipAddress: session.ipAddress,
            userAgent: session.userAgent,
            createdAt: session.createdAt,
            expiresAt: session.expiresAt,
          })),
        };
      } catch (error) {
        this.logger.error(`Get sessions failed: ${error.message}`);
        throw error;
      }
    });
  }

  async revokeSession(
    userId: string,
    sessionId: string,
    ipAddress: string,
  ): Promise<any> {
    return this.circuitBreaker.execute("auth_revoke_session", async () => {
      try {
        const session = await this.sessionRepository.findOne({
          where: { id: sessionId, userId },
        });

        if (!session) {
          throw new NotFoundException("Session not found");
        }

        await this.sessionRepository.remove(session);

        // Clear session cache
        this.sessionCache.delete(session.token);

        // Log session revocation
        await this.logSoulchainEvent(
          "session_revoked",
          "Session revoked successfully",
          {
            userId,
            sessionId,
            ipAddress,
          },
        );

        return {
          success: true,
          message: "Session revoked successfully",
        };
      } catch (error) {
        this.logger.error(`Revoke session failed: ${error.message}`);
        throw error;
      }
    });
  }

  // Optimized token generation with caching
  private async generateTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>("JWT_SECRET"),
      expiresIn: "15m",
    });

    const refreshToken = crypto.randomBytes(64).toString("hex");

    // Cache the refresh token for quick validation
    await this.redisCache.set(
      `refresh_token:${refreshToken}`,
      {
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      { ttl: 30 * 24 * 60 * 60 },
    ); // 30 days TTL

    return {
      accessToken,
      refreshToken,
    };
  }

  // Optimized session creation
  private async createSession(
    userId: string,
    refreshToken: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<void> {
    const session = this.sessionRepository.create({
      userId,
      token: refreshToken,
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    const savedSession = await this.sessionRepository.save(session);

    // Cache the session
    this.cacheSession(savedSession);
  }

  // Optimized user retrieval with caching
  private async getUserById(userId: string): Promise<User | null> {
    // Check cache first
    const cached = this.userCache.get(userId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.user;
    }

    // Get from database
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      this.cacheUser(user);
    }

    return user;
  }

  private async getUserByUsername(username: string): Promise<User | null> {
    // Check cache first
    for (const [userId, cached] of this.userCache.entries()) {
      if (
        cached.user.username === username &&
        Date.now() - cached.timestamp < this.CACHE_TTL
      ) {
        return cached.user;
      }
    }

    // Get from database
    const user = await this.userRepository.findOne({ where: { username } });
    if (user) {
      this.cacheUser(user);
    }

    return user;
  }

  private async getUserByUsernameOrEmail(
    username: string,
    email: string,
  ): Promise<User | null> {
    // Check cache first
    for (const [userId, cached] of this.userCache.entries()) {
      if (
        (cached.user.username === username || cached.user.email === email) &&
        Date.now() - cached.timestamp < this.CACHE_TTL
      ) {
        return cached.user;
      }
    }

    // Get from database
    const user = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });

    if (user) {
      this.cacheUser(user);
    }

    return user;
  }

  // Optimized session retrieval with caching
  private async getSessionByToken(token: string): Promise<Session | null> {
    // Check cache first
    const cached = this.sessionCache.get(token);
    if (cached && Date.now() - cached.timestamp < this.SESSION_CACHE_TTL) {
      return cached.session;
    }

    // Get from database
    const session = await this.sessionRepository.findOne({ where: { token } });
    if (session) {
      this.cacheSession(session);
    }

    return session;
  }

  private async updateSession(
    sessionId: string,
    newToken: string,
  ): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });
    if (session) {
      // Clear old token cache
      this.sessionCache.delete(session.token);

      // Update session
      session.token = newToken;
      const updatedSession = await this.sessionRepository.save(session);

      // Cache new session
      this.cacheSession(updatedSession);
    }
  }

  private async removeSession(userId: string, token: string): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { userId, token },
    });
    if (session) {
      await this.sessionRepository.remove(session);
      this.sessionCache.delete(token);
    }
  }

  // Cache management
  private cacheUser(user: User): void {
    this.userCache.set(user.id, { user, timestamp: Date.now() });
  }

  private cacheSession(session: Session): void {
    this.sessionCache.set(session.token, { session, timestamp: Date.now() });
  }

  private clearUserCache(userId: string): void {
    this.userCache.delete(userId);
  }

  // Cleanup expired sessions and cache
  async cleanupExpiredSessions(): Promise<void> {
    try {
      // Clean up expired sessions from database
      await this.sessionRepository
        .createQueryBuilder()
        .delete()
        .where("expiresAt < :now", { now: new Date() })
        .execute();

      // Clean up expired cache entries
      const now = Date.now();

      // Clean user cache
      for (const [userId, cached] of this.userCache.entries()) {
        if (now - cached.timestamp > this.CACHE_TTL) {
          this.userCache.delete(userId);
        }
      }

      // Clean session cache
      for (const [token, cached] of this.sessionCache.entries()) {
        if (now - cached.timestamp > this.SESSION_CACHE_TTL) {
          this.sessionCache.delete(token);
        }
      }
    } catch (error) {
      this.logger.error(`Cleanup failed: ${error.message}`);
    }
  }

  private async logSoulchainEvent(
    action: string,
    reason: string,
    context: any,
  ): Promise<void> {
    try {
      const agentId = context.userId || context.username || "anonymous";
      const amount = action.includes("success")
        ? 10
        : action.includes("blocked")
          ? -20
          : action.includes("failed")
            ? -10
            : -5;

      await soulchain.addXPTransaction({
        agentId,
        amount,
        rationale: `Auth Service: ${action} - ${reason}`,
        timestamp: new Date().toISOString(),
        previousCid: null,
        tags: [
          {
            type: "#who",
            name: context.username || "anonymous",
            did: context.userId
              ? `did:zeropoint:${context.userId}`
              : "did:zeropoint:anonymous",
            handle: context.username ? `@${context.username}` : "@anonymous",
          },
          {
            type: "#intent",
            purpose: "#auth-service",
            validation: "good-heart",
          },
          {
            type: "#thread",
            taskId: action,
            lineage: ["auth", "service"],
            swarmLink: "auth-service-swarm",
          },
          {
            type: "#layer",
            level: "#live",
          },
          {
            type: "#domain",
            field: "security",
          },
        ],
      });
    } catch (error) {
      this.logger.error(
        `Failed to log auth event to Soulchain: ${error.message}`,
      );
    }
  }
}
