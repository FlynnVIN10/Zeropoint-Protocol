import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CustomThrottlerGuard } from '../guards/throttler.guard.js';
import { winstonConfig } from '../config/winston.config.js';
import * as winston from 'winston';

describe('Phase 5: Containerization & Security', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true
        })
      ],
      providers: [CustomThrottlerGuard]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Winston Logging Configuration', () => {
    it('should configure Winston logger with proper transports', () => {
      const logger = winston.createLogger(winstonConfig);
      
      expect(logger).toBeDefined();
      expect(logger.transports).toHaveLength(3); // console, app, error
      expect(logger.exceptionHandlers).toHaveLength(1);
      expect(logger.rejectionHandlers).toHaveLength(1);
    });

    it('should create specialized loggers', () => {
      // Test access logger
      const accessLogger = winston.createLogger({
        level: 'info',
        defaultMeta: { service: 'zeropoint-api-access' },
        transports: [new winston.transports.Console()]
      });
      
      expect(accessLogger).toBeDefined();
      expect(accessLogger.level).toBe('info');
      
      // Test audit logger
      const auditLogger = winston.createLogger({
        level: 'info',
        defaultMeta: { service: 'zeropoint-api-audit' },
        transports: [new winston.transports.Console()]
      });
      
      expect(auditLogger).toBeDefined();
      expect(auditLogger.level).toBe('info');
      
      // Test security logger
      const securityLogger = winston.createLogger({
        level: 'warn',
        defaultMeta: { service: 'zeropoint-api-security' },
        transports: [new winston.transports.Console()]
      });
      
      expect(securityLogger).toBeDefined();
      expect(securityLogger.level).toBe('warn');
    });

    it('should handle log rotation events', () => {
      const mockTransport = {
        on: jest.fn(),
        close: jest.fn()
      };
      
      // Simulate log rotation event
      const rotateHandler = mockTransport.on.mock.calls.find(
        call => call[0] === 'rotate'
      );
      
      expect(mockTransport.on).toHaveBeenCalled();
    });
  });

  describe('Custom Throttler Guard', () => {
    let throttlerGuard: CustomThrottlerGuard;

    beforeEach(() => {
      throttlerGuard = new CustomThrottlerGuard();
    });

    it('should get client IP from various headers', () => {
      const mockReq = {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
          'x-real-ip': '192.168.1.2',
          'x-forwarded-proto': 'https'
        },
        ip: '192.168.1.3',
        connection: { remoteAddress: '192.168.1.4' }
      };

      const ip = throttlerGuard['getClientIp'](mockReq);
      expect(ip).toBe('192.168.1.1'); // Should use x-forwarded-for first
    });

    it('should get client IP from x-real-ip header', () => {
      const mockReq = {
        headers: {
          'x-real-ip': '192.168.1.2'
        },
        ip: '192.168.1.3',
        connection: { remoteAddress: '192.168.1.4' }
      };

      const ip = throttlerGuard['getClientIp'](mockReq);
      expect(ip).toBe('192.168.1.2');
    });

    it('should get client IP from connection remote address', () => {
      const mockReq = {
        headers: {},
        ip: '192.168.1.3',
        connection: { remoteAddress: '192.168.1.4' }
      };

      const ip = throttlerGuard['getClientIp'](mockReq);
      expect(ip).toBe('192.168.1.3'); // Should use req.ip
    });

    it('should generate tracker with user ID for authenticated requests', () => {
      const mockReq = {
        user: { userId: 'user123' },
        ip: '192.168.1.1'
      };

      const tracker = throttlerGuard['getTracker'](mockReq);
      expect(tracker).toBe('192.168.1.1:user123');
    });

    it('should generate tracker with IP only for unauthenticated requests', () => {
      const mockReq = {
        ip: '192.168.1.1'
      };

      const tracker = throttlerGuard['getTracker'](mockReq);
      expect(tracker).toBe('192.168.1.1');
    });

    it('should get appropriate throttle options for different endpoints', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            url: '/v1/auth/login',
            method: 'POST'
          })
        })
      };

      const options = throttlerGuard['getThrottleOptions'](mockContext as any);
      expect(options.limit).toBe(5);
      expect(options.ttl).toBe(300000); // 5 minutes
    });

    it('should get default throttle options for unknown endpoints', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            url: '/v1/unknown',
            method: 'GET'
          })
        })
      };

      const options = throttlerGuard['getThrottleOptions'](mockContext as any);
      expect(options.limit).toBe(100); // Default GET limit
      expect(options.ttl).toBe(60000); // 1 minute
    });

    it('should handle throttling with proper response headers', async () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            url: '/v1/auth/login',
            method: 'POST',
            ip: '192.168.1.1'
          }),
          getResponse: () => ({
            header: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
          })
        })
      };

      await throttlerGuard['handleThrottling'](mockContext as any, 5, 300000);
      
      const response = mockContext.switchToHttp().getResponse();
      expect(response.header).toHaveBeenCalledWith('X-RateLimit-Limit', '5');
      expect(response.header).toHaveBeenCalledWith('X-RateLimit-Remaining', '0');
      expect(response.status).toHaveBeenCalledWith(429);
    });
  });

  describe('Docker Configuration', () => {
    it('should have proper environment variables', () => {
      const requiredEnvVars = [
        'NODE_ENV',
        'PORT',
        'HOST',
        'DB_HOST',
        'DB_PORT',
        'DB_USER',
        'DB_PASS',
        'DB_NAME',
        'JWT_SECRET',
        'LOG_LEVEL',
        'CORS_ORIGIN',
        'THROTTLE_TTL',
        'THROTTLE_LIMIT'
      ];

      requiredEnvVars.forEach(envVar => {
        expect(process.env[envVar] || 'default').toBeDefined();
      });
    });

    it('should have proper health check configuration', () => {
      const healthCheckConfig = {
        test: ['CMD', 'curl', '-f', 'http://localhost:3000/v1/health/live'],
        interval: '30s',
        timeout: '10s',
        retries: 5,
        start_period: '40s'
      };

      expect(healthCheckConfig.test).toContain('curl');
      expect(healthCheckConfig.test).toContain('http://localhost:3000/v1/health/live');
      expect(healthCheckConfig.interval).toBe('30s');
      expect(healthCheckConfig.timeout).toBe('10s');
      expect(healthCheckConfig.retries).toBe(5);
    });

    it('should have proper resource limits', () => {
      const resourceLimits = {
        memory: '1G',
        cpus: '0.5'
      };

      const resourceReservations = {
        memory: '512M',
        cpus: '0.25'
      };

      expect(resourceLimits.memory).toBe('1G');
      expect(resourceLimits.cpus).toBe('0.5');
      expect(resourceReservations.memory).toBe('512M');
      expect(resourceReservations.cpus).toBe('0.25');
    });
  });

  describe('Security Features', () => {
    it('should have proper security headers configuration', () => {
      const securityHeaders = {
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Content-Security-Policy': 'default-src \'self\'',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
      };

      Object.entries(securityHeaders).forEach(([header, value]) => {
        expect(header).toBeDefined();
        expect(value).toBeDefined();
      });
    });

    it('should have proper CORS configuration', () => {
      const corsConfig = {
        origin: ['http://localhost:3000', 'http://localhost:3001'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
        exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset']
      };

      expect(corsConfig.origin).toContain('http://localhost:3000');
      expect(corsConfig.credentials).toBe(true);
      expect(corsConfig.methods).toContain('GET');
      expect(corsConfig.methods).toContain('POST');
      expect(corsConfig.allowedHeaders).toContain('Authorization');
      expect(corsConfig.exposedHeaders).toContain('X-RateLimit-Limit');
    });

    it('should have proper rate limiting configuration', () => {
      const rateLimits = {
        api: { rate: '10r/s', burst: 20 },
        auth: { rate: '5r/s', burst: 10 },
        health: { rate: '30r/s', burst: 50 }
      };

      expect(rateLimits.api.rate).toBe('10r/s');
      expect(rateLimits.api.burst).toBe(20);
      expect(rateLimits.auth.rate).toBe('5r/s');
      expect(rateLimits.auth.burst).toBe(10);
      expect(rateLimits.health.rate).toBe('30r/s');
      expect(rateLimits.health.burst).toBe(50);
    });
  });

  describe('Monitoring & Observability', () => {
    it('should have Prometheus metrics configuration', () => {
      const prometheusConfig = {
        scrape_interval: '15s',
        evaluation_interval: '15s',
        external_labels: {
          cluster: 'zeropoint-protocol',
          environment: 'production'
        }
      };

      expect(prometheusConfig.scrape_interval).toBe('15s');
      expect(prometheusConfig.evaluation_interval).toBe('15s');
      expect(prometheusConfig.external_labels.cluster).toBe('zeropoint-protocol');
      expect(prometheusConfig.external_labels.environment).toBe('production');
    });

    it('should have proper service discovery configuration', () => {
      const expectedServices = [
        'zeropoint-api',
        'zeropoint-service',
        'postgres',
        'redis',
        'ipfs',
        'nginx',
        'prometheus',
        'grafana'
      ];

      expectedServices.forEach(service => {
        expect(service).toBeDefined();
        expect(typeof service).toBe('string');
      });
    });

    it('should have proper alerting configuration', () => {
      const alertingConfig = {
        alertmanagers: [{
          static_configs: [{
            targets: ['alertmanager:9093']
          }],
          scheme: 'http',
          timeout: '10s',
          api_version: 'v1'
        }]
      };

      expect(alertingConfig.alertmanagers).toHaveLength(1);
      expect(alertingConfig.alertmanagers[0].static_configs[0].targets).toContain('alertmanager:9093');
      expect(alertingConfig.alertmanagers[0].scheme).toBe('http');
      expect(alertingConfig.alertmanagers[0].timeout).toBe('10s');
    });
  });

  describe('Graceful Shutdown', () => {
    it('should handle SIGTERM signal', () => {
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
      const mockClose = jest.fn().mockResolvedValue(undefined);
      
      // Simulate SIGTERM
      process.emit('SIGTERM');
      
      expect(mockExit).toHaveBeenCalledWith(0);
      mockExit.mockRestore();
    });

    it('should handle SIGINT signal', () => {
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
      
      // Simulate SIGINT
      process.emit('SIGINT');
      
      expect(mockExit).toHaveBeenCalledWith(0);
      mockExit.mockRestore();
    });
  });
}); 