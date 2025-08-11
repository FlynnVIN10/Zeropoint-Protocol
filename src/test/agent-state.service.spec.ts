// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import {
  AgentStateService,
  CreateAgentStateDto,
  UpdateAgentStateDto,
} from "../services/agent-state.service.js";
import { AgentState } from "../entities/agent-state.entity.js";

describe("AgentStateService", () => {
  let service: AgentStateService;
  let agentStateRepository: any;

  const mockAgentStateRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentStateService,
        {
          provide: getRepositoryToken(AgentState),
          useValue: mockAgentStateRepository,
        },
      ],
    }).compile();

    service = module.get<AgentStateService>(AgentStateService);
    agentStateRepository = module.get(getRepositoryToken(AgentState));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createAgentState", () => {
    const createDto: CreateAgentStateDto = {
      agentId: "test-agent-1",
      name: "Test Agent",
      did: "did:zeropoint:test-agent-1",
      handle: "@testagent",
      context: {
        taskId: "task-1",
        lineage: ["task-1"],
        swarmLink: "swarm-link-1",
        layer: "#live",
        domain: "test-domain",
      },
      tags: ["test", "agent"],
      notes: "Test agent for unit testing",
      metadata: { test: true },
    };

    it("should create a new agent state successfully", async () => {
      // Mock agent not existing
      agentStateRepository.findOne.mockResolvedValue(null);

      // Mock agent creation
      const mockAgent = {
        id: "agent-id",
        agentId: createDto.agentId,
        name: createDto.name,
        did: createDto.did,
        handle: createDto.handle,
        status: "active",
        metrics: {
          xp: 0,
          level: "Initiate",
          trustScore: 0.5,
          ethicalRating: "aligned",
          performanceScore: 0.5,
          lastTrainingCycle: expect.any(Date),
          totalInteractions: 0,
          successfulInteractions: 0,
          failedInteractions: 0,
        },
        context: createDto.context,
        memory: {
          reflections: [],
          experiences: [],
          learnings: [],
        },
        tags: createDto.tags,
        notes: createDto.notes,
        metadata: createDto.metadata,
      };

      agentStateRepository.create.mockReturnValue(mockAgent);
      agentStateRepository.save.mockResolvedValue(mockAgent);

      const result = await service.createAgentState(createDto);

      expect(result.agentId).toBe(createDto.agentId);
      expect(result.name).toBe(createDto.name);
      expect(result.did).toBe(createDto.did);
      expect(result.handle).toBe(createDto.handle);
      expect(result.status).toBe("active");
      expect(result.metrics.ethicalRating).toBe("aligned");
      expect(agentStateRepository.save).toHaveBeenCalled();
    });

    it("should throw BadRequestException if agent already exists", async () => {
      agentStateRepository.findOne.mockResolvedValue({ id: "existing-agent" });

      await expect(service.createAgentState(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("getAgentState", () => {
    it("should return agent state by ID", async () => {
      const mockAgent = {
        id: "agent-id",
        agentId: "test-agent-1",
        name: "Test Agent",
        did: "did:zeropoint:test-agent-1",
        handle: "@testagent",
      };

      agentStateRepository.findOne.mockResolvedValue(mockAgent);

      const result = await service.getAgentState("test-agent-1");

      expect(result.agentId).toBe("test-agent-1");
      expect(result.name).toBe("Test Agent");
    });

    it("should throw NotFoundException if agent not found", async () => {
      agentStateRepository.findOne.mockResolvedValue(null);

      await expect(service.getAgentState("non-existent-agent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("updateAgentState", () => {
    const updateDto: UpdateAgentStateDto = {
      status: "training",
      metrics: {
        xp: 100,
        trustScore: 0.8,
      },
      notes: "Updated notes",
    };

    it("should update agent state successfully", async () => {
      const existingAgent = {
        id: "agent-id",
        agentId: "test-agent-1",
        name: "Test Agent",
        status: "active",
        metrics: {
          xp: 0,
          trustScore: 0.5,
          ethicalRating: "aligned",
          performanceScore: 0.5,
          lastTrainingCycle: new Date(),
          totalInteractions: 0,
          successfulInteractions: 0,
          failedInteractions: 0,
        },
        notes: "Old notes",
      };

      const updatedAgent = {
        ...existingAgent,
        status: "training",
        metrics: {
          ...existingAgent.metrics,
          xp: 100,
          trustScore: 0.8,
        },
        notes: "Updated notes",
      };

      agentStateRepository.findOne.mockResolvedValue(existingAgent);
      agentStateRepository.save.mockResolvedValue(updatedAgent);

      const result = await service.updateAgentState("test-agent-1", updateDto);

      expect(result.status).toBe("training");
      expect(result.metrics.xp).toBe(100);
      expect(result.metrics.trustScore).toBe(0.8);
      expect(result.notes).toBe("Updated notes");
    });

    it("should throw NotFoundException if agent not found", async () => {
      agentStateRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateAgentState("non-existent-agent", updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("deleteAgentState", () => {
    it("should soft delete agent state by setting status to terminated", async () => {
      const existingAgent = {
        id: "agent-id",
        agentId: "test-agent-1",
        name: "Test Agent",
        status: "active",
      };

      const terminatedAgent = {
        ...existingAgent,
        status: "terminated",
      };

      agentStateRepository.findOne.mockResolvedValue(existingAgent);
      agentStateRepository.save.mockResolvedValue(terminatedAgent);

      await service.deleteAgentState("test-agent-1");

      expect(agentStateRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: "terminated" }),
      );
    });
  });

  describe("queryAgentStates", () => {
    it("should query agent states with filters", async () => {
      const mockAgents = [
        {
          id: "agent-1",
          agentId: "test-agent-1",
          name: "Test Agent 1",
          status: "active",
          metrics: { ethicalRating: "aligned", trustScore: 0.8 },
          getTrustLevel: jest.fn().mockReturnValue("high"),
          getPerformanceStatus: jest.fn().mockReturnValue("excellent"),
        },
        {
          id: "agent-2",
          agentId: "test-agent-2",
          name: "Test Agent 2",
          status: "training",
          metrics: { ethicalRating: "warn", trustScore: 0.6 },
          getTrustLevel: jest.fn().mockReturnValue("medium"),
          getPerformanceStatus: jest.fn().mockReturnValue("good"),
        },
      ];

      agentStateRepository.findAndCount.mockResolvedValue([mockAgents, 2]);

      const result = await service.queryAgentStates({
        status: "active",
        trustLevel: "high",
        limit: 10,
        offset: 0,
      });

      expect(result.agents).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.agents[0].agentId).toBe("test-agent-1");
    });
  });

  describe("getActiveAgents", () => {
    it("should return active agents", async () => {
      const mockAgents = [
        {
          id: "agent-1",
          agentId: "test-agent-1",
          name: "Test Agent 1",
          status: "active",
        },
        {
          id: "agent-2",
          agentId: "test-agent-2",
          name: "Test Agent 2",
          status: "active",
        },
      ];

      agentStateRepository.find.mockResolvedValue(mockAgents);

      const result = await service.getActiveAgents();

      expect(result).toHaveLength(2);
      expect(result[0].status).toBe("active");
      expect(result[1].status).toBe("active");
    });
  });

  describe("recordInteraction", () => {
    it("should record agent interaction successfully", async () => {
      const existingAgent = {
        id: "agent-id",
        agentId: "test-agent-1",
        name: "Test Agent",
        metrics: {
          xp: 0,
          totalInteractions: 0,
          successfulInteractions: 0,
          failedInteractions: 0,
        },
        recordInteraction: jest.fn(),
      };

      const updatedAgent = {
        ...existingAgent,
        metrics: {
          xp: 10,
          totalInteractions: 1,
          successfulInteractions: 1,
          failedInteractions: 0,
        },
        lastInteraction: {
          timestamp: new Date(),
          type: "text-generation",
          input: "Hello",
          output: "Hello there!",
          xpGained: 10,
          ethicalCheck: true,
        },
      };

      agentStateRepository.findOne.mockResolvedValue(existingAgent);
      agentStateRepository.save.mockResolvedValue(updatedAgent);

      const result = await service.recordInteraction(
        "test-agent-1",
        "text-generation",
        "Hello",
        "Hello there!",
        10,
        true,
      );

      expect(result.metrics.xp).toBe(10);
      expect(result.metrics.totalInteractions).toBe(1);
      expect(result.metrics.successfulInteractions).toBe(1);
      expect(result.lastInteraction.type).toBe("text-generation");
    });
  });

  describe("recordTrainingCycle", () => {
    it("should record training cycle successfully", async () => {
      const existingAgent = {
        id: "agent-id",
        agentId: "test-agent-1",
        name: "Test Agent",
        metrics: {
          xp: 0,
          lastTrainingCycle: new Date("2024-01-01"),
        },
        recordTrainingCycle: jest.fn(),
      };

      const updatedAgent = {
        ...existingAgent,
        metrics: {
          xp: 50,
          lastTrainingCycle: new Date(),
        },
        trainingHistory: [
          {
            timestamp: new Date(),
            cycle: "cycle-1",
            xpGained: 50,
            improvements: ["better-response-time"],
            ethicalAlignment: true,
          },
        ],
      };

      agentStateRepository.findOne.mockResolvedValue(existingAgent);
      agentStateRepository.save.mockResolvedValue(updatedAgent);

      const result = await service.recordTrainingCycle(
        "test-agent-1",
        "cycle-1",
        50,
        ["better-response-time"],
        true,
      );

      expect(result.metrics.xp).toBe(50);
      expect(result.trainingHistory).toHaveLength(1);
      expect(result.trainingHistory[0].cycle).toBe("cycle-1");
    });
  });

  describe("recordPerformanceMetric", () => {
    it("should record performance metric successfully", async () => {
      const existingAgent = {
        id: "agent-id",
        agentId: "test-agent-1",
        name: "Test Agent",
        recordPerformanceMetric: jest.fn(),
      };

      const updatedAgent = {
        ...existingAgent,
        performanceHistory: [
          {
            timestamp: new Date(),
            metric: "response-time",
            value: 0.8,
            threshold: 1.0,
            status: "pass",
          },
        ],
      };

      agentStateRepository.findOne.mockResolvedValue(existingAgent);
      agentStateRepository.save.mockResolvedValue(updatedAgent);

      const result = await service.recordPerformanceMetric(
        "test-agent-1",
        "response-time",
        0.8,
        1.0,
      );

      expect(result.performanceHistory).toHaveLength(1);
      expect(result.performanceHistory[0].metric).toBe("response-time");
      expect(result.performanceHistory[0].status).toBe("pass");
    });
  });

  describe("recordError", () => {
    it("should record error successfully", async () => {
      const existingAgent = {
        id: "agent-id",
        agentId: "test-agent-1",
        name: "Test Agent",
        metrics: {
          failedInteractions: 0,
        },
        recordError: jest.fn(),
      };

      const updatedAgent = {
        ...existingAgent,
        metrics: {
          failedInteractions: 1,
        },
        lastError: "Test error message",
        errorHistory: [
          {
            timestamp: new Date(),
            error: "Test error message",
            context: "test-context",
            resolved: false,
          },
        ],
      };

      agentStateRepository.findOne.mockResolvedValue(existingAgent);
      agentStateRepository.save.mockResolvedValue(updatedAgent);

      const result = await service.recordError(
        "test-agent-1",
        "Test error message",
        "test-context",
      );

      expect(result.metrics.failedInteractions).toBe(1);
      expect(result.lastError).toBe("Test error message");
      expect(result.errorHistory).toHaveLength(1);
    });
  });

  describe("recordEthicalViolation", () => {
    it("should record ethical violation successfully", async () => {
      const existingAgent = {
        id: "agent-id",
        agentId: "test-agent-1",
        name: "Test Agent",
        metrics: {
          ethicalRating: "aligned",
        },
        recordEthicalViolation: jest.fn(),
      };

      const updatedAgent = {
        ...existingAgent,
        metrics: {
          ethicalRating: "warn",
        },
        ethicalViolations: [
          {
            timestamp: new Date(),
            violation: "Test violation",
            severity: "medium",
            context: "test-context",
            resolved: false,
          },
        ],
      };

      agentStateRepository.findOne.mockResolvedValue(existingAgent);
      agentStateRepository.save.mockResolvedValue(updatedAgent);

      const result = await service.recordEthicalViolation(
        "test-agent-1",
        "Test violation",
        "medium",
        "test-context",
      );

      expect(result.metrics.ethicalRating).toBe("warn");
      expect(result.ethicalViolations).toHaveLength(1);
      expect(result.ethicalViolations[0].severity).toBe("medium");
    });
  });

  describe("getAgentStatistics", () => {
    it("should return agent statistics", async () => {
      const mockAgents = [
        {
          id: "agent-1",
          status: "active",
          metrics: { ethicalRating: "aligned", trustScore: 0.8 },
          getTrustLevel: jest.fn().mockReturnValue("high"),
          getPerformanceStatus: jest.fn().mockReturnValue("excellent"),
        },
        {
          id: "agent-2",
          status: "training",
          metrics: { ethicalRating: "warn", trustScore: 0.6 },
          getTrustLevel: jest.fn().mockReturnValue("medium"),
          getPerformanceStatus: jest.fn().mockReturnValue("good"),
        },
        {
          id: "agent-3",
          status: "suspended",
          metrics: { ethicalRating: "reject", trustScore: 0.3 },
          getTrustLevel: jest.fn().mockReturnValue("low"),
          getPerformanceStatus: jest.fn().mockReturnValue("poor"),
        },
      ];

      agentStateRepository.find.mockResolvedValue(mockAgents);

      const result = await service.getAgentStatistics();

      expect(result.total).toBe(3);
      expect(result.active).toBe(1);
      expect(result.training).toBe(1);
      expect(result.suspended).toBe(1);
      expect(result.ethicalBreakdown.aligned).toBe(1);
      expect(result.ethicalBreakdown.warn).toBe(1);
      expect(result.ethicalBreakdown.reject).toBe(1);
      expect(result.trustBreakdown.high).toBe(1);
      expect(result.trustBreakdown.medium).toBe(1);
      expect(result.trustBreakdown.low).toBe(1);
    });
  });
});
