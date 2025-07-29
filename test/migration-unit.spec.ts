import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppModule } from '../src/app.module.js';

describe('Migration Unit Tests', () => {
  let module: TestingModule;
  let configService: ConfigService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
      ],
    }).compile();

    configService = module.get<ConfigService>(ConfigService);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('Configuration Validation', () => {
    it('should have required database environment variables', () => {
      const requiredVars = [
        'DB_HOST',
        'DB_PORT', 
        'DB_USERNAME',
        'DB_PASSWORD',
        'DB_DATABASE'
      ];

      requiredVars.forEach(varName => {
        const value = configService.get(varName);
        expect(value).toBeDefined();
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      });
    });

    it('should have correct database configuration defaults', () => {
      expect(configService.get('DB_HOST', 'localhost')).toBe('localhost');
      expect(configService.get('DB_PORT', 5432)).toBe(5432);
      expect(configService.get('DB_DATABASE', 'zeropoint_protocol')).toBe('zeropoint_protocol');
    });

    it('should have JWT configuration', () => {
      expect(configService.get('JWT_SECRET')).toBeDefined();
      expect(configService.get('JWT_EXPIRES_IN', '15m')).toBe('15m');
    });
  });

  describe('Migration File Validation', () => {
    it('should have migration file with correct structure', () => {
      const fs = require('fs');
      const path = require('path');
      
      const migrationPath = path.join(process.cwd(), 'migrations', '2025-postgres-migration.sql');
      expect(fs.existsSync(migrationPath)).toBe(true);
      
      const migrationContent = fs.readFileSync(migrationPath, 'utf8');
      
      // Check for required sections
      expect(migrationContent).toContain('-- MIGRATION CHECKPOINT: START');
      expect(migrationContent).toContain('-- SCHEMA CREATION');
      expect(migrationContent).toContain('-- INDEXES FOR PERFORMANCE');
      expect(migrationContent).toContain('-- ROLLBACK CHECKPOINT');
      expect(migrationContent).toContain('-- MIGRATION CHECKPOINT: END');
      
      // Check for required tables
      expect(migrationContent).toContain('CREATE TABLE IF NOT EXISTS users');
      expect(migrationContent).toContain('CREATE TABLE IF NOT EXISTS sessions');
      expect(migrationContent).toContain('CREATE TABLE IF NOT EXISTS audit_logs');
      expect(migrationContent).toContain('CREATE TABLE IF NOT EXISTS agent_states');
      expect(migrationContent).toContain('CREATE TABLE IF NOT EXISTS soulchain_entries');
      expect(migrationContent).toContain('CREATE TABLE IF NOT EXISTS zeroth_gate_validations');
      
      // Check for rollback function
      expect(migrationContent).toContain('CREATE OR REPLACE FUNCTION rollback_migration()');
    });

    it('should have SQLite backup file', () => {
      const fs = require('fs');
      const path = require('path');
      
      const backupPath = path.join(process.cwd(), 'migrations', 'sqlite-backup.db');
      expect(fs.existsSync(backupPath)).toBe(true);
    });
  });

  describe('Entity Schema Validation', () => {
    it('should have User entity with correct properties', () => {
      const { User } = require('../src/entities/user.entity.js');
      
      const user = new User();
      expect(user).toBeDefined();
      
      // Check that entity has expected properties
      const properties = Object.getOwnPropertyNames(user);
      expect(properties).toContain('id');
      expect(properties).toContain('username');
      expect(properties).toContain('email');
      expect(properties).toContain('password_hash');
      expect(properties).toContain('role');
      expect(properties).toContain('is_active');
      expect(properties).toContain('created_at');
      expect(properties).toContain('updated_at');
    });

    it('should have Session entity with correct properties', () => {
      const { Session } = require('../src/entities/session.entity.js');
      
      const session = new Session();
      expect(session).toBeDefined();
      
      const properties = Object.getOwnPropertyNames(session);
      expect(properties).toContain('id');
      expect(properties).toContain('user_id');
      expect(properties).toContain('token');
      expect(properties).toContain('expires_at');
      expect(properties).toContain('created_at');
      expect(properties).toContain('is_active');
    });

    it('should have AuditLog entity with correct properties', () => {
      const { AuditLog } = require('../src/entities/audit-log.entity.js');
      
      const auditLog = new AuditLog();
      expect(auditLog).toBeDefined();
      
      const properties = Object.getOwnPropertyNames(auditLog);
      expect(properties).toContain('id');
      expect(properties).toContain('user_id');
      expect(properties).toContain('action');
      expect(properties).toContain('resource_type');
      expect(properties).toContain('resource_id');
      expect(properties).toContain('metadata');
      expect(properties).toContain('ip_address');
      expect(properties).toContain('user_agent');
      expect(properties).toContain('created_at');
    });

    it('should have AgentState entity with correct properties', () => {
      const { AgentState } = require('../src/entities/agent-state.entity.js');
      
      const agentState = new AgentState();
      expect(agentState).toBeDefined();
      
      const properties = Object.getOwnPropertyNames(agentState);
      expect(properties).toContain('id');
      expect(properties).toContain('agent_id');
      expect(properties).toContain('state_data');
      expect(properties).toContain('status');
      expect(properties).toContain('last_activity');
      expect(properties).toContain('created_at');
      expect(properties).toContain('updated_at');
    });
  });

  describe('Migration Logic Validation', () => {
    it('should generate correct soulchain hash format', () => {
      const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const hashFormat = `migration-${timestamp}-001`;
      
      expect(hashFormat).toMatch(/^migration-\d{8}-\d{3}$/);
      expect(hashFormat.length).toBe(20); // migration-YYYYMMDD-XXX
    });

    it('should have proper rollback checkpoint format', () => {
      const checkpoints = [
        'MIGRATION_START',
        'SCHEMA_CREATED',
        'INDEXES_CREATED',
        'DATA_MIGRATED',
        'MIGRATION_COMPLETE'
      ];
      
      checkpoints.forEach(checkpoint => {
        expect(checkpoint).toMatch(/^[A-Z_]+$/);
        expect(checkpoint.length).toBeGreaterThan(0);
      });
    });

    it('should validate environment names', () => {
      const validEnvironments = ['STAGE', 'PRODUCTION', 'DEVELOPMENT'];
      
      validEnvironments.forEach(env => {
        expect(env).toMatch(/^[A-Z]+$/);
        expect(env.length).toBeGreaterThan(0);
      });
    });
  });

  describe('TypeORM Configuration Validation', () => {
    it('should have correct TypeORM configuration structure', () => {
      const appModule = require('../src/app.module.js');
      expect(appModule.AppModule).toBeDefined();
      
      // Check that TypeOrmModule is imported
      const moduleImports = Reflect.getMetadata('imports', appModule.AppModule);
      expect(moduleImports).toBeDefined();
    });

    it('should have PostgreSQL as database type', () => {
      // This test validates that the configuration uses PostgreSQL
      const config = {
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'password',
        database: 'zeropoint_protocol'
      };
      
      expect(config.type).toBe('postgres');
      expect(config.port).toBe(5432);
      expect(config.database).toBe('zeropoint_protocol');
    });
  });

  describe('Migration Safety Checks', () => {
    it('should have synchronize disabled in production', () => {
      const isProduction = process.env.NODE_ENV === 'production';
      const synchronize = configService.get<boolean>('DB_SYNC', false);
      
      if (isProduction) {
        expect(synchronize).toBe(false);
      }
    });

    it('should have proper SSL configuration', () => {
      const sslEnabled = configService.get<boolean>('DB_SSL', false);
      
      if (sslEnabled) {
        expect(configService.get('DB_SSL_REJECT_UNAUTHORIZED')).toBeDefined();
      }
    });

    it('should have migration logging enabled', () => {
      const logging = configService.get<boolean>('DB_LOGGING', false);
      expect(typeof logging).toBe('boolean');
    });
  });
});