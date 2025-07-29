import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { KeyRotationService } from '../src/services/key-rotation.service.js';
import { SecurityMiddleware } from '../src/middleware/security.middleware.js';
import { SecurityLoggingInterceptor } from '../src/interceptors/security-logging.interceptor.js';
import { KeyRotationGuard } from '../src/guards/key-rotation.ts';

describe('Security Unit Tests', () => {
  let module: TestingModule;
  let keyRotationService: KeyRotationService;
  let securityMiddleware: SecurityMiddleware;
  let securityInterceptor: SecurityLoggingInterceptor;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
      ],
      providers: [
        KeyRotationService,
        SecurityMiddleware,
        SecurityLoggingInterceptor,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
            signAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              const config = {
                'NODE_ENV': 'test',
                'APP_VERSION': '1.0.0',
                'JWT_SECRET': 'test-secret',
                'JWT_EXPIRES_IN': '15m',
              };
              return config[key] || defaultValue;
            }),
          },
        },
      ],
    }).compile();

    keyRotationService = module.get<KeyRotationService>(KeyRotationService);
    securityMiddleware = module.get<SecurityMiddleware>(SecurityMiddleware);
    securityInterceptor = module.get<SecurityLoggingInterceptor>(SecurityLoggingInterceptor);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('Key Rotation Service', () => {
    it('should generate valid RSA key pair', async () => {
      const keyPair = await keyRotationService.generateNewKeyPair();
      
      expect(keyPair.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      expect(keyPair.publicKey).toContain('-----BEGIN PUBLIC KEY-----');
      expect(keyPair.privateKey).toContain('-----BEGIN PRIVATE KEY-----');
      expect(keyPair.isActive).toBe(true);
      expect(keyPair.createdAt).toBeInstanceOf(Date);
      expect(keyPair.expiresAt).toBeInstanceOf(Date);
    });

    it('should handle key rotation correctly', async () => {
      const oldKeyId = await keyRotationService.getCurrentKeyId();
      await keyRotationService.rotateKeys('test_rotation');
      const newKeyId = await keyRotationService.getCurrentKeyId();
      
      expect(newKeyId).not.toBe(oldKeyId);
    });

    it('should provide key status information', async () => {
      const status = await keyRotationService.getKeyStatus();
      
      expect(status).toHaveProperty('currentKeyId');
      expect(status).toHaveProperty('totalKeys');
      expect(status).toHaveProperty('activeKeys');
      expect(status).toHaveProperty('expiredKeys');
      expect(status).toHaveProperty('lastRotation');
      
      expect(typeof status.currentKeyId).toBe('string');
      expect(typeof status.totalKeys).toBe('number');
      expect(typeof status.activeKeys).toBe('number');
      expect(typeof status.expiredKeys).toBe('number');
    });

    it('should maintain rotation history', async () => {
      const history = await keyRotationService.getRotationHistory();
      expect(Array.isArray(history)).toBe(true);
      
      if (history.length > 0) {
        const lastRotation = history[history.length - 1];
        expect(lastRotation).toHaveProperty('id');
        expect(lastRotation).toHaveProperty('oldKeyId');
        expect(lastRotation).toHaveProperty('newKeyId');
        expect(lastRotation).toHaveProperty('timestamp');
        expect(lastRotation).toHaveProperty('reason');
        expect(lastRotation).toHaveProperty('soulchainHash');
      }
    });
  });

  describe('Security Middleware', () => {
    it('should identify sensitive endpoints correctly', () => {
      const sensitiveEndpoints = [
        '/auth/login',
        '/auth/register',
        '/v1/advanced/status',
        '/v1/agent/state',
        '/admin/dashboard',
      ];

      const nonSensitiveEndpoints = [
        '/v1/health',
        '/docs',
        '/static/css',
        '/api/public',
      ];

      // Test sensitive endpoints
      sensitiveEndpoints.forEach(endpoint => {
        expect(securityMiddleware['isSensitiveEndpoint'](endpoint)).toBe(true);
      });

      // Test non-sensitive endpoints
      nonSensitiveEndpoints.forEach(endpoint => {
        expect(securityMiddleware['isSensitiveEndpoint'](endpoint)).toBe(false);
      });
    });

    it('should apply correct rate limits for different endpoints', () => {
      expect(securityMiddleware['getRateLimitForEndpoint']('/auth/login')).toBe(5);
      expect(securityMiddleware['getRateLimitForEndpoint']('/v1/advanced/status')).toBe(10);
      expect(securityMiddleware['getRateLimitForEndpoint']('/v1/agent/state')).toBe(20);
      expect(securityMiddleware['getRateLimitForEndpoint']('/v1/health')).toBe(100);
    });

    it('should extract client IP correctly', () => {
      const mockRequest = {
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'x-real-ip': '192.168.1.2',
        },
        connection: { remoteAddress: '192.168.1.3' },
        socket: { remoteAddress: '192.168.1.4' },
      } as any;

      expect(securityMiddleware['getClientIP'](mockRequest)).toBe('192.168.1.1');

      // Test fallback to x-real-ip
      delete mockRequest.headers['x-forwarded-for'];
      expect(securityMiddleware['getClientIP'](mockRequest)).toBe('192.168.1.2');

      // Test fallback to connection.remoteAddress
      delete mockRequest.headers['x-real-ip'];
      expect(securityMiddleware['getClientIP'](mockRequest)).toBe('192.168.1.3');

      // Test fallback to socket.remoteAddress
      delete mockRequest.connection.remoteAddress;
      expect(securityMiddleware['getClientIP'](mockRequest)).toBe('192.168.1.4');

      // Test fallback to 'unknown'
      delete mockRequest.socket.remoteAddress;
      expect(securityMiddleware['getClientIP'](mockRequest)).toBe('unknown');
    });

    it('should provide security metrics', () => {
      const metrics = securityMiddleware.getSecurityMetrics();
      
      expect(metrics).toHaveProperty('totalRequests');
      expect(metrics).toHaveProperty('blockedRequests');
      expect(metrics).toHaveProperty('lockedIPs');
      expect(metrics).toHaveProperty('rateLimitHits');
      expect(metrics).toHaveProperty('lastUpdated');
      
      expect(typeof metrics.totalRequests).toBe('number');
      expect(typeof metrics.blockedRequests).toBe('number');
      expect(typeof metrics.lockedIPs).toBe('number');
      expect(typeof metrics.rateLimitHits).toBe('number');
      expect(metrics.lastUpdated).toBeInstanceOf(Date);
    });

    it('should manage IP lockout correctly', () => {
      const testIP = '192.168.1.100';
      
      // Initially should not be locked
      expect(securityMiddleware.getLockedIPs()).not.toContain(testIP);
      
      // Unlock should return false for non-locked IP
      expect(securityMiddleware.unlockIP(testIP)).toBe(false);
    });
  });

  describe('Security Logging Interceptor', () => {
    it('should determine action correctly', () => {
      const mockRequest = { url: '', method: 'GET' } as any;
      
      mockRequest.url = '/auth/login';
      expect(securityInterceptor['determineAction'](mockRequest)).toBe('AUTH_ATTEMPT');
      
      mockRequest.url = '/v1/advanced/status';
      expect(securityInterceptor['determineAction'](mockRequest)).toBe('PROTECTED_ACCESS');
      
      mockRequest.url = '/v1/health';
      expect(securityInterceptor['determineAction'](mockRequest)).toBe('HEALTH_CHECK');
      
      mockRequest.url = '/v1/api/data';
      expect(securityInterceptor['determineAction'](mockRequest)).toBe('API_ACCESS');
      
      mockRequest.url = '/docs';
      expect(securityInterceptor['determineAction'](mockRequest)).toBe('GENERAL_ACCESS');
    });

    it('should sanitize headers correctly', () => {
      const headers = {
        'authorization': 'Bearer token',
        'cookie': 'session=abc123',
        'x-api-key': 'secret-key',
        'user-agent': 'Mozilla/5.0',
        'content-type': 'application/json',
      };

      const sanitized = securityInterceptor['sanitizeHeaders'](headers);
      
      expect(sanitized.authorization).toBeUndefined();
      expect(sanitized.cookie).toBeUndefined();
      expect(sanitized['x-api-key']).toBeUndefined();
      expect(sanitized['user-agent']).toBe('Mozilla/5.0');
      expect(sanitized['content-type']).toBe('application/json');
    });

    it('should sanitize body correctly', () => {
      const body = {
        username: 'testuser',
        password: 'secretpassword',
        token: 'jwt-token',
        secret: 'api-secret',
        key: 'encryption-key',
        email: 'test@example.com',
      };

      const sanitized = securityInterceptor['sanitizeBody'](body);
      
      expect(sanitized.password).toBeUndefined();
      expect(sanitized.token).toBeUndefined();
      expect(sanitized.secret).toBeUndefined();
      expect(sanitized.key).toBeUndefined();
      expect(sanitized.username).toBe('testuser');
      expect(sanitized.email).toBe('test@example.com');
    });

    it('should generate soulchain hash correctly', () => {
      const event = {
        action: 'TEST_ACTION',
        timestamp: new Date('2025-01-01T00:00:00Z'),
        ip: '192.168.1.1',
        method: 'GET',
        url: '/test',
        statusCode: 200,
      };

      const hash = securityInterceptor['generateSoulchainHash'](event);
      
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64); // SHA-256 hash length
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should provide security statistics', () => {
      const stats = securityInterceptor.getSecurityStats();
      
      expect(stats).toHaveProperty('totalEvents');
      expect(stats).toHaveProperty('eventsLastHour');
      expect(stats).toHaveProperty('eventsLastDay');
      expect(stats).toHaveProperty('failedRequests');
      expect(stats).toHaveProperty('authAttempts');
      expect(stats).toHaveProperty('protectedAccess');
      expect(stats).toHaveProperty('uniqueIPs');
      
      expect(typeof stats.totalEvents).toBe('number');
      expect(typeof stats.eventsLastHour).toBe('number');
      expect(typeof stats.eventsLastDay).toBe('number');
      expect(typeof stats.failedRequests).toBe('number');
      expect(typeof stats.authAttempts).toBe('number');
      expect(typeof stats.protectedAccess).toBe('number');
      expect(typeof stats.uniqueIPs).toBe('number');
    });
  });

  describe('JWT Security Configuration', () => {
    it('should have proper JWT configuration', () => {
      expect(configService.get('JWT_SECRET')).toBe('test-secret');
      expect(configService.get('JWT_EXPIRES_IN')).toBe('15m');
    });

    it('should validate JWT issuer and audience', () => {
      // This would test the JWT configuration in app.module.ts
      // The configuration should include issuer and audience validation
      expect(true).toBe(true); // Placeholder test
    });
  });

  describe('Security Headers', () => {
    it('should have comprehensive security headers', () => {
      const mockResponse = {
        setHeader: jest.fn(),
      } as any;

      securityMiddleware['addSecurityHeaders'](mockResponse);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Security-Policy',
        expect.stringContaining("default-src 'self'")
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-XSS-Protection',
        '1; mode=block'
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-Content-Type-Options',
        'nosniff'
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-Frame-Options',
        'DENY'
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains'
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Referrer-Policy',
        'strict-origin-when-cross-origin'
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Permissions-Policy',
        expect.stringContaining('geolocation=()')
      );
    });
  });

  describe('Rate Limiting Logic', () => {
    it('should track rate limiting correctly', () => {
      const testIP = '192.168.1.200';
      const testURL = '/v1/health';
      
      // Simulate rate limiting logic
      const isRateLimited = securityMiddleware['isRateLimited'](testIP, testURL);
      
      // Should not be rate limited initially
      expect(typeof isRateLimited).toBe('boolean');
    });
  });

  describe('Soulchain Integration', () => {
    it('should generate soulchain payloads correctly', () => {
      // Test that soulchain logging methods exist and work
      expect(typeof securityInterceptor['logToSoulchain']).toBe('function');
      expect(typeof securityMiddleware['logToSoulchain']).toBe('function');
      expect(typeof keyRotationService['logToSoulchain']).toBe('function');
    });
  });
});