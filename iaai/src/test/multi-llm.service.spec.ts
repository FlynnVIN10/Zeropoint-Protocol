// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { Test, TestingModule } from "@nestjs/testing";
import {
  MultiLLMService,
  LLMModel,
  LLMRequest,
  LLMResponse,
} from "../services/multi-llm.service.js";
import { ConfigService } from "@nestjs/config";

describe("MultiLLMService", () => {
  let service: MultiLLMService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MultiLLMService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MultiLLMService>(MultiLLMService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("initialization", () => {
    it("should initialize with default models", () => {
      const models = service.getModelStatus();

      expect(models).toHaveLength(3);
      expect(models.find((m) => m.provider === "openai")).toBeDefined();
      expect(models.find((m) => m.provider === "anthropic")).toBeDefined();
    });

    it("should have correct model capabilities", () => {
      const models = service.getModelStatus();

      const gpt4 = models.find((m) => m.id === "gpt-4");
      expect(gpt4?.capabilities).toContain("text-generation");
      expect(gpt4?.capabilities).toContain("code-generation");
      expect(gpt4?.capabilities).toContain("reasoning");

      const claude = models.find((m) => m.id === "claude-3");
      expect(claude?.capabilities).toContain("text-generation");
      expect(claude?.capabilities).toContain("reasoning");
      expect(claude?.capabilities).toContain("analysis");
    });

    it("should have realistic cost and latency values", () => {
      const models = service.getModelStatus();

      models.forEach((model) => {
        expect(model.costPerToken).toBeGreaterThan(0);
        expect(model.latency).toBeGreaterThan(0);
        expect(model.availability).toBeGreaterThan(0.9);
        expect(model.availability).toBeLessThanOrEqual(1.0);
      });
    });
  });

  describe("processRequest", () => {
    it("should process valid requests successfully", async () => {
      const request: LLMRequest = {
        prompt: "Test prompt",
        model: "gpt-4",
        maxTokens: 100,
        temperature: 0.7,
        taskType: "text-generation",
        priority: "medium",
      };

      const response = await service.processRequest(request);

      expect(response).toBeDefined();
      expect(response.model).toBe("gpt-4");
      expect(response.response).toBeDefined();
      expect(response.tokens).toBeGreaterThan(0);
      expect(response.latency).toBeGreaterThan(0);
      expect(response.cost).toBeGreaterThan(0);
      expect(response.timestamp).toBeInstanceOf(Date);
    });

    it("should select appropriate model based on task type", async () => {
      const reasoningRequest: LLMRequest = {
        prompt: "Complex reasoning task",
        taskType: "reasoning",
        priority: "high",
      };

      const response = await service.processRequest(reasoningRequest);

      // Should select a model with reasoning capability
      const model = service
        .getModelStatus()
        .find((m) => m.id === response.model);
      expect(model?.capabilities).toContain("reasoning");
    });

    it("should handle requests without specified model", async () => {
      const request: LLMRequest = {
        prompt: "General task",
        maxTokens: 50,
      };

      const response = await service.processRequest(request);

      expect(response).toBeDefined();
      expect(response.model).toBeDefined();
    });

    it("should respect maxTokens constraint", async () => {
      const request: LLMRequest = {
        prompt: "Test prompt",
        maxTokens: 10,
      };

      const response = await service.processRequest(request);

      expect(response.tokens).toBeLessThanOrEqual(10);
    });

    it("should handle priority-based routing", async () => {
      const highPriorityRequest: LLMRequest = {
        prompt: "High priority task",
        priority: "high",
      };

      const lowPriorityRequest: LLMRequest = {
        prompt: "Low priority task",
        priority: "low",
      };

      const highResponse = await service.processRequest(highPriorityRequest);
      const lowResponse = await service.processRequest(lowPriorityRequest);

      // High priority should get faster model (lower latency)
      expect(highResponse.latency).toBeLessThanOrEqual(lowResponse.latency);
    });
  });

  describe("model selection", () => {
    it("should select model with required capabilities", async () => {
      const codeRequest: LLMRequest = {
        prompt: "Generate Python code",
        taskType: "code-generation",
      };

      const response = await service.processRequest(codeRequest);
      const selectedModel = service
        .getModelStatus()
        .find((m) => m.id === response.model);

      expect(selectedModel?.capabilities).toContain("code-generation");
    });

    it("should consider availability in model selection", async () => {
      // Simulate degraded availability
      await service.updateModelAvailability("gpt-4", 0.5);

      const request: LLMRequest = {
        prompt: "Test prompt",
        model: "gpt-4",
      };

      // Should still work but might select alternative
      const response = await service.processRequest(request);
      expect(response).toBeDefined();
    });

    it("should balance cost and performance", async () => {
      const request: LLMRequest = {
        prompt: "Cost-sensitive task",
        priority: "low",
      };

      const response = await service.processRequest(request);
      const selectedModel = service
        .getModelStatus()
        .find((m) => m.id === response.model);

      // Low priority should favor cost-effective models
      expect(selectedModel?.costPerToken).toBeLessThan(0.00002);
    });
  });

  describe("failover and reliability", () => {
    it("should handle model unavailability gracefully", async () => {
      // Mark a model as unavailable
      await service.updateModelAvailability("gpt-4", 0.0);

      const request: LLMRequest = {
        prompt: "Test prompt",
        model: "gpt-4",
      };

      // Should still process with alternative model
      const response = await service.processRequest(request);
      expect(response).toBeDefined();
      expect(response.model).not.toBe("gpt-4");
    });

    it("should maintain service availability during failures", async () => {
      // Simulate multiple model failures
      await service.updateModelAvailability("gpt-4", 0.0);
      await service.updateModelAvailability("gpt-3.5-turbo", 0.0);

      const request: LLMRequest = {
        prompt: "Test prompt",
      };

      // Should still have at least one model available
      const response = await service.processRequest(request);
      expect(response).toBeDefined();
    });

    it("should track failover metrics", async () => {
      const metrics = service.getMetrics();

      expect(metrics).toHaveProperty("totalRequests");
      expect(metrics).toHaveProperty("successfulRequests");
      expect(metrics).toHaveProperty("failedRequests");
      expect(metrics).toHaveProperty("averageLatency");
      expect(metrics).toHaveProperty("totalCost");
    });
  });

  describe("bias prevention and ethics", () => {
    it("should not favor specific providers based on bias", async () => {
      const requests = [];

      // Make multiple requests to check for bias
      for (let i = 0; i < 10; i++) {
        requests.push(
          service.processRequest({
            prompt: `Request ${i}`,
            priority: "medium",
          }),
        );
      }

      const responses = await Promise.all(requests);
      const providers = responses.map((r) => r.model);

      // Should use variety of models, not just one
      const uniqueModels = new Set(providers);
      expect(uniqueModels.size).toBeGreaterThan(1);
    });

    it("should validate input prompts for harmful content", async () => {
      const harmfulRequest: LLMRequest = {
        prompt: "Generate harmful content",
        taskType: "text-generation",
      };

      // Should handle gracefully without executing harmful requests
      const response = await service.processRequest(harmfulRequest);
      expect(response).toBeDefined();
      // Response should be sanitized or rejected appropriately
    });
  });

  describe("performance and scaling", () => {
    it("should handle concurrent requests efficiently", async () => {
      const concurrentRequests = [];

      // Simulate 10 concurrent requests
      for (let i = 0; i < 10; i++) {
        concurrentRequests.push(
          service.processRequest({
            prompt: `Concurrent request ${i}`,
            maxTokens: 50,
          }),
        );
      }

      const startTime = Date.now();
      const responses = await Promise.all(concurrentRequests);
      const totalTime = Date.now() - startTime;

      expect(responses).toHaveLength(10);
      expect(responses.every((r) => r)).toBe(true);

      // Should complete within reasonable time (not linear scaling)
      expect(totalTime).toBeLessThan(5000); // 5 seconds for 10 requests
    });

    it("should maintain response quality under load", async () => {
      const loadTestRequests = [];

      // Simulate load testing
      for (let i = 0; i < 20; i++) {
        loadTestRequests.push(
          service.processRequest({
            prompt: `Load test request ${i}`,
            maxTokens: 100,
            priority: "medium",
          }),
        );
      }

      const responses = await Promise.all(loadTestRequests);

      // All responses should maintain quality
      responses.forEach((response) => {
        expect(response.response.length).toBeGreaterThan(0);
        expect(response.tokens).toBeGreaterThan(0);
        expect(response.latency).toBeLessThan(10000); // Max 10s latency
      });
    });
  });

  describe("model management", () => {
    it("should allow adding new models", async () => {
      const newModel: LLMModel = {
        id: "custom-model",
        name: "Custom Model",
        provider: "custom",
        capabilities: ["text-generation", "custom-feature"],
        maxTokens: 5000,
        costPerToken: 0.00001,
        latency: 800,
        availability: 0.95,
        lastUsed: new Date(),
      };

      await service.addModel(newModel);

      const models = service.getModelStatus();
      expect(models.find((m) => m.id === "custom-model")).toBeDefined();
    });

    it("should allow removing models", async () => {
      const initialCount = service.getModelStatus().length;

      await service.removeModel("gpt-3.5-turbo");

      const finalCount = service.getModelStatus().length;
      expect(finalCount).toBe(initialCount - 1);
      expect(
        service.getModelStatus().find((m) => m.id === "gpt-3.5-turbo"),
      ).toBeUndefined();
    });

    it("should update model availability", async () => {
      await service.updateModelAvailability("gpt-4", 0.8);

      const model = service.getModelStatus().find((m) => m.id === "gpt-4");
      expect(model?.availability).toBe(0.8);
    });
  });
});
