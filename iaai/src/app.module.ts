// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { AuthController } from "./controllers/auth.controller.js";
// import { AuthService } from './services/auth.service.js';
import { HealthController } from "./controllers/health.controller.js";
import { AgentStateController } from "./controllers/agent-state.controller.js";
import { AgentStateService } from "./services/agent-state.service.js";
import { HttpModule } from "@nestjs/axios";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PassportModule } from "@nestjs/passport";
import { User } from "./entities/user.entity.js";
import { Session } from "./entities/session.entity.js";
import { AuditLog } from "./entities/audit-log.entity.js";
import { AgentState } from "./entities/agent-state.entity.js";
import { JwtModule } from "@nestjs/jwt";
// import { JwtStrategy } from './strategies/jwt.strategy.js';
import { JwtAuthGuard } from "./guards/jwt-auth.guard.js";
import { ThrottlerModule } from "@nestjs/throttler";
import { CustomThrottlerGuard } from "./guards/throttler.guard.js";
import { EnhancedPetalsService } from "./agents/train/enhanced-petals.service.js";
import { ServiceOrchestrator } from "./agents/orchestration/service-orchestrator.js";
import { SecurityLoggingInterceptor } from "./interceptors/security-logging.interceptor.js";
import { PerformanceMonitorInterceptor } from "./interceptors/performance-monitor.interceptor.js";
// import { SecurityMiddleware } from './middleware/security.middleware.js';
import { KeyRotationService } from "./services/key-rotation.service.js";
import { PerformanceOptimizerService } from "./services/performance-optimizer.service.js";
import { RedisCacheService } from "./services/redis-cache.service.js";
import { ConnectionPoolService } from "./services/connection-pool.service.js";
import { CircuitBreakerService } from "./services/circuit-breaker.service.js";
// import { OAuthService } from './services/oauth.service.js';
// import { OAuthController } from './controllers/oauth.controller.js';
import { UIController } from "./controllers/ui.controller.js";
import { ChatController } from "./controllers/chat.controller.js";
import { PetalsController } from "./controllers/petals.controller.js";
import { DashboardController } from "./controllers/dashboard.controller.js";
import { GenerateController } from "./controllers/generate.controller.js";
import { UserRoleController } from "./controllers/user-role.controller.js";
import { ConsensusController } from "./controllers/consensus.controller.js";
import { AgentController } from "./controllers/agent.controller.js";
import { SandboxController } from "./controllers/sandbox.controller.js";
import { RAGController } from "./controllers/rag.controller.js";
import { SSEController } from "./controllers/sse.controller.js";
import { PerformanceController } from "./controllers/performance.controller.js";
import { PetalsService } from "./services/petals.service.js";
import { SandboxService } from "./services/sandbox.service.js";
import { TelemetryService } from "./services/telemetry.service.js";
import { ConsensusEngineService } from "./services/consensus-engine.service.js";
import { DashboardService } from "./services/dashboard.service.js";
import { GenerateService } from "./services/generate.service.js";
// import { MultiLLMService } from './services/multi-llm.service.js';
import { UserRoleService } from "./services/user-role.service.js";
import { ConsensusService } from "./services/consensus.service.js";
import { AgentService } from "./services/agent.service.js";
import { RAGService } from "./services/rag.service.js";
import { PerformanceMonitorService } from "./services/performance-monitor.service.js";
import { MultiLLMService } from "./services/multi-llm.service.js";
import { StreamController } from "./controllers/stream.controller.js";
import { ApplianceStatusController } from "./controllers/appliance-status.controller.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
    HttpModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get<string>("DATABASE_HOST", "localhost"),
        port: configService.get<number>("DATABASE_PORT", 5432),
        username: configService.get<string>("DATABASE_USERNAME", "zeropoint"),
        password: configService.get<string>(
          "DATABASE_PASSWORD",
          "zeropointpass",
        ),
        database: configService.get<string>("DATABASE_NAME", "zeropointdb"),
        entities: [User, Session, AuditLog, AgentState],
        synchronize: configService.get<boolean>("DB_SYNC", false), // Disable for now to avoid schema conflicts
        logging: configService.get<boolean>("DB_LOGGING", false),
        ssl: configService.get<boolean>("DB_SSL", false)
          ? { rejectUnauthorized: false }
          : false,
        migrations: ["migrations/*.sql"],
        migrationsRun: false, // Manual migration control
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Session, AuditLog, AgentState]),
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET", "zeropoint-secret"),
        signOptions: { expiresIn: "24h" },
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 100,
      },
      {
        name: 'auth',
        ttl: 60000,
        limit: 5,
      },
      {
        name: 'strict',
        ttl: 60000,
        limit: 3,
      },
    ]),
  ],
  controllers: [
    AppController,
    AuthController,
    HealthController,
    AgentStateController,
    UIController,
    ChatController,
    PetalsController,
    DashboardController,
    GenerateController,
    UserRoleController,
    ConsensusController,
    AgentController,
    SandboxController,
    RAGController,
    SSEController,
    PerformanceController,
    StreamController,
    ApplianceStatusController,
  ],
  providers: [
    AppService,
    // AuthService,
    AgentStateService,
    EnhancedPetalsService,
    ServiceOrchestrator,
    KeyRotationService,
    PerformanceOptimizerService,
    RedisCacheService,
    ConnectionPoolService,
    CircuitBreakerService,
    // OAuthService,
    PetalsService,
    SandboxService,
    TelemetryService,
    ConsensusEngineService,
    DashboardService,
    GenerateService,
    MultiLLMService,
    UserRoleService,
    ConsensusService,
    AgentService,
    RAGService,
    PerformanceMonitorService,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SecurityLoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: PerformanceMonitorInterceptor,
    },
  ],
})
export class AppModule {
  constructor(private configService: ConfigService) {
    // OWASP Security Headers Configuration
    this.configureSecurityHeaders();
  }

  private configureSecurityHeaders() {
    // Security headers configuration
    const securityConfig = {
      // Content Security Policy
      csp: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      // Other security headers
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      xFrameOptions: "DENY",
      xContentTypeOptions: "nosniff",
      referrerPolicy: "strict-origin-when-cross-origin",
      permissionsPolicy: {
        features: {
          camera: ["'none'"],
          microphone: ["'none'"],
          geolocation: ["'none'"],
        },
      },
    };

    console.log('🔒 OWASP Security Headers configured:', securityConfig);
  }
}
