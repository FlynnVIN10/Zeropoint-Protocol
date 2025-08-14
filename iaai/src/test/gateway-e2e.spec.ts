// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../app.module.js";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "../entities/user.entity.js";
import { of, throwError } from "rxjs";

// Mock external dependencies
jest.mock("../agents/soulchain/soulchain.ledger.js", () => ({
  soulchain: {
    addXPTransaction: jest.fn().mockResolvedValue({ cid: "test-cid" }),
    getLedgerMetrics: jest.fn().mockResolvedValue("test-metrics"),
    persistLedgerToIPFS: jest.fn().mockResolvedValue("test-persist-cid"),
  },
}));

jest.mock("../agents/train/petals.bridge.js", () => ({
  callPetalsAPI: jest.fn().mockResolvedValue({ response: "test-response" }),
  logTrainingCycle: jest.fn().mockResolvedValue(true),
  formatProposal: jest.fn().mockReturnValue({ formatted: "proposal" }),
}));

jest.mock("../guards/synthient.guard.js", () => ({
  checkIntent: jest.fn().mockReturnValue(true),
}));

describe("Gateway E2E Tests (Phase 2)", () => {
  let app: INestApplication;
  let httpService: HttpService;

  const mockHttpService = {
    post: jest.fn(),
    get: jest.fn(),
  };

  const mockUserRepository = {
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue("http://localhost:8000"),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .overrideProvider(HttpService)
      .useValue(mockHttpService)
      .overrideProvider(getRepositoryToken(User))
      .useValue(mockUserRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    httpService = moduleFixture.get<HttpService>(HttpService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Core Gateway Endpoints", () => {
    it("/v1 (GET) - should return gateway welcome message", () => {
      return request(app.getHttpServer())
        .get("/v1")
        .expect(200)
        .expect("Zeropoint Protocol API Gateway v1.0");
    });

    it("/v1/status (GET) - should return gateway status", () => {
      return request(app.getHttpServer())
        .get("/v1/status")
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty(
            "service",
            "Zeropoint Protocol API Gateway",
          );
          expect(res.body).toHaveProperty("version", "1.0.0");
          expect(res.body).toHaveProperty("status", "operational");
          expect(res.body).toHaveProperty("timestamp");
          expect(res.body).toHaveProperty("endpoints");
        });
    });

    it("/v1/health (GET) - should return health status", () => {
      mockHttpService.get.mockReturnValue(of({ status: 200 }));

      return request(app.getHttpServer())
        .get("/v1/health")
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("status", "ok");
          expect(res.body).toHaveProperty("timestamp");
          expect(res.body).toHaveProperty("services");
          expect(res.body).toHaveProperty("metrics");
        });
    });

    it("/v1/metrics (GET) - should return Prometheus metrics", () => {
      return request(app.getHttpServer())
        .get("/v1/metrics")
        .expect(200)
        .expect("Content-Type", /text\/plain/);
    });

    it("/v1/ledger-metrics (GET) - should return soulchain metrics", () => {
      return request(app.getHttpServer())
        .get("/v1/ledger-metrics")
        .expect(200)
        .expect("Content-Type", /text\/plain/);
    });
  });

  describe("Python Backend Integration", () => {
    it("/v1/generate-text (POST) - should forward to Python backend", () => {
      const mockResponse = {
        data: { generated_text: "Test response from Python backend" },
      };
      mockHttpService.post.mockReturnValue(of(mockResponse));

      return request(app.getHttpServer())
        .post("/v1/generate-text")
        .send({
          text: "Test prompt for text generation",
          options: { max_length: 100 },
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(mockResponse.data);
          expect(mockHttpService.post).toHaveBeenCalledWith(
            "http://localhost:8000/v1/generate-text",
            {
              text: "Test prompt for text generation",
              options: { max_length: 100 },
            },
            expect.objectContaining({
              timeout: 30000,
              headers: {
                "Content-Type": "application/json",
                "X-Zeropoint-Gateway": "true",
              },
            }),
          );
        });
    });

    it("/v1/generate-image (POST) - should forward to Python backend", () => {
      const mockResponse = {
        data: { image_url: "test-image.jpg", cid: "test-cid" },
      };
      mockHttpService.post.mockReturnValue(of(mockResponse));

      return request(app.getHttpServer())
        .post("/v1/generate-image")
        .send({
          prompt: "A beautiful sunset over mountains",
          options: { size: "512x512", style: "realistic" },
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(mockResponse.data);
          expect(mockHttpService.post).toHaveBeenCalledWith(
            "http://localhost:8000/v1/generate-image",
            {
              prompt: "A beautiful sunset over mountains",
              options: { size: "512x512", style: "realistic" },
            },
            expect.any(Object),
          );
        });
    });

    it("/v1/generate-code (POST) - should forward to Python backend", () => {
      const mockResponse = {
        data: { code: 'console.log("Hello, World!");', language: "javascript" },
      };
      mockHttpService.post.mockReturnValue(of(mockResponse));

      return request(app.getHttpServer())
        .post("/v1/generate-code")
        .send({
          prompt: "Create a hello world function",
          language: "javascript",
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(mockResponse.data);
          expect(mockHttpService.post).toHaveBeenCalledWith(
            "http://localhost:8000/v1/generate-code",
            {
              prompt: "Create a hello world function",
              language: "javascript",
            },
            expect.any(Object),
          );
        });
    });

    it("/v1/generate (POST) - should handle legacy endpoint", () => {
      const mockResponse = { data: { generated_text: "Legacy response" } };
      mockHttpService.post.mockReturnValue(of(mockResponse));

      return request(app.getHttpServer())
        .post("/v1/generate")
        .send({ text: "Legacy prompt" })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(mockResponse.data);
        });
    });

    it("should handle Python backend errors gracefully", () => {
      mockHttpService.post.mockReturnValue(
        throwError(() => new Error("Backend service unavailable")),
      );

      return request(app.getHttpServer())
        .post("/v1/generate-text")
        .send({ text: "Test prompt" })
        .expect(500);
    });
  });

  describe("Authentication System", () => {
    it("/v1/register (POST) - should register new user", () => {
      const mockUser = {
        id: 1,
        username: "testuser",
        password: "hashedpassword",
      };
      mockUserRepository.findOneBy.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      return request(app.getHttpServer())
        .post("/v1/register")
        .send({
          username: "testuser",
          password: "password123",
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            success: true,
            id: mockUser.id,
            username: mockUser.username,
            message: "User registered successfully",
          });
        });
    });

    it("/v1/register (POST) - should reject duplicate username", () => {
      mockUserRepository.findOneBy.mockResolvedValue({
        id: 1,
        username: "testuser",
      });

      return request(app.getHttpServer())
        .post("/v1/register")
        .send({
          username: "testuser",
          password: "password123",
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.message).toBe("Username already exists");
        });
    });

    it("/v1/login (POST) - should login with valid credentials", () => {
      const mockUser = { id: 1, username: "testuser", password: "password123" };
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);

      return request(app.getHttpServer())
        .post("/v1/login")
        .send({
          username: "testuser",
          password: "password123",
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body).toHaveProperty("access_token");
          expect(res.body.user).toEqual({
            id: mockUser.id,
            username: mockUser.username,
          });
        });
    });

    it("/v1/login (POST) - should reject invalid credentials", () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      return request(app.getHttpServer())
        .post("/v1/login")
        .send({
          username: "testuser",
          password: "wrongpassword",
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.message).toBe("Invalid credentials");
        });
    });
  });

  describe("IPFS Integration", () => {
    it("/v1/ipfs/upload (POST) - should upload file to IPFS", () => {
      // Mock the file upload functionality
      const mockFile = {
        buffer: Buffer.from("test file content"),
        originalname: "test.txt",
        size: 18,
      };

      return request(app.getHttpServer())
        .post("/v1/ipfs/upload")
        .attach("file", Buffer.from("test file content"), "test.txt")
        .field("rationale", "Test upload rationale")
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body).toHaveProperty("cid");
          expect(res.body.filename).toBe("test.txt");
          expect(res.body.size).toBe(18);
          expect(res.body.message).toBe("File uploaded successfully");
        });
    });

    it("/v1/ipfs/list/:cid (GET) - should list IPFS directory", () => {
      return request(app.getHttpServer())
        .get("/v1/ipfs/list/test-cid")
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.cid).toBe("test-cid");
          expect(res.body).toHaveProperty("entries");
          expect(res.body).toHaveProperty("count");
        });
    });
  });

  describe("Soulchain Integration", () => {
    it("/v1/soulchain/persist (POST) - should persist ledger to IPFS", () => {
      return request(app.getHttpServer())
        .post("/v1/soulchain/persist")
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body).toHaveProperty("cid");
          expect(res.body.message).toBe(
            "Soulchain ledger persisted to IPFS successfully",
          );
        });
    });
  });

  describe("Petals Integration", () => {
    it("/v1/petals/propose (POST) - should process Petals proposal", () => {
      const proposal = {
        rationale: "Test proposal for code generation",
        proposedCode: 'console.log("Hello, World!");',
        agentId: "test-agent-1",
      };

      return request(app.getHttpServer())
        .post("/v1/petals/propose")
        .set("Authorization", "Bearer mock-jwt-token")
        .send(proposal)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body).toHaveProperty("response");
          expect(res.body.message).toBe(
            "Petals proposal processed successfully",
          );
        });
    });
  });

  describe("Validation and Error Handling", () => {
    it("should validate required fields", () => {
      return request(app.getHttpServer())
        .post("/v1/generate-text")
        .send({}) // Missing required 'text' field
        .expect(400);
    });

    it("should validate field types", () => {
      return request(app.getHttpServer())
        .post("/v1/generate-text")
        .send({ text: 123 }) // text should be string
        .expect(400);
    });

    it("should handle Zeroth-gate violations", () => {
      const { checkIntent } = require("../guards/synthient.guard.js");
      checkIntent.mockReturnValue(false);

      return request(app.getHttpServer()).get("/v1").expect(500);
    });

    it("should handle network timeouts", () => {
      mockHttpService.post.mockReturnValue(
        throwError(() => new Error("timeout")),
      );

      return request(app.getHttpServer())
        .post("/v1/generate-text")
        .send({ text: "Test prompt" })
        .expect(500);
    });
  });

  describe("API Versioning", () => {
    it("should enforce /v1/ prefix on all endpoints", () => {
      return request(app.getHttpServer())
        .get("/generate-text") // Missing /v1/ prefix
        .expect(404);
    });

    it("should maintain backward compatibility for legacy endpoints", () => {
      const mockResponse = { data: { generated_text: "Legacy response" } };
      mockHttpService.post.mockReturnValue(of(mockResponse));

      return request(app.getHttpServer())
        .post("/v1/generate")
        .send({ text: "Legacy prompt" })
        .expect(200);
    });
  });

  describe("Performance and Metrics", () => {
    it("should track API request metrics", async () => {
      const mockResponse = { data: { generated_text: "Test response" } };
      mockHttpService.post.mockReturnValue(of(mockResponse));

      // Make multiple requests to test metrics
      await request(app.getHttpServer())
        .post("/v1/generate-text")
        .send({ text: "Test prompt 1" })
        .expect(200);

      await request(app.getHttpServer())
        .post("/v1/generate-text")
        .send({ text: "Test prompt 2" })
        .expect(200);

      // Check metrics endpoint
      const metricsResponse = await request(app.getHttpServer())
        .get("/v1/metrics")
        .expect(200);

      expect(metricsResponse.text).toContain("api_requests_total");
      expect(metricsResponse.text).toContain("api_request_duration_seconds");
    });

    it("should track Python backend latency", async () => {
      const mockResponse = { data: { generated_text: "Test response" } };
      mockHttpService.post.mockReturnValue(of(mockResponse));

      await request(app.getHttpServer())
        .post("/v1/generate-text")
        .send({ text: "Test prompt" })
        .expect(200);

      const metricsResponse = await request(app.getHttpServer())
        .get("/v1/metrics")
        .expect(200);

      expect(metricsResponse.text).toContain("python_backend_latency_seconds");
    });
  });
});
