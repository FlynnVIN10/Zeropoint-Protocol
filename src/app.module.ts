// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
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
import { ThrottlerModule } from '@nestjs/throttler';
import { CustomThrottlerGuard } from './guards/throttler.guard.js';
import { EnhancedPetalsService } from './agents/train/enhanced-petals.service.js';
import { ServiceOrchestrator } from './agents/orchestration/service-orchestrator.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'password'),
        database: configService.get<string>('DB_DATABASE', 'zeropoint_protocol'),
        entities: [User, Session, AuditLog, AgentState],
        synchronize: configService.get<boolean>('DB_SYNC', false), // Disable in production
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
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '15m' }
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 20 }]),
  ],
  controllers: [AppController, HealthController, AuthController, AgentStateController],
  providers: [
    AppService, 
    AuthService, 
    AgentStateService,
    JwtStrategy, 
    JwtAuthGuard,
    EnhancedPetalsService,
    ServiceOrchestrator,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
