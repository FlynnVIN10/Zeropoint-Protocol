// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy, JwtPayload } from '../strategies/jwt.strategy.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { AuthService } from '../services/auth.service.js';
import { ConfigService } from '@nestjs/config';
import { checkIntent } from '../guards/synthient.guard.js';
import { soulchain } from '../agents/soulchain/soulchain.ledger.js';

// Mock dependencies
jest.mock('../guards/synthient.guard.js');
jest.mock('../agents/soulchain/soulchain.ledger.js');

const mockCheckIntent = checkIntent as jest.MockedFunction<typeof checkIntent>;
const mockSoulchain = soulchain as jest.Mocked<typeof soulchain>;

describe('JWT Authentication System', () => {
  let jwtStrategy: JwtStrategy;
  let jwtAuthGuard: JwtAuthGuard;
  let authService: AuthService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') {
        return 'test-jwt-secret';
      }
      return undefined;
    })
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn()
  };

  const mockSessionRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  };

  const mockAuditLogRepository = {
    save: jest.fn(),
    create: jest.fn()
  };

  const mockJwtService = {
    sign: jest.fn()
  };

  const mockUser = {
    id: 'test-user-id',
    username: 'testuser',
    email: 'test@example.com',
    roles: ['user'],
    isActive: true,
    validatePassword: jest.fn(),
    toJSON: jest.fn()
  };

  const validJwtPayload: JwtPayload = {
    sub: 'test-user-id',
    username: 'testuser',
    email: 'test@example.com',
    roles: ['user'],
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        JwtAuthGuard,
        AuthService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: 'UserRepository',
          useValue: mockUserRepository,
        },
        {
          provide: 'SessionRepository',
          useValue: mockSessionRepository,
        },
        {
          provide: 'AuditLogRepository',
          useValue: mockAuditLogRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    jwtAuthGuard = module.get<JwtAuthGuard>(JwtAuthGuard);
    authService = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);

    // Reset mocks
    jest.clearAllMocks();
    mockCheckIntent.mockReturnValue(true);
    mockSoulchain.addXPTransaction.mockResolvedValue(undefined);
    mockConfigService.get.mockReturnValue('test-secret');
  });

  describe('JwtStrategy', () => {
    it('should validate a valid JWT payload', async () => {
      const result = await jwtStrategy.validate(validJwtPayload);

      expect(result).toEqual({
        userId: validJwtPayload.sub,
        username: validJwtPayload.username,
        email: validJwtPayload.email,
        roles: validJwtPayload.roles
      });
      expect(mockSoulchain.addXPTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          agentId: validJwtPayload.sub,
          amount: 1,
          rationale: expect.stringContaining('jwt_validation_success')
        })
      );
    });

    it('should throw UnauthorizedException on Zeroth violation', async () => {
      mockCheckIntent.mockReturnValue(false);

      await expect(jwtStrategy.validate(validJwtPayload)).rejects.toThrow(
        new UnauthorizedException('Zeroth violation: JWT validation blocked.')
      );
      expect(mockSoulchain.addXPTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          agentId: validJwtPayload.sub,
          amount: -5,
          rationale: expect.stringContaining('jwt_validation_failed')
        })
      );
    });

    it('should throw UnauthorizedException for invalid payload structure', async () => {
      const invalidPayload = {
        sub: 'test-user-id',
        username: 'testuser'
        // Missing email and roles
      };

      await expect(jwtStrategy.validate(invalidPayload as JwtPayload)).rejects.toThrow(
        new UnauthorizedException('Invalid JWT payload structure')
      );
    });

    it('should throw UnauthorizedException for expired token', async () => {
      const expiredPayload = {
        ...validJwtPayload,
        exp: Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
      };

      await expect(jwtStrategy.validate(expiredPayload)).rejects.toThrow(
        new UnauthorizedException('JWT token expired')
      );
    });

    it('should handle validation errors gracefully', async () => {
      const invalidPayload = null;

      await expect(jwtStrategy.validate(invalidPayload as any)).rejects.toThrow();
      expect(mockSoulchain.addXPTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          agentId: 'undefined',
          amount: -5,
          rationale: expect.stringContaining('jwt_validation_error')
        })
      );
    });
  });

  describe('JwtAuthGuard', () => {
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'GET',
          url: '/v1/test',
          ip: '127.0.0.1',
          headers: {
            authorization: 'Bearer valid-token',
            'user-agent': 'test-agent'
          },
          user: {
            userId: 'test-user-id',
            username: 'testuser'
          }
        })
      })
    };

    it('should allow valid authentication', async () => {
      const result = await jwtAuthGuard.canActivate(mockExecutionContext as any);

      expect(result).toBe(true);
      expect(mockSoulchain.addXPTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          agentId: 'test-user-id',
          amount: 2,
          rationale: expect.stringContaining('auth_success')
        })
      );
    });

    it('should block authentication on Zeroth violation', async () => {
      mockCheckIntent.mockReturnValue(false);

      await expect(jwtAuthGuard.canActivate(mockExecutionContext as any)).rejects.toThrow(
        new UnauthorizedException('Zeroth violation: Auth blocked.')
      );
      expect(mockSoulchain.addXPTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          agentId: 'anonymous',
          amount: -10,
          rationale: expect.stringContaining('auth_blocked')
        })
      );
    });

    it('should reject requests without Authorization header', async () => {
      const contextWithoutAuth = {
        switchToHttp: () => ({
          getRequest: () => ({
            method: 'GET',
            url: '/v1/test',
            ip: '127.0.0.1',
            headers: {
              'user-agent': 'test-agent'
              // No authorization header
            }
          })
        })
      };

      await expect(jwtAuthGuard.canActivate(contextWithoutAuth as any)).rejects.toThrow(
        new UnauthorizedException('Missing or invalid Authorization header')
      );
    });

    it('should reject requests with invalid Authorization header format', async () => {
      const contextWithInvalidAuth = {
        switchToHttp: () => ({
          getRequest: () => ({
            method: 'GET',
            url: '/v1/test',
            ip: '127.0.0.1',
            headers: {
              authorization: 'InvalidFormat token',
              'user-agent': 'test-agent'
            }
          })
        })
      };

      await expect(jwtAuthGuard.canActivate(contextWithInvalidAuth as any)).rejects.toThrow(
        new UnauthorizedException('Missing or invalid Authorization header')
      );
    });

    it('should handle guard errors gracefully', async () => {
      const invalidContext = {
        switchToHttp: () => ({
          getRequest: () => null
        })
      };

      await expect(jwtAuthGuard.canActivate(invalidContext as any)).rejects.toThrow();
      expect(mockSoulchain.addXPTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          agentId: 'anonymous',
          amount: -5,
          rationale: expect.stringContaining('auth_error')
        })
      );
    });
  });

  const registerDto = {
    username: 'newuser',
    email: 'newuser@example.com',
    password: 'password123',
    firstName: 'New',
    lastName: 'User'
  };

  const loginDto = {
    username: 'testuser',
    password: 'password123'
  };

  describe('AuthService', () => {

    it('should register a new user successfully', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('access-token');

      const result = await authService.register(registerDto, '127.0.0.1', 'test-agent');

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(mockSoulchain.addXPTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          agentId: 'newuser',
          amount: 10,
          rationale: expect.stringContaining('register_success')
        })
      );
    });

    it('should block registration on Zeroth violation', async () => {
      mockCheckIntent.mockReturnValue(false);

      await expect(authService.register(registerDto, '127.0.0.1', 'test-agent')).rejects.toThrow(
        new UnauthorizedException('Zeroth violation: Registration blocked.')
      );
      expect(mockSoulchain.addXPTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          agentId: 'newuser',
          amount: -20,
          rationale: expect.stringContaining('register_blocked')
        })
      );
    });

    it('should reject registration for existing user', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(authService.register(registerDto, '127.0.0.1', 'test-agent')).rejects.toThrow(
        new Error('Username or email already exists')
      );
      expect(mockSoulchain.addXPTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          agentId: 'newuser',
          amount: -10,
          rationale: expect.stringContaining('register_failed')
        })
      );
    });

    it('should login user successfully', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUser.validatePassword.mockResolvedValue(true);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('access-token');
      mockSessionRepository.create.mockReturnValue({});
      mockSessionRepository.save.mockResolvedValue({});

      const result = await authService.login(loginDto, '127.0.0.1', 'test-agent');

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(mockSoulchain.addXPTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          agentId: 'testuser',
          amount: 10,
          rationale: expect.stringContaining('login_success')
        })
      );
    });

    it('should block login on Zeroth violation', async () => {
      mockCheckIntent.mockReturnValue(false);

      await expect(authService.login(loginDto, '127.0.0.1', 'test-agent')).rejects.toThrow(
        new UnauthorizedException('Zeroth violation: Login blocked.')
      );
      expect(mockSoulchain.addXPTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          agentId: 'testuser',
          amount: -20,
          rationale: expect.stringContaining('login_blocked')
        })
      );
    });

    it('should reject login for non-existent user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(authService.login(loginDto, '127.0.0.1', 'test-agent')).rejects.toThrow(
        new UnauthorizedException('Invalid credentials')
      );
      expect(mockSoulchain.addXPTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          agentId: 'testuser',
          amount: -10,
          rationale: expect.stringContaining('login_failed')
        })
      );
    });

    it('should reject login for invalid password', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUser.validatePassword.mockResolvedValue(false);

      await expect(authService.login(loginDto, '127.0.0.1', 'test-agent')).rejects.toThrow(
        new UnauthorizedException('Invalid credentials')
      );
      expect(mockSoulchain.addXPTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          agentId: 'testuser',
          amount: -10,
          rationale: expect.stringContaining('login_failed')
        })
      );
    });

    it('should handle service errors gracefully', async () => {
      mockUserRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(authService.login(loginDto, '127.0.0.1', 'test-agent')).rejects.toThrow();
      expect(mockSoulchain.addXPTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          agentId: 'testuser',
          amount: -5,
          rationale: expect.stringContaining('login_error')
        })
      );
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete authentication flow', async () => {
      // Mock successful registration
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('access-token');

      const registerResult = await authService.register(registerDto, '127.0.0.1', 'test-agent');
      expect(registerResult.success).toBe(true);

      // Mock successful login
      mockUser.validatePassword.mockResolvedValue(true);
      mockSessionRepository.create.mockReturnValue({});
      mockSessionRepository.save.mockResolvedValue({});

      const loginResult = await authService.login(loginDto, '127.0.0.1', 'test-agent');
      expect(loginResult.success).toBe(true);

      // Verify Soulchain logging
      expect(mockSoulchain.addXPTransaction).toHaveBeenCalledTimes(2);
      expect(mockSoulchain.addXPTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 10,
          rationale: expect.stringContaining('register_success')
        })
      );
      expect(mockSoulchain.addXPTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 10,
          rationale: expect.stringContaining('login_success')
        })
      );
    });

    it('should handle authentication failures with proper logging', async () => {
      // Mock Zeroth violation
      mockCheckIntent.mockReturnValue(false);

      await expect(authService.login(loginDto, '127.0.0.1', 'test-agent')).rejects.toThrow();
      expect(mockSoulchain.addXPTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: -20,
          rationale: expect.stringContaining('login_blocked')
        })
      );
    });
  });
}); 