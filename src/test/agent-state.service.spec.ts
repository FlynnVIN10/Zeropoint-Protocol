// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AgentStateService } from '../services/agent-state.service.js';
import { AgentState, AgentMetrics, AgentContext, AgentMemory } from '../entities/agent-state.entity.js';
import { checkIntent } from '../guards/synthient.guard.js';
import { soulchain } from '../agents/soulchain/soulchain.ledger.js';

// Mock dependencies
jest.mock('../guards/synthient.guard.js');
jest.mock('../agents/soulchain/soulchain.ledger.js');

const mockCheckIntent = checkIntent as jest.MockedFunction<typeof checkIntent>;
const mockSoulchain = soulchain as jest.Mocked<typeof soulchain>;

describe('AgentStateService', () => {
  let service: AgentStateService;
  let repository: Repository<AgentState>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockAgentState = {
    id: 'test-id',
    agentId: 'test-agent',
    name: 'Test Agent',
    did: 'did:zeropoint:test-agent',
    handle: '@test-agent',
    status: 'active',
    metrics: {
      xp: 100,
      level: 'Apprentice',
      trustScore: 0.8,
      ethicalRating: 'aligned',
      performanceScore: 0.9,
      lastTrainingCycle: new Date(),
      totalInteractions: 50,
      successfulInteractions: 48,
      failedInteractions: 2
    },
    context: {
      taskId: 'test-task',
      lineage: ['test-lineage'],
      swarmLink: 'test-swarm',
      layer: '#live',
      domain: 'ai-ethics'
    },
    memory: {
      reflections: [],
      experiences: [],
      learnings: []
    },
    tags: ['test', 'ai'],
    currentTask: null,
    lastInteraction: null,
    trainingHistory: [],
    performanceHistory: [],
    lastError: null,
    errorHistory: [],
    ethicalViolations: [],
    soulchainTransactions: [],
    notes: 'Test agent',
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    lastActivityAt: new Date(),
    addExperience: jest.fn(),
    addReflection: jest.fn(),
    addLearning: jest.fn(),
    recordInteraction: jest.fn(),
    recordTrainingCycle: jest.fn(),
    recordPerformanceMetric: jest.fn(),
    recordError: jest.fn(),
    recordEthicalViolation: jest.fn(),
    recordSoulchainTransaction: jest.fn(),
    isActive: jest.fn(),
    canInteract: jest.fn(),
    getTrustLevel: jest.fn().mockReturnValue('high'),
    getPerformanceStatus: jest.fn().mockReturnValue('excellent'),
    toJSON: jest.fn(),
    validateZerothGate: jest.fn()
  } as AgentState;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentStateService,
        {
          provide: getRepositoryToken(AgentState),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AgentStateService>(AgentStateService);
    repository = module.get<Repository<AgentState>>(getRepositoryToken(AgentState));

    // Reset mocks
    jest.clearAllMocks();
    mockCheckIntent.mockReturnValue(true);
    mockSoulchain.addXPTransaction.mockResolvedValue(undefined);
  });

  describe('createAgentState', () => {
    const createDto = {
      agentId: 'new-agent',
      name: 'New Agent',
      did: 'did:zeropoint:new-agent',
      handle: '@new-agent',
      context: {
        taskId: 'new-task',
        lineage: ['new-lineage'],
        swarmLink: 'new-swarm',
        layer: '#sandbox' as const,
        domain: 'ai-ethics'
      },
      tags: ['new', 'ai'],
      notes: 'New test agent',
      metadata: { test: true }
    };

    it('should create a new agent state successfully', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockAgentState);
      mockRepository.save.mockResolvedValue(mockAgentState);

      const result = await service.createAgentState(createDto);

      expect(result).toEqual(mockAgentState);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { agentId: createDto.agentId }
      });
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockSoulchain.addXPTransaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException if agent already exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockAgentState);

      await expect(service.createAgentState(createDto)).rejects.toThrow(
        new BadRequestException(`Agent with ID ${createDto.agentId} already exists.`)
      );
    });

    it('should throw BadRequestException on Zeroth violation', async () => {
      mockCheckIntent.mockReturnValue(false);

      await expect(service.createAgentState(createDto)).rejects.toThrow(
        new BadRequestException('Zeroth violation: Agent creation blocked due to ethical concerns.')
      );
    });
  });

  describe('getAgentState', () => {
    it('should return agent state by ID', async () => {
      mockRepository.findOne.mockResolvedValue(mockAgentState);

      const result = await service.getAgentState('test-agent');

      expect(result).toEqual(mockAgentState);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { agentId: 'test-agent' }
      });
    });

    it('should throw NotFoundException if agent not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getAgentState('non-existent')).rejects.toThrow(
        new NotFoundException('Agent with ID non-existent not found.')
      );
    });
  });

  describe('updateAgentState', () => {
    const updateDto = {
      status: 'training' as const,
      metrics: { xp: 150 },
      notes: 'Updated notes'
    };

    it('should update agent state successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockAgentState);
      mockRepository.save.mockResolvedValue({ ...mockAgentState, ...updateDto });

      const result = await service.updateAgentState('test-agent', updateDto);

      expect(result).toEqual({ ...mockAgentState, ...updateDto });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockSoulchain.addXPTransaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException on Zeroth violation', async () => {
      mockCheckIntent.mockReturnValue(false);

      await expect(service.updateAgentState('test-agent', updateDto)).rejects.toThrow(
        new BadRequestException('Zeroth violation: Agent state update blocked due to ethical concerns.')
      );
    });

    it('should throw NotFoundException if agent not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updateAgentState('non-existent', updateDto)).rejects.toThrow(
        new NotFoundException('Agent with ID non-existent not found.')
      );
    });
  });

  describe('deleteAgentState', () => {
    it('should soft delete agent state successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockAgentState);
      mockRepository.save.mockResolvedValue({ ...mockAgentState, status: 'terminated' });

      await service.deleteAgentState('test-agent');

      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockAgentState,
        status: 'terminated'
      });
      expect(mockSoulchain.addXPTransaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException on Zeroth violation', async () => {
      mockCheckIntent.mockReturnValue(false);

      await expect(service.deleteAgentState('test-agent')).rejects.toThrow(
        new BadRequestException('Zeroth violation: Agent deletion blocked due to ethical concerns.')
      );
    });
  });

  describe('queryAgentStates', () => {
    it('should query agent states with filters', async () => {
      const query = {
        status: 'active',
        ethicalRating: 'aligned',
        limit: 10,
        offset: 0
      };

      mockRepository.findAndCount.mockResolvedValue([[mockAgentState], 1]);

      const result = await service.queryAgentStates(query);

      expect(result).toEqual({
        agents: [mockAgentState],
        total: 1
      });
      expect(mockRepository.findAndCount).toHaveBeenCalled();
    });

    it('should apply trust level filter', async () => {
      mockRepository.findAndCount.mockResolvedValue([[mockAgentState], 1]);

      const result = await service.queryAgentStates({ trustLevel: 'high' });

      expect(result.agents).toEqual([mockAgentState]);
    });

    it('should apply performance status filter', async () => {
      mockRepository.findAndCount.mockResolvedValue([[mockAgentState], 1]);

      const result = await service.queryAgentStates({ performanceStatus: 'excellent' });

      expect(result.agents).toEqual([mockAgentState]);
    });
  });

  describe('getActiveAgents', () => {
    it('should return active agents', async () => {
      mockRepository.find.mockResolvedValue([mockAgentState]);

      const result = await service.getActiveAgents();

      expect(result).toEqual([mockAgentState]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { status: 'active' },
        order: { lastActivityAt: 'DESC' }
      });
    });
  });

  describe('getAgentsByEthicalRating', () => {
    it('should return agents by ethical rating', async () => {
      mockRepository.find.mockResolvedValue([mockAgentState]);

      const result = await service.getAgentsByEthicalRating('aligned');

      expect(result).toEqual([mockAgentState]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { 'metrics.ethicalRating': 'aligned' },
        order: { lastActivityAt: 'DESC' }
      });
    });
  });

  describe('getAgentsRequiringAttention', () => {
    it('should return agents requiring attention', async () => {
      mockRepository.find.mockResolvedValue([mockAgentState]);

      const result = await service.getAgentsRequiringAttention();

      expect(result).toEqual([mockAgentState]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: [
          { 'metrics.ethicalRating': 'warn' },
          { 'metrics.ethicalRating': 'reject' }
        ],
        order: { lastActivityAt: 'DESC' }
      });
    });
  });

  describe('recordInteraction', () => {
    it('should record interaction successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockAgentState);
      mockRepository.save.mockResolvedValue(mockAgentState);

      const result = await service.recordInteraction(
        'test-agent',
        'text-generation',
        'Hello',
        'Hello there!',
        5,
        true
      );

      expect(result).toEqual(mockAgentState);
      expect(mockAgentState.recordInteraction).toHaveBeenCalledWith(
        'text-generation',
        'Hello',
        'Hello there!',
        5,
        true
      );
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockSoulchain.addXPTransaction).toHaveBeenCalled();
    });
  });

  describe('recordTrainingCycle', () => {
    it('should record training cycle successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockAgentState);
      mockRepository.save.mockResolvedValue(mockAgentState);

      const result = await service.recordTrainingCycle(
        'test-agent',
        'ethical-alignment',
        10,
        ['Improved reasoning'],
        true
      );

      expect(result).toEqual(mockAgentState);
      expect(mockAgentState.recordTrainingCycle).toHaveBeenCalledWith(
        'ethical-alignment',
        10,
        ['Improved reasoning'],
        true
      );
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockSoulchain.addXPTransaction).toHaveBeenCalled();
    });
  });

  describe('recordPerformanceMetric', () => {
    it('should record performance metric successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockAgentState);
      mockRepository.save.mockResolvedValue(mockAgentState);

      const result = await service.recordPerformanceMetric(
        'test-agent',
        'accuracy',
        0.95,
        0.9
      );

      expect(result).toEqual(mockAgentState);
      expect(mockAgentState.recordPerformanceMetric).toHaveBeenCalledWith(
        'accuracy',
        0.95,
        0.9
      );
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockSoulchain.addXPTransaction).toHaveBeenCalled();
    });
  });

  describe('recordError', () => {
    it('should record error successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockAgentState);
      mockRepository.save.mockResolvedValue(mockAgentState);

      const result = await service.recordError(
        'test-agent',
        'Network timeout',
        'API call failed'
      );

      expect(result).toEqual(mockAgentState);
      expect(mockAgentState.recordError).toHaveBeenCalledWith(
        'Network timeout',
        'API call failed'
      );
      expect(mockAgentState.metrics.failedInteractions).toBe(3); // Incremented from 2
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockSoulchain.addXPTransaction).toHaveBeenCalled();
    });
  });

  describe('recordEthicalViolation', () => {
    it('should record ethical violation successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockAgentState);
      mockRepository.save.mockResolvedValue(mockAgentState);

      const result = await service.recordEthicalViolation(
        'test-agent',
        'Bias detected',
        'medium',
        'Response contained gender bias'
      );

      expect(result).toEqual(mockAgentState);
      expect(mockAgentState.recordEthicalViolation).toHaveBeenCalledWith(
        'Bias detected',
        'medium',
        'Response contained gender bias'
      );
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockSoulchain.addXPTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: -10 // XP penalty for medium violation
        })
      );
    });

    it('should apply correct XP penalties for different severities', async () => {
      mockRepository.findOne.mockResolvedValue(mockAgentState);
      mockRepository.save.mockResolvedValue(mockAgentState);

      // Test critical violation
      await service.recordEthicalViolation('test-agent', 'Critical violation', 'critical', 'context');
      expect(mockSoulchain.addXPTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ amount: -50 })
      );

      // Test high violation
      await service.recordEthicalViolation('test-agent', 'High violation', 'high', 'context');
      expect(mockSoulchain.addXPTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ amount: -25 })
      );

      // Test low violation
      await service.recordEthicalViolation('test-agent', 'Low violation', 'low', 'context');
      expect(mockSoulchain.addXPTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ amount: -5 })
      );
    });
  });

  describe('addReflection', () => {
    it('should add reflection successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockAgentState);
      mockRepository.save.mockResolvedValue(mockAgentState);

      const result = await service.addReflection(
        'test-agent',
        'I learned about ethical AI principles',
        ['ethics', 'learning']
      );

      expect(result).toEqual(mockAgentState);
      expect(mockAgentState.addReflection).toHaveBeenCalledWith(
        'I learned about ethical AI principles',
        ['ethics', 'learning']
      );
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockSoulchain.addXPTransaction).toHaveBeenCalled();
    });
  });

  describe('addLearning', () => {
    it('should add learning successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockAgentState);
      mockRepository.save.mockResolvedValue(mockAgentState);

      const result = await service.addLearning(
        'test-agent',
        'Ethical reasoning',
        'Applied in decision making',
        0.9
      );

      expect(result).toEqual(mockAgentState);
      expect(mockAgentState.addLearning).toHaveBeenCalledWith(
        'Ethical reasoning',
        'Applied in decision making',
        0.9
      );
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockSoulchain.addXPTransaction).toHaveBeenCalled();
    });
  });

  describe('getAgentStatistics', () => {
    it('should return agent statistics', async () => {
      const agents = [
        { ...mockAgentState, status: 'active', metrics: { ...mockAgentState.metrics, ethicalRating: 'aligned' } },
        { ...mockAgentState, agentId: 'agent2', status: 'training', metrics: { ...mockAgentState.metrics, ethicalRating: 'warn' } },
        { ...mockAgentState, agentId: 'agent3', status: 'suspended', metrics: { ...mockAgentState.metrics, ethicalRating: 'reject' } }
      ];

      mockRepository.find.mockResolvedValue(agents);

      const result = await service.getAgentStatistics();

      expect(result).toEqual({
        total: 3,
        active: 1,
        training: 1,
        suspended: 1,
        terminated: 0,
        ethicalBreakdown: {
          aligned: 1,
          warn: 1,
          reject: 1
        },
        trustBreakdown: {
          high: 3,
          medium: 0,
          low: 0
        },
        performanceBreakdown: {
          excellent: 3,
          good: 0,
          fair: 0,
          poor: 0
        }
      });
    });
  });

  describe('logToSoulchain', () => {
    it('should log to Soulchain successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockAgentState);
      mockRepository.save.mockResolvedValue(mockAgentState);

      await service.recordInteraction('test-agent', 'test', 'input', 'output', 5, true);

      expect(mockSoulchain.addXPTransaction).toHaveBeenCalledWith({
        agentId: 'test-agent',
        amount: 5,
        rationale: 'interaction_recorded: Interaction: test',
        timestamp: expect.any(String),
        previousCid: null,
        tags: expect.arrayContaining([
          expect.objectContaining({ type: '#who' }),
          expect.objectContaining({ type: '#intent' }),
          expect.objectContaining({ type: '#thread' }),
          expect.objectContaining({ type: '#layer' }),
          expect.objectContaining({ type: '#domain' })
        ])
      });
    });

    it('should handle Soulchain logging errors gracefully', async () => {
      mockRepository.findOne.mockResolvedValue(mockAgentState);
      mockRepository.save.mockResolvedValue(mockAgentState);
      mockSoulchain.addXPTransaction.mockRejectedValue(new Error('Soulchain error'));

      // Should not throw error
      const result = await service.recordInteraction('test-agent', 'test', 'input', 'output', 5, true);

      expect(result).toEqual(mockAgentState);
    });
  });
}); 