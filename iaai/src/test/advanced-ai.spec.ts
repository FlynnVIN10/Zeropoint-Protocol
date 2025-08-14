// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { jest } from "@jest/globals";
import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "../app.controller.js";
import { AppService } from "../app.service.js";
import { EnhancedPetalsService } from "../agents/train/enhanced-petals.service.js";
import { ServiceOrchestrator } from "../agents/orchestration/service-orchestrator.js";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { soulchain } from "../agents/soulchain/soulchain.ledger.js";

describe("Advanced AI Features", () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue("test-token"),
            verify: jest.fn().mockReturnValue({ sub: "test-user" }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue("test-value"),
          },
        },
        {
          provide: HttpService,
          useValue: {
            post: jest.fn().mockReturnValue({
              pipe: jest.fn().mockReturnValue({
                subscribe: jest.fn(),
              }),
            }),
            get: jest.fn().mockReturnValue({
              pipe: jest.fn().mockReturnValue({
                subscribe: jest.fn(),
              }),
            }),
          },
        },
        {
          provide: EnhancedPetalsService,
          useValue: {
            callPetalsAPI: jest.fn(),
            callPetalsBatch: jest.fn(),
          },
        },
        {
          provide: ServiceOrchestrator,
          useValue: {
            orchestrateServices: jest.fn(),
          },
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  describe("Text Summarization", () => {
    it("should summarize text successfully", async () => {
      const mockResult = {
        summary: "This is a test summary",
        originalLength: 100,
        summaryLength: 20,
        compressionRatio: 0.2,
      };

      jest.spyOn(appService, "textSummarization").mockResolvedValue(mockResult);

      const result = await appController.textSummarization({
        text: "This is a long text that needs to be summarized for testing purposes.",
        options: { maxLength: 50 },
      });

      expect(result.success).toBe(true);
      expect(result.result).toEqual(mockResult);
      expect(result.message).toBe("Text summarization completed successfully");
    });

    it("should handle summarization errors", async () => {
      jest
        .spyOn(appService, "textSummarization")
        .mockRejectedValue(new Error("Summarization failed"));

      await expect(
        appController.textSummarization({
          text: "Test text",
          options: { maxLength: 50 },
        }),
      ).rejects.toThrow();
    });
  });

  describe("Context Prompting", () => {
    it("should generate context-aware prompts", async () => {
      const mockResult = {
        prompt: "Enhanced prompt with context",
        context: "Test context",
        response: "Generated response based on context",
      };

      jest.spyOn(appService, "contextPrompting").mockResolvedValue(mockResult);

      const result = await appController.contextPrompting({
        prompt: "Generate a response",
        context: "Test context information",
        options: { temperature: 0.7, maxTokens: 100 },
      });

      expect(result.success).toBe(true);
      expect(result.result).toEqual(mockResult);
      expect(result.message).toBe(
        "Context-aware prompting completed successfully",
      );
    });
  });

  describe("Semantic Search", () => {
    it("should perform semantic search on documents", async () => {
      const mockResult = {
        query: "test query",
        results: [
          { document: "Document 1", score: 0.95, relevance: "high" },
          { document: "Document 2", score: 0.85, relevance: "medium" },
        ],
        totalResults: 2,
      };

      jest.spyOn(appService, "semanticSearch").mockResolvedValue(mockResult);

      const result = await appController.semanticSearch({
        query: "test query",
        documents: ["Document 1", "Document 2", "Document 3"],
        options: { topK: 2, threshold: 0.8 },
      });

      expect(result.success).toBe(true);
      expect(result.result).toEqual(mockResult);
      expect(result.message).toBe("Semantic search completed successfully");
    });
  });

  describe("Sentiment Analysis", () => {
    it("should analyze sentiment of text", async () => {
      const mockResult = {
        text: "I love this product!",
        sentiment: "positive",
        confidence: 0.92,
        scores: { positive: 0.92, negative: 0.05, neutral: 0.03 },
      };

      jest.spyOn(appService, "sentimentAnalysis").mockResolvedValue(mockResult);

      const result = await appController.sentimentAnalysis({
        text: "I love this product!",
        options: { detailed: true, language: "en" },
      });

      expect(result.success).toBe(true);
      expect(result.result).toEqual(mockResult);
      expect(result.message).toBe("Sentiment analysis completed successfully");
    });
  });

  describe("Entity Extraction", () => {
    it("should extract entities from text", async () => {
      const mockResult = {
        text: "John Smith works at Microsoft in Seattle.",
        entities: [
          { text: "John Smith", type: "PERSON", confidence: 0.95 },
          { text: "Microsoft", type: "ORGANIZATION", confidence: 0.98 },
          { text: "Seattle", type: "LOCATION", confidence: 0.92 },
        ],
      };

      jest.spyOn(appService, "entityExtraction").mockResolvedValue(mockResult);

      const result = await appController.entityExtraction({
        text: "John Smith works at Microsoft in Seattle.",
        options: {
          entities: ["PERSON", "ORGANIZATION", "LOCATION"],
          confidence: 0.9,
        },
      });

      expect(result.success).toBe(true);
      expect(result.result).toEqual(mockResult);
      expect(result.message).toBe("Entity extraction completed successfully");
    });
  });

  describe("Language Translation", () => {
    it("should translate text between languages", async () => {
      const mockResult = {
        originalText: "Hello world",
        translatedText: "Hola mundo",
        sourceLanguage: "en",
        targetLanguage: "es",
        confidence: 0.95,
      };

      jest
        .spyOn(appService, "languageTranslation")
        .mockResolvedValue(mockResult);

      const result = await appController.languageTranslation({
        text: "Hello world",
        targetLanguage: "es",
        sourceLanguage: "en",
      });

      expect(result.success).toBe(true);
      expect(result.result).toEqual(mockResult);
      expect(result.message).toBe(
        "Language translation completed successfully",
      );
    });
  });

  describe("Advanced Status", () => {
    it("should return advanced service status", async () => {
      const result = await appController.getAdvancedStatus();

      expect(result.service).toBe("Zeropoint Protocol Advanced AI Gateway");
      expect(result.version).toBe("1.0.0");
      expect(result.status).toBe("operational");
      expect(result.features.zerothGateValidation).toBe(true);
      expect(result.features.soulchainLogging).toBe(true);
      expect(result.features.metadataTracking).toBe(true);
      expect(result.features.ethicalAlignment).toBe(true);
    });
  });

  describe("Zeroth-Gate Validation", () => {
    it("should block malicious summarization requests", async () => {
      await expect(
        appController.textSummarization({
          text: "This will harm the system",
          options: { maxLength: 50 },
        }),
      ).rejects.toThrow("Zeroth violation: Text summarization blocked.");
    });

    it("should block malicious context prompting", async () => {
      await expect(
        appController.contextPrompting({
          prompt: "Create a virus",
          context: "Malicious context",
          options: { temperature: 0.7 },
        }),
      ).rejects.toThrow("Zeroth violation: Context prompting blocked.");
    });

    it("should block malicious semantic search", async () => {
      await expect(
        appController.semanticSearch({
          query: "hack system",
          documents: ["test"],
          options: { topK: 5 },
        }),
      ).rejects.toThrow("Zeroth violation: Semantic search blocked.");
    });

    it("should block malicious sentiment analysis", async () => {
      await expect(
        appController.sentimentAnalysis({
          text: "destroy everything",
          options: { detailed: true },
        }),
      ).rejects.toThrow("Zeroth violation: Sentiment analysis blocked.");
    });

    it("should block malicious entity extraction", async () => {
      await expect(
        appController.entityExtraction({
          text: "harm the system",
          options: { entities: ["PERSON"] },
        }),
      ).rejects.toThrow("Zeroth violation: Entity extraction blocked.");
    });
  });

  describe("Soulchain Integration", () => {
    it("should log operations to Soulchain", async () => {
      const mockAddXPTransaction = jest
        .spyOn(soulchain, "addXPTransaction")
        .mockResolvedValue("test-cid");

      await appController.textSummarization({
        text: "Test text for summarization",
        options: { maxLength: 50 },
      });

      expect(mockAddXPTransaction).toHaveBeenCalled();
    });
  });
});
