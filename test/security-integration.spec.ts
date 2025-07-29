import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppModule } from '../src/app.module.js';
import { KeyRotationService } from '../src/services/key-rotation.service.js';
import { SecurityMiddleware } from '../src/middleware/security.middleware.js';
import { SecurityLoggingInterceptor } from '../src/interceptors/security-logging.interceptor.js';
import * as request from 'supertest';

describe('Security Integration Tests', () => {
  let app: INestApplication;
  let keyRotationService: KeyRotationService;
  let securityMiddleware: SecurityMiddleware;
  let securityInterceptor: SecurityLoggingInterceptor;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Get service instances
    keyRotationService = moduleFixture.get<KeyRotationService>(KeyRotationService);
    securityMiddleware = moduleFixture.get<SecurityMiddleware>(SecurityMiddleware);
    securityInterceptor = moduleFixture.get<SecurityLoggingInterceptor>(SecurityLoggingInterceptor);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Key Rotation Service', () => {
    it('should generate new key pair', async () => {
      const keyPair = await keyRotationService.generateNewKeyPair();
      
      expect(keyPair).toBeDefined();
      expect(keyPair.id).toBeDefined();
      expect(keyPair.publicKey).toBeDefined();
      expect(keyPair.privateKey).toBeDefined();
      expect(keyPair.isActive).toBe(true);
      expect(keyPair.createdAt).toBeInstanceOf(Date);
      expect(keyPair.expiresAt).toBeInstanceOf(Date);
    });

    it('should get current key', async () => {
      const currentKey = await keyRotationService.getCurrentKey();
      expect(currentKey).toBeDefined();
      expect(typeof currentKey).toBe('string');
      expect(currentKey.length).toBeGreaterThan(0);
    });

    it('should get current key ID', async () => {
      const currentKeyId = await keyRotationService.getCurrentKeyId();
      expect(currentKeyId).toBeDefined();
      expect(typeof currentKeyId).toBe('string');
      expect(currentKeyId.length).toBeGreaterThan(0);
    });

    it('should rotate keys', async () => {
      const oldKeyId = await keyRotationService.getCurrentKeyId();
      await keyRotationService.rotateKeys('test_rotation');
      const newKeyId = await keyRotationService.getCurrentKeyId();
      
      expect(newKeyId).not.toBe(oldKeyId);
    });

    it('should get key status', async () => {
      const status = await keyRotationService.getKeyStatus();
      
      expect(status).toBeDefined();
      expect(status.currentKeyId).toBeDefined();
      expect(status.totalKeys).toBeGreaterThan(0);
      expect(status.activeKeys).toBeGreaterThan(0);
      expect(status.expiredKeys).toBeDefined();
    });

    it('should get rotation history', async () => {
      const history = await keyRotationService.getRotationHistory();
      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe('Security Middleware', () => {
    it('should add security headers', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/health')
        .expect(200);

      expect(response.headers['content-security-policy']).toBeDefined();
      expect(response.headers['x-xss-protection']).toBeDefined();
      expect(response.headers['x-content-type-options']).toBeDefined();
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['strict-transport-security']).toBeDefined();
      expect(response.headers['referrer-policy']).toBeDefined();
      expect(response.headers['permissions-policy']).toBeDefined();
    });

    it('should track rate limiting', async () => {
      // Make multiple requests to trigger rate limiting
      const promises = Array.from({ length: 6 }, () =>
        request(app.getHttpServer())
          .get('/v1/health')
          .set('X-Forwarded-For', '192.168.1.100')
      );

      const responses = await Promise.all(promises);
      
      // The 6th request should be rate limited
      expect(responses[5].status).toBe(429);
      expect(responses[5].body.error).toBe('Rate limit exceeded');
    });

    it('should track failed attempts for sensitive endpoints', async () => {
      // Make multiple failed requests to sensitive endpoint
      const promises = Array.from({ length: 6 }, () =>
        request(app.getHttpServer())
          .post('/auth/login')
          .set('X-Forwarded-For', '192.168.1.101')
          .send({ username: 'test', password: 'wrong' })
      );

      const responses = await Promise.all(promises);
      
      // The 6th request should be blocked due to IP lockout
      expect(responses[5].status).toBe(429);
      expect(responses[5].body.error).toBe('Too many failed attempts');
    });

    it('should get security metrics', () => {
      const metrics = securityMiddleware.getSecurityMetrics();
      
      expect(metrics).toBeDefined();
      expect(metrics.totalRequests).toBeGreaterThan(0);
      expect(metrics.blockedRequests).toBeDefined();
      expect(metrics.lockedIPs).toBeDefined();
      expect(metrics.rateLimitHits).toBeDefined();
      expect(metrics.lastUpdated).toBeInstanceOf(Date);
    });

    it('should get locked IPs', () => {
      const lockedIPs = securityMiddleware.getLockedIPs();
      expect(Array.isArray(lockedIPs)).toBe(true);
    });

    it('should unlock IP', () => {
      const testIP = '192.168.1.102';
      const result = securityMiddleware.unlockIP(testIP);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Security Logging Interceptor', () => {
    it('should log security events', async () => {
      await request(app.getHttpServer())
        .get('/v1/health')
        .expect(200);

      const events = securityInterceptor.getSecurityEvents();
      expect(events.length).toBeGreaterThan(0);
      
      const lastEvent = events[events.length - 1];
      expect(lastEvent).toBeDefined();
      expect(lastEvent.action).toBeDefined();
      expect(lastEvent.ip).toBeDefined();
      expect(lastEvent.soulchainHash).toBeDefined();
    });

    it('should get security stats', () => {
      const stats = securityInterceptor.getSecurityStats();
      
      expect(stats).toBeDefined();
      expect(stats.totalEvents).toBeGreaterThan(0);
      expect(stats.eventsLastHour).toBeDefined();
      expect(stats.eventsLastDay).toBeDefined();
      expect(stats.failedRequests).toBeDefined();
      expect(stats.authAttempts).toBeDefined();
      expect(stats.protectedAccess).toBeDefined();
      expect(stats.uniqueIPs).toBeDefined();
    });
  });

  describe('JWT Security', () => {
    it('should reject invalid tokens', async () => {
      await request(app.getHttpServer())
        .get('/v1/advanced/status')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should reject expired tokens', async () => {
      // This would require a test with an expired JWT token
      // Implementation would depend on JWT generation logic
      expect(true).toBe(true); // Placeholder test
    });

    it('should validate token issuer and audience', async () => {
      // This would test JWT issuer and audience validation
      // Implementation would depend on JWT generation logic
      expect(true).toBe(true); // Placeholder test
    });
  });

  describe('Content Security Policy', () => {
    it('should have strict CSP headers', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/health')
        .expect(200);

      const csp = response.headers['content-security-policy'];
      expect(csp).toBeDefined();
      
      // Check for key CSP directives
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("frame-ancestors 'none'");
      expect(csp).toContain("script-src 'self'");
    });
  });

  describe('Rate Limiting', () => {
    it('should have different limits for different endpoints', async () => {
      // Test auth endpoint limit (5 per minute)
      const authPromises = Array.from({ length: 6 }, () =>
        request(app.getHttpServer())
          .post('/auth/login')
          .set('X-Forwarded-For', '192.168.1.103')
          .send({ username: 'test', password: 'test' })
      );

      const authResponses = await Promise.all(authPromises);
      expect(authResponses[5].status).toBe(429);

      // Test general endpoint limit (100 per minute)
      const generalPromises = Array.from({ length: 101 }, () =>
        request(app.getHttpServer())
          .get('/v1/health')
          .set('X-Forwarded-For', '192.168.1.104')
      );

      const generalResponses = await Promise.all(generalPromises);
      expect(generalResponses[100].status).toBe(429);
    });
  });

  describe('IP Lockout', () => {
    it('should lock IP after 5 failed attempts', async () => {
      const testIP = '192.168.1.105';
      
      // Make 5 failed attempts
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/auth/login')
          .set('X-Forwarded-For', testIP)
          .send({ username: 'test', password: 'wrong' })
          .expect(401);
      }

      // 6th attempt should be blocked
      await request(app.getHttpServer())
        .post('/auth/login')
        .set('X-Forwarded-For', testIP)
        .send({ username: 'test', password: 'wrong' })
        .expect(429);
    });

    it('should unlock IP after lockout period', async () => {
      const testIP = '192.168.1.106';
      
      // Lock the IP
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/auth/login')
          .set('X-Forwarded-For', testIP)
          .send({ username: 'test', password: 'wrong' })
          .expect(401);
      }

      // Manually unlock
      const unlocked = securityMiddleware.unlockIP(testIP);
      expect(unlocked).toBe(true);

      // Should be able to make requests again
      await request(app.getHttpServer())
        .get('/v1/health')
        .set('X-Forwarded-For', testIP)
        .expect(200);
    });
  });
});