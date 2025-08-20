import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { getConnection } from "typeorm";
import { User } from "../src/entities/user.entity.js";
import { Session } from "../src/entities/session.entity.js";
import { AuditLog } from "../src/entities/audit-log.entity.js";
import { AgentState } from "../src/entities/agent-state.entity.js";

describe("Database Migration Integration Tests", () => {
  let module: TestingModule;
  let configService: ConfigService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ".env.test",
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            type: "postgres",
            host: configService.get<string>("DB_HOST", "localhost"),
            port: configService.get<number>("DB_PORT", 5432),
            username: configService.get<string>("DB_USERNAME", "postgres"),
            password: configService.get<string>("DB_PASSWORD", "password"),
            database: configService.get<string>(
              "DB_DATABASE",
              "zeropoint_protocol_test",
            ),
            entities: [User, Session, AuditLog, AgentState],
            synchronize: true, // Enable for testing
            logging: false,
            dropSchema: true, // Clean slate for tests
          }),
          inject: [ConfigService],
        }),
      ],
    }).compile();

    configService = module.get<ConfigService>(ConfigService);
  });

  afterAll(async () => {
    await module.close();
  });

  describe("Database Connection", () => {
    it("should connect to PostgreSQL database", async () => {
      const connection = getConnection();
      expect(connection.isConnected).toBe(true);
      expect(connection.options.type).toBe("postgres");
    });

    it("should have correct database configuration", () => {
      expect(configService.get("DB_HOST")).toBeDefined();
      expect(configService.get("DB_PORT")).toBeDefined();
      expect(configService.get("DB_DATABASE")).toBeDefined();
    });
  });

  describe("Entity Schema Validation", () => {
    it("should create users table with correct schema", async () => {
      const connection = getConnection();
      const queryRunner = connection.createQueryRunner();

      const tableExists = await queryRunner.hasTable("users");
      expect(tableExists).toBe(true);

      const columns = await queryRunner.getColumns("users");
      const columnNames = columns.map((col) => col.name);

      expect(columnNames).toContain("id");
      expect(columnNames).toContain("username");
      expect(columnNames).toContain("email");
      expect(columnNames).toContain("password_hash");
      expect(columnNames).toContain("role");
      expect(columnNames).toContain("is_active");
      expect(columnNames).toContain("created_at");
      expect(columnNames).toContain("updated_at");

      await queryRunner.release();
    });

    it("should create sessions table with correct schema", async () => {
      const connection = getConnection();
      const queryRunner = connection.createQueryRunner();

      const tableExists = await queryRunner.hasTable("sessions");
      expect(tableExists).toBe(true);

      const columns = await queryRunner.getColumns("sessions");
      const columnNames = columns.map((col) => col.name);

      expect(columnNames).toContain("id");
      expect(columnNames).toContain("user_id");
      expect(columnNames).toContain("token");
      expect(columnNames).toContain("expires_at");
      expect(columnNames).toContain("created_at");
      expect(columnNames).toContain("is_active");

      await queryRunner.release();
    });

    it("should create audit_logs table with correct schema", async () => {
      const connection = getConnection();
      const queryRunner = connection.createQueryRunner();

      const tableExists = await queryRunner.hasTable("audit_logs");
      expect(tableExists).toBe(true);

      const columns = await queryRunner.getColumns("audit_logs");
      const columnNames = columns.map((col) => col.name);

      expect(columnNames).toContain("id");
      expect(columnNames).toContain("user_id");
      expect(columnNames).toContain("action");
      expect(columnNames).toContain("resource_type");
      expect(columnNames).toContain("resource_id");
      expect(columnNames).toContain("metadata");
      expect(columnNames).toContain("ip_address");
      expect(columnNames).toContain("user_agent");
      expect(columnNames).toContain("created_at");

      await queryRunner.release();
    });

    it("should create agent_states table with correct schema", async () => {
      const connection = getConnection();
      const queryRunner = connection.createQueryRunner();

      const tableExists = await queryRunner.hasTable("agent_states");
      expect(tableExists).toBe(true);

      const columns = await queryRunner.getColumns("agent_states");
      const columnNames = columns.map((col) => col.name);

      expect(columnNames).toContain("id");
      expect(columnNames).toContain("agent_id");
      expect(columnNames).toContain("state_data");
      expect(columnNames).toContain("status");
      expect(columnNames).toContain("last_activity");
      expect(columnNames).toContain("created_at");
      expect(columnNames).toContain("updated_at");

      await queryRunner.release();
    });
  });

  describe("Index Validation", () => {
    it("should have required indexes on users table", async () => {
      const connection = getConnection();
      const queryRunner = connection.createQueryRunner();

      const indexes = await queryRunner.getIndices("users");
      const indexNames = indexes.map((idx) => idx.name);

      expect(indexNames).toContain("IDX_users_email");
      expect(indexNames).toContain("IDX_users_username");
      expect(indexNames).toContain("IDX_users_role");

      await queryRunner.release();
    });

    it("should have required indexes on sessions table", async () => {
      const connection = getConnection();
      const queryRunner = connection.createQueryRunner();

      const indexes = await queryRunner.getIndices("sessions");
      const indexNames = indexes.map((idx) => idx.name);

      expect(indexNames).toContain("IDX_sessions_user_id");
      expect(indexNames).toContain("IDX_sessions_token");
      expect(indexNames).toContain("IDX_sessions_expires_at");

      await queryRunner.release();
    });

    it("should have required indexes on audit_logs table", async () => {
      const connection = getConnection();
      const queryRunner = connection.createQueryRunner();

      const indexes = await queryRunner.getIndices("audit_logs");
      const indexNames = indexes.map((idx) => idx.name);

      expect(indexNames).toContain("IDX_audit_logs_user_id");
      expect(indexNames).toContain("IDX_audit_logs_action");
      expect(indexNames).toContain("IDX_audit_logs_created_at");

      await queryRunner.release();
    });
  });

  describe("Data Operations", () => {
    it("should insert and retrieve user data", async () => {
      const userRepository = getConnection().getRepository(User);

      const testUser = userRepository.create({
        username: "testuser",
        email: "test@example.com",
        password_hash: "$2b$10$test.hash",
        role: "user",
        is_active: true,
      });

      const savedUser = await userRepository.save(testUser);
      expect(savedUser.id).toBeDefined();
      expect(savedUser.username).toBe("testuser");
      expect(savedUser.email).toBe("test@example.com");

      const retrievedUser = await userRepository.findOne({
        where: { id: savedUser.id },
      });
      expect(retrievedUser).toBeDefined();
      expect(retrievedUser?.username).toBe("testuser");
    });

    it("should insert and retrieve session data", async () => {
      const sessionRepository = getConnection().getRepository(Session);
      const userRepository = getConnection().getRepository(User);

      // Create a test user first
      const testUser = await userRepository.save(
        userRepository.create({
          username: "sessionuser",
          email: "session@example.com",
          password_hash: "$2b$10$test.hash",
          role: "user",
        }),
      );

      const testSession = sessionRepository.create({
        user_id: testUser.id,
        token: "test-token-123",
        expires_at: new Date(Date.now() + 3600000), // 1 hour from now
        is_active: true,
      });

      const savedSession = await sessionRepository.save(testSession);
      expect(savedSession.id).toBeDefined();
      expect(savedSession.token).toBe("test-token-123");
      expect(savedSession.user_id).toBe(testUser.id);
    });

    it("should insert and retrieve audit log data", async () => {
      const auditRepository = getConnection().getRepository(AuditLog);
      const userRepository = getConnection().getRepository(User);

      // Create a test user first
      const testUser = await userRepository.save(
        userRepository.create({
          username: "audituser",
          email: "audit@example.com",
          password_hash: "$2b$10$test.hash",
          role: "user",
        }),
      );

      const testAudit = auditRepository.create({
        user_id: testUser.id,
        action: "LOGIN",
        resource_type: "user",
        resource_id: testUser.id.toString(),
        metadata: { ip: "127.0.0.1", user_agent: "test-agent" },
        ip_address: "127.0.0.1",
        user_agent: "test-agent",
      });

      const savedAudit = await auditRepository.save(testAudit);
      expect(savedAudit.id).toBeDefined();
      expect(savedAudit.action).toBe("LOGIN");
      expect(savedAudit.user_id).toBe(testUser.id);
    });

    it("should insert and retrieve agent state data", async () => {
      const agentRepository = getConnection().getRepository(AgentState);

      const testAgent = agentRepository.create({
        agent_id: "test-agent-001",
        state_data: { status: "active", last_command: "ping" },
        status: "active",
        last_activity: new Date(),
      });

      const savedAgent = await agentRepository.save(testAgent);
      expect(savedAgent.id).toBeDefined();
      expect(savedAgent.agent_id).toBe("test-agent-001");
      expect(savedAgent.status).toBe("active");
    });
  });

  describe("Foreign Key Constraints", () => {
    it("should enforce foreign key constraints", async () => {
      const sessionRepository = getConnection().getRepository(Session);

      // Try to create a session with non-existent user_id
      const invalidSession = sessionRepository.create({
        user_id: 99999, // Non-existent user
        token: "invalid-token",
        expires_at: new Date(),
        is_active: true,
      });

      await expect(sessionRepository.save(invalidSession)).rejects.toThrow();
    });
  });

  describe("JSONB Operations", () => {
    it("should handle JSONB metadata in audit logs", async () => {
      const auditRepository = getConnection().getRepository(AuditLog);

      const complexMetadata = {
        request_id: "req-123",
        headers: { "user-agent": "test-browser" },
        params: { action: "test" },
        timestamp: new Date().toISOString(),
      };

      const testAudit = auditRepository.create({
        action: "API_CALL",
        resource_type: "endpoint",
        resource_id: "/v1/test",
        metadata: complexMetadata,
        ip_address: "127.0.0.1",
        user_agent: "test-browser",
      });

      const savedAudit = await auditRepository.save(testAudit);
      expect(savedAudit.metadata).toEqual(complexMetadata);

      // Test JSONB query
      const foundAudit = await auditRepository.findOne({
        where: { metadata: { request_id: "req-123" } },
      });
      expect(foundAudit).toBeDefined();
    });
  });
});
