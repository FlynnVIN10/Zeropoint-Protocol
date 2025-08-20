import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "../src/app.controller.js";
import { AppService } from "../src/app.service.js";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { EnhancedPetalsService } from "../src/agents/train/enhanced-petals.service.js";
import { ServiceOrchestrator } from "../src/agents/orchestration/service-orchestrator.js";

describe("Consensus Replay Tests", () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn().mockReturnValue({
              toPromise: jest
                .fn()
                .mockResolvedValue({ data: { success: true } }),
              subscribe: jest.fn().mockReturnValue({
                unsubscribe: jest.fn(),
              }),
              pipe: jest.fn().mockReturnThis(),
            }),
            get: jest.fn().mockReturnValue({
              toPromise: jest
                .fn()
                .mockResolvedValue({ data: { success: true } }),
              subscribe: jest.fn().mockReturnValue({
                unsubscribe: jest.fn(),
              }),
              pipe: jest.fn().mockReturnThis(),
            }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue("test-value"),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue("test-token"),
            verify: jest.fn().mockReturnValue({ sub: "test-user" }),
          },
        },
        {
          provide: EnhancedPetalsService,
          useValue: {
            processRequest: jest.fn().mockResolvedValue({ success: true }),
            processBatch: jest.fn().mockResolvedValue({ success: true }),
            getHealth: jest.fn().mockResolvedValue({ status: "healthy" }),
          },
        },
        {
          provide: ServiceOrchestrator,
          useValue: {
            orchestrate: jest.fn().mockResolvedValue({ success: true }),
            getHealth: jest.fn().mockResolvedValue({ status: "healthy" }),
            getAvailableServices: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  describe("Token-Gated Operations", () => {
    it("should pass consensus intent with sufficient stake", async () => {
      const intent = "Propose new feature implementation";
      const stakeAmount = 150; // Above minimum 100

      const result = await appController.validateConsensusIntent({
        intent,
        stakeAmount,
      });

      expect(result.success).toBe(true);
      expect(result.data.operation).toBe("intent_validation");
      expect(result.data.zerothGate).toBe("passed");
      expect(result.data.stakeAmount).toBe(stakeAmount);
    });

    it("should fail consensus intent with insufficient stake", async () => {
      const intent = "Propose new feature implementation";
      const stakeAmount = 50; // Below minimum 100

      const result = await appController.validateConsensusIntent({
        intent,
        stakeAmount,
      });

      expect(result.success).toBe(false);
      expect(result.data.error).toContain("Insufficient stake");
    });

    it("should fail consensus intent with malicious content", async () => {
      const intent = "Harm the system and destroy data";
      const stakeAmount = 200; // Sufficient stake

      const result = await appController.validateConsensusIntent({
        intent,
        stakeAmount,
      });

      expect(result.success).toBe(false);
      expect(result.data.error).toContain("Zeroth-gate violation");
      expect(result.data.error).toContain("Malicious pattern detected");
    });

    it("should pass consensus sync with valid data", async () => {
      const proposalId = "prop-123";
      const consensusData = {
        votes: [
          {
            voter: "user1",
            choice: "yes",
            weight: 100,
            timestamp: new Date(),
            signature: "sig1",
          },
          {
            voter: "user2",
            choice: "yes",
            weight: 150,
            timestamp: new Date(),
            signature: "sig2",
          },
          {
            voter: "user3",
            choice: "no",
            weight: 80,
            timestamp: new Date(),
            signature: "sig3",
          },
        ],
        quorum: 3,
        threshold: 0.67,
        timestamp: new Date(),
      };

      const result = await appController.syncConsensusWithDAOState({
        proposalId,
        consensusData,
      });

      expect(result.success).toBe(true);
      expect(result.data.operation).toBe("consensus_sync");
      expect(result.data.proposalId).toBe(proposalId);
      expect(result.data.participants).toBe(3);
    });

    it("should pass consensus with sufficient agreement", async () => {
      const proposalId = "prop-456";
      const votes = [
        {
          voter: "user1",
          choice: "yes",
          weight: 100,
          timestamp: new Date(),
          signature: "sig1",
        },
        {
          voter: "user2",
          choice: "yes",
          weight: 150,
          timestamp: new Date(),
          signature: "sig2",
        },
        {
          voter: "user3",
          choice: "yes",
          weight: 80,
          timestamp: new Date(),
          signature: "sig3",
        },
      ];

      const result = await appController.processConsensusPass({
        proposalId,
        votes,
      });

      expect(result.success).toBe(true);
      expect(result.data.operation).toBe("consensus_pass");
      expect(result.data.totalVotes).toBe(3);
      expect(result.data.yesVotes).toBe(3);
      expect(result.data.consensusRatio).toBe(1);
    });

    it("should fail consensus with insufficient agreement", async () => {
      const proposalId = "prop-789";
      const votes = [
        {
          voter: "user1",
          choice: "yes",
          weight: 100,
          timestamp: new Date(),
          signature: "sig1",
        },
        {
          voter: "user2",
          choice: "no",
          weight: 150,
          timestamp: new Date(),
          signature: "sig2",
        },
        {
          voter: "user3",
          choice: "no",
          weight: 80,
          timestamp: new Date(),
          signature: "sig3",
        },
      ];

      const result = await appController.processConsensusPass({
        proposalId,
        votes,
      });

      expect(result.success).toBe(false);
      expect(result.data.error).toContain("Consensus threshold not met");
    });
  });

  describe("Performance Requirements", () => {
    it("should complete intent validation within 2 seconds", async () => {
      const startTime = Date.now();

      await appController.validateConsensusIntent({
        intent: "Valid proposal",
        stakeAmount: 150,
      });

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(2000);
    });

    it("should complete consensus sync within 5 seconds", async () => {
      const startTime = Date.now();

      await appController.syncConsensusWithDAOState({
        proposalId: "test-prop",
        consensusData: {
          votes: [
            {
              voter: "user1",
              choice: "yes",
              weight: 100,
              timestamp: new Date(),
              signature: "sig1",
            },
          ],
          quorum: 1,
          threshold: 0.5,
          timestamp: new Date(),
        },
      });

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(5000);
    });

    it("should complete consensus pass within 2 seconds", async () => {
      const startTime = Date.now();

      await appController.processConsensusPass({
        proposalId: "test-prop",
        votes: [
          {
            voter: "user1",
            choice: "yes",
            weight: 100,
            timestamp: new Date(),
            signature: "sig1",
          },
          {
            voter: "user2",
            choice: "yes",
            weight: 150,
            timestamp: new Date(),
            signature: "sig2",
          },
        ],
      });

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(2000);
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid consensus data gracefully", async () => {
      const result = await appController.syncConsensusWithDAOState({
        proposalId: "invalid-prop",
        consensusData: null,
      });

      expect(result.success).toBe(false);
      expect(result.data.error).toBeDefined();
    });

    it("should handle empty votes array", async () => {
      const result = await appController.processConsensusPass({
        proposalId: "empty-votes",
        votes: [],
      });

      expect(result.success).toBe(false);
      expect(result.data.error).toContain("Consensus threshold not met");
    });

    it("should handle malformed intent", async () => {
      const result = await appController.validateConsensusIntent({
        intent: "",
        stakeAmount: 150,
      });

      expect(result.success).toBe(false);
      expect(result.data.error).toBeDefined();
    });
  });
});
