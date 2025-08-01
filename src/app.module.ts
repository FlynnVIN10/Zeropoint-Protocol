// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthController } from './controllers/auth.controller.js';
import { AuthService } from './services/auth.service.js';
import { HealthController } from './controllers/health.controller.js';
import { AgentStateController } from './controllers/agent-state.controller.js';
import { AgentStateService } from './services/agent-state.service.js';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { User } from './entities/user.entity.js';
import { Session } from './entities/session.entity.js';
import { AuditLog } from './entities/audit-log.entity.js';
import { AgentState } from './entities/agent-state.entity.js';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { OAuthAuthGuard } from './guards/oauth-auth.guard.js';
import { ThrottlerModule } from '@nestjs/throttler';
import { CustomThrottlerGuard } from './guards/throttler.guard.js';
import { EnhancedPetalsService } from './agents/train/enhanced-petals.service.js';
import { ServiceOrchestrator } from './agents/orchestration/service-orchestrator.js';
import { SecurityLoggingInterceptor } from './interceptors/security-logging.interceptor.js';
import { SecurityMiddleware } from './middleware/security.middleware.js';
import { KeyRotationService } from './services/key-rotation.service.js';
import { PerformanceOptimizerService } from './services/performance-optimizer.service.js';
import { RedisCacheService } from './services/redis-cache.service.js';
import { ConnectionPoolService } from './services/connection-pool.service.js';
import { CircuitBreakerService } from './services/circuit-breaker.service.js';
import { OAuthService } from './services/oauth.service.js';
import { OAuthController } from './controllers/oauth.controller.js';
import { UIController } from './controllers/ui.controller.js';
import { ChatController } from './controllers/chat.controller.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST', 'localhost'),
        port: configService.get<number>('DATABASE_PORT', 5432),
        username: configService.get<string>('DATABASE_USERNAME', 'zeropoint'),
        password: configService.get<string>('DATABASE_PASSWORD', 'zeropointpass'),
        database: configService.get<string>('DATABASE_NAME', 'zeropointdb'),
        entities: [User, Session, AuditLog, AgentState],
        synchronize: configService.get<boolean>('DB_SYNC', false), // Disable for now to avoid schema conflicts
        logging: configService.get<boolean>('DB_LOGGING', false),
        ssl: configService.get<boolean>('DB_SSL', false) ? { rejectUnauthorized: false } : false,
        migrations: ['migrations/*.sql'],
        migrationsRun: false, // Manual migration control
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Session, AuditLog, AgentState]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { 
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '15m',
          issuer: 'zeropoint-protocol',
          audience: 'zeropoint-api'
        },
        verifyOptions: {
          issuer: 'zeropoint-protocol',
          audience: 'zeropoint-api'
        }
      }),
      inject: [ConfigService],
    }),
    // Enhanced throttling with different limits for different endpoints
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 20,
      },
      {
        name: 'auth',
        ttl: 60000,
        limit: 5, // Stricter for auth endpoints
      },
      {
        name: 'api',
        ttl: 60000,
        limit: 100, // Higher for general API
      },
      {
        name: 'strict',
        ttl: 60000,
        limit: 3, // Very strict for sensitive operations
      }
    ]),
  ],
  controllers: [AppController, HealthController, OAuthController, AuthController, AgentStateController, UIController, ChatController],
  providers: [
    AppService, 
    AuthService, 
    AgentStateService,
    JwtStrategy,
    EnhancedPetalsService,
    ServiceOrchestrator,
    SecurityMiddleware,
    KeyRotationService,
    PerformanceOptimizerService,
    RedisCacheService,
    ConnectionPoolService,
    CircuitBreakerService,
    AuthService,
    OAuthService,
    // {
    //   provide: APP_GUARD,
    //   useClass: OAuthAuthGuard,
    // },
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SecurityLoggingInterceptor,
    },
    {
      provide: 'ENABLE_SCALING',
      useFactory: (configService: ConfigService) => configService.get<boolean>('ENABLE_SCALING', true),
      inject: [ConfigService],
    },
    {
      provide: 'SCALING_CONFIG',
      useFactory: async () => {
        try {
          const fs = await import('fs/promises');
          const path = await import('path');
          const configPath = path.join(process.cwd(), 'src', 'config', 'scaling.json');
          const configData = await fs.readFile(configPath, 'utf8');
          return JSON.parse(configData);
        } catch (error) {
          return {
            maxAgents: 100,
            maxConcurrency: 25,
            maxRequestsPerSec: 50
          };
        }
      },
    },
  ],
})
export class AppModule {}
