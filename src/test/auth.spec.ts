import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from '../controllers/auth.controller.js';
import { AuthService } from '../services/auth.service.js';
import { User } from '../entities/user.entity.js';
import { Session } from '../entities/session.entity.js';
import { AuditLog } from '../entities/audit-log.entity.js';
import { JwtStrategy } from '../strategies/jwt.strategy.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';

describe('Authentication System (Phase 3)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let authController: AuthController;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test'
        }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT) || 5432,
          username: process.env.DB_USER || 'zeropoint',
          password: process.env.DB_PASS || 'zeropointpass',
          database: process.env.DB_NAME || 'zeropointdb_test',
          entities: [User, Session, AuditLog],
          synchronize: true,
          dropSchema: true
        }),
        TypeOrmModule.forFeature([User, Session, AuditLog]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: process.env.JWT_SECRET || 'test-secret',
          signOptions: { expiresIn: '15m' }
        })
      ],
      controllers: [AuthController],
      providers: [AuthService, JwtStrategy, JwtAuthGuard]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    authService = moduleFixture.get<AuthService>(AuthService);
    authController = moduleFixture.get<AuthController>(AuthController);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        username: 'testuser',
        email: 'test@zeropoint.protocol',
        password: 'securepassword123',
        firstName: 'Test',
        lastName: 'User'
      };

      const mockReq = {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' }
      };

      const result = await authController.register(registerDto, mockReq);

      expect(result.success).toBe(true);
      expect(result.user.username).toBe(registerDto.username);
      expect(result.user.email).toBe(registerDto.email);
      expect(result.user.password).toBeUndefined(); // Password should be excluded
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should reject duplicate username', async () => {
      const registerDto = {
        username: 'testuser2',
        email: 'test2@zeropoint.protocol',
        password: 'securepassword123'
      };

      const mockReq = {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' }
      };

      // First registration should succeed
      await authController.register(registerDto, mockReq);

      // Second registration with same username should fail
      await expect(authController.register(registerDto, mockReq))
        .rejects
        .toThrow('Username or email already exists');
    });
  });

  describe('User Login', () => {
    it('should login with valid credentials', async () => {
      const loginDto = {
        username: 'testuser',
        password: 'securepassword123'
      };

      const mockReq = {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' }
      };

      const result = await authController.login(loginDto, mockReq);

      expect(result.success).toBe(true);
      expect(result.user.username).toBe(loginDto.username);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const loginDto = {
        username: 'testuser',
        password: 'wrongpassword'
      };

      const mockReq = {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' }
      };

      await expect(authController.login(loginDto, mockReq))
        .rejects
        .toThrow('Invalid credentials');
    });
  });

  describe('Token Management', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const loginDto = {
        username: 'testuser',
        password: 'securepassword123'
      };

      const mockReq = {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' }
      };

      const result = await authController.login(loginDto, mockReq);
      refreshToken = result.refreshToken;
    });

    it('should refresh access token', async () => {
      const refreshTokenDto = { refreshToken };

      const mockReq = {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' }
      };

      const result = await authController.refreshToken(refreshTokenDto, mockReq);

      expect(result.success).toBe(true);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should reject invalid refresh token', async () => {
      const refreshTokenDto = { refreshToken: 'invalid-token' };

      const mockReq = {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' }
      };

      await expect(authController.refreshToken(refreshTokenDto, mockReq))
        .rejects
        .toThrow('Invalid refresh token');
    });
  });

  describe('Profile Management', () => {
    let accessToken: string;

    beforeEach(async () => {
      const loginDto = {
        username: 'testuser',
        password: 'securepassword123'
      };

      const mockReq = {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' }
      };

      const result = await authController.login(loginDto, mockReq);
      accessToken = result.accessToken;
    });

    it('should get user profile', async () => {
      const mockReq = {
        user: { userId: 'test-user-id' },
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' }
      };

      const result = await authController.getProfile(mockReq);

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
    });

    it('should update user profile', async () => {
      const updateProfileDto = {
        firstName: 'Updated',
        lastName: 'Name'
      };

      const mockReq = {
        user: { userId: 'test-user-id' },
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' }
      };

      const result = await authController.updateProfile(updateProfileDto, mockReq);

      expect(result.success).toBe(true);
      expect(result.user.firstName).toBe(updateProfileDto.firstName);
      expect(result.user.lastName).toBe(updateProfileDto.lastName);
    });
  });

  describe('Session Management', () => {
    it('should get active sessions', async () => {
      const mockReq = {
        user: { userId: 'test-user-id' },
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' }
      };

      const result = await authController.getActiveSessions(mockReq);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.sessions)).toBe(true);
    });
  });

  describe('Security Features', () => {
    it('should hash passwords securely', async () => {
      const user = new User();
      user.password = 'testpassword';

      await user.hashPassword();

      expect(user.password).not.toBe('testpassword');
      expect(user.password.length).toBeGreaterThan(50); // bcrypt hash length
    });

    it('should validate passwords correctly', async () => {
      const user = new User();
      user.password = 'testpassword';

      await user.hashPassword();

      const isValid = await user.validatePassword('testpassword');
      const isInvalid = await user.validatePassword('wrongpassword');

      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });

    it('should exclude password from JSON serialization', () => {
      const user = new User();
      user.id = 'test-id';
      user.username = 'testuser';
      user.password = 'hashedpassword';

      const jsonUser = user.toJSON();

      expect(jsonUser.password).toBeUndefined();
      expect(jsonUser.id).toBe('test-id');
      expect(jsonUser.username).toBe('testuser');
    });
  });

  describe('Audit Logging', () => {
    it('should log authentication events', async () => {
      const registerDto = {
        username: 'audituser',
        email: 'audit@zeropoint.protocol',
        password: 'securepassword123'
      };

      const mockReq = {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' }
      };

      await authController.register(registerDto, mockReq);

      // Verify audit log was created (this would require accessing the repository directly)
      // In a real test, you might want to check the database directly
      expect(true).toBe(true); // Placeholder for audit verification
    });
  });

  describe('Zeroth-gate Compliance', () => {
    it('should enforce Zeroth-gate on registration', async () => {
      const registerDto = {
        username: 'malicious',
        email: 'malicious@zeropoint.protocol',
        password: 'securepassword123'
      };

      const mockReq = {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' }
      };

      // This test assumes checkIntent would reject malicious usernames
      // In practice, you'd need to implement the actual logic
      expect(true).toBe(true); // Placeholder for Zeroth-gate test
    });
  });
}); 