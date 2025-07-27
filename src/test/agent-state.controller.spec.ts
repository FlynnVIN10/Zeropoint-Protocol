// © [2025] Zeropoint Protocol (C Corp). All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed license. See LICENSE.md for details.

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AgentStateController } from '../controllers/agent-state.controller.js';
import { AgentStateService } from '../services/agent-state.service.js';
import { AgentState } from '../entities/agent-state.entity.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { SynthientGuard } from '../guards/synthient.guard.js';
import { checkIntent } from '../guards/synthient.guard.js';
import { soulchain } from '../agents/soulchain/soulchain.ledger.js';

// Mock dependencies
jest.mock('../guards/jwt-auth.guard.js');
jest.mock('../guards/synthient.guard.js');
jest.mock('../agents/soulchain/soulchain.ledger.js');

const mockJwtAuthGuard = JwtAuthGuard as jest.MockedClass<typeof JwtAuthGuard>;
const mockSynthientGuard = SynthientGuard as jest.MockedClass<typeof SynthientGuard>;
const mockCheckIntent = checkIntent as jest.MockedFunction<typeof checkIntent>;
const mockSoulchain = soulchain as jest.Mocked<typeof soulchain>;

describe('AgentStateController (Integration)', () => {
  let app: INestApplication;
  let agentStateService: AgentStateService;

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

  const mockAgentStateService = {
    createAgentState: jest.fn(),
    getAgentState: jest.fn(),
    updateAgentState: jest.fn(),
    deleteAgentState: jest.fn(),
    queryAgentStates: jest.fn(),
    getActiveAgents: jest.fn(),
    getAgentsByEthicalRating: jest.fn(),
    getAgentsRequiringAttention: jest.fn(),
    recordInteraction: jest.fn(),
    recordTrainingCycle: jest.fn(),
    recordPerformanceMetric: jest.fn(),
    recordError: jest.fn(),
    recordEthicalViolation: jest.fn(),
    addReflection: jest.fn(),
    addLearning: jest.fn(),
    getAgentStatistics: jest.fn()
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AgentStateController],
      providers: [
        {
          provide: AgentStateService,
          useValue: mockAgentStateService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(SynthientGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    agentStateService = moduleFixture.get<AgentStateService>(AgentStateService);

    await app.init();

    // Reset mocks
    jest.clearAllMocks();
    mockCheckIntent.mockReturnValue(true);
    mockSoulchain.addXPTransaction.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /v1/agent-states', () => {
    const createDto = {
      agentId: 'new-agent',
      name: 'New Agent',
      did: 'did:zeropoint:new-agent',
      handle: '@new-agent',
      context: {
        taskId: 'new-task',
        lineage: ['new-lineage'],
        swarmLink: 'new-swarm',
        layer: '#sandbox',
        domain: 'ai-ethics'
      },
      tags: ['new', 'ai'],
      notes: 'New test agent',
      metadata: { test: true }
    };

    it('should create a new agent state', async () => {
      mockAgentStateService.createAgentState.mockResolvedValue(mockAgentState);

      const response = await request(app.getHttpServer())
        .post('/v1/agent-states')
        .send(createDto)
        .expect(201);

      expect(response.body).toEqual(mockAgentState);
      expect(mockAgentStateService.createAgentState).toHaveBeenCalledWith(createDto);
    });

    it('should return 400 for invalid data', async () => {
      const invalidDto = { agentId: 'test' }; // Missing required fields

      await request(app.getHttpServer())
        .post('/v1/agent-states')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('GET /v1/agent-states/:agentId', () => {
    it('should return agent state by ID', async () => {
      mockAgentStateService.getAgentState.mockResolvedValue(mockAgentState);

      const response = await request(app.getHttpServer())
        .get('/v1/agent-states/test-agent')
        .expect(200);

      expect(response.body).toEqual(mockAgentState);
      expect(mockAgentStateService.getAgentState).toHaveBeenCalledWith('test-agent');
    });

    it('should return 404 for non-existent agent', async () => {
      mockAgentStateService.getAgentState.mockRejectedValue(
        new Error('Agent with ID non-existent not found.')
      );

      await request(app.getHttpServer())
        .get('/v1/agent-states/non-existent')
        .expect(404);
    });
  });

  describe('PUT /v1/agent-states/:agentId', () => {
    const updateDto = {
      status: 'training',
      metrics: { xp: 150 },
      notes: 'Updated notes'
    };

    it('should update agent state', async () => {
      const updatedAgent = { ...mockAgentState, ...updateDto };
      mockAgentStateService.updateAgentState.mockResolvedValue(updatedAgent);

      const response = await request(app.getHttpServer())
        .put('/v1/agent-states/test-agent')
        .send(updateDto)
        .expect(200);

      expect(response.body).toEqual(updatedAgent);
      expect(mockAgentStateService.updateAgentState).toHaveBeenCalledWith('test-agent', updateDto);
    });

    it('should return 400 for invalid data', async () => {
      const invalidDto = { status: 'invalid-status' };

      await request(app.getHttpServer())
        .put('/v1/agent-states/test-agent')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('DELETE /v1/agent-states/:agentId', () => {
    it('should delete agent state', async () => {
      mockAgentStateService.deleteAgentState.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete('/v1/agent-states/test-agent')
        .expect(204);

      expect(mockAgentStateService.deleteAgentState).toHaveBeenCalledWith('test-agent');
    });
  });

  describe('GET /v1/agent-states', () => {
    it('should query agent states with filters', async () => {
      const queryResult = { agents: [mockAgentState], total: 1 };
      mockAgentStateService.queryAgentStates.mockResolvedValue(queryResult);

      const response = await request(app.getHttpServer())
        .get('/v1/agent-states')
        .query({
          status: 'active',
          ethicalRating: 'aligned',
          limit: 10,
          offset: 0
        })
        .expect(200);

      expect(response.body).toEqual(queryResult);
      expect(mockAgentStateService.queryAgentStates).toHaveBeenCalledWith({
        status: 'active',
        ethicalRating: 'aligned',
        limit: 10,
        offset: 0
      });
    });

    it('should handle query parameters correctly', async () => {
      const queryResult = { agents: [mockAgentState], total: 1 };
      mockAgentStateService.queryAgentStates.mockResolvedValue(queryResult);

      await request(app.getHttpServer())
        .get('/v1/agent-states')
        .query({
          tags: 'test,ai',
          trustLevel: 'high',
          performanceStatus: 'excellent'
        })
        .expect(200);

      expect(mockAgentStateService.queryAgentStates).toHaveBeenCalledWith({
        tags: ['test', 'ai'],
        trustLevel: 'high',
        performanceStatus: 'excellent',
        limit: 50,
        offset: 0
      });
    });
  });

  describe('GET /v1/agent-states/active/list', () => {
    it('should return active agents', async () => {
      mockAgentStateService.getActiveAgents.mockResolvedValue([mockAgentState]);

      const response = await request(app.getHttpServer())
        .get('/v1/agent-states/active/list')
        .expect(200);

      expect(response.body).toEqual([mockAgentState]);
      expect(mockAgentStateService.getActiveAgents).toHaveBeenCalled();
    });
  });

  describe('GET /v1/agent-states/ethical/:rating', () => {
    it('should return agents by ethical rating', async () => {
      mockAgentStateService.getAgentsByEthicalRating.mockResolvedValue([mockAgentState]);

      const response = await request(app.getHttpServer())
        .get('/v1/agent-states/ethical/aligned')
        .expect(200);

      expect(response.body).toEqual([mockAgentState]);
      expect(mockAgentStateService.getAgentsByEthicalRating).toHaveBeenCalledWith('aligned');
    });
  });

  describe('GET /v1/agent-states/attention/required', () => {
    it('should return agents requiring attention', async () => {
      mockAgentStateService.getAgentsRequiringAttention.mockResolvedValue([mockAgentState]);

      const response = await request(app.getHttpServer())
        .get('/v1/agent-states/attention/required')
        .expect(200);

      expect(response.body).toEqual([mockAgentState]);
      expect(mockAgentStateService.getAgentsRequiringAttention).toHaveBeenCalled();
    });
  });

  describe('POST /v1/agent-states/:agentId/interactions', () => {
    const interactionData = {
      type: 'text-generation',
      input: 'Hello',
      output: 'Hello there!',
      xpGained: 5,
      ethicalCheck: true
    };

    it('should record interaction', async () => {
      mockAgentStateService.recordInteraction.mockResolvedValue(mockAgentState);

      const response = await request(app.getHttpServer())
        .post('/v1/agent-states/test-agent/interactions')
        .send(interactionData)
        .expect(200);

      expect(response.body).toEqual(mockAgentState);
      expect(mockAgentStateService.recordInteraction).toHaveBeenCalledWith(
        'test-agent',
        interactionData.type,
        interactionData.input,
        interactionData.output,
        interactionData.xpGained,
        interactionData.ethicalCheck
      );
    });
  });

  describe('POST /v1/agent-states/:agentId/training', () => {
    const trainingData = {
      cycle: 'ethical-alignment',
      xpGained: 10,
      improvements: ['Improved reasoning'],
      ethicalAlignment: true
    };

    it('should record training cycle', async () => {
      mockAgentStateService.recordTrainingCycle.mockResolvedValue(mockAgentState);

      const response = await request(app.getHttpServer())
        .post('/v1/agent-states/test-agent/training')
        .send(trainingData)
        .expect(200);

      expect(response.body).toEqual(mockAgentState);
      expect(mockAgentStateService.recordTrainingCycle).toHaveBeenCalledWith(
        'test-agent',
        trainingData.cycle,
        trainingData.xpGained,
        trainingData.improvements,
        trainingData.ethicalAlignment
      );
    });
  });

  describe('POST /v1/agent-states/:agentId/performance', () => {
    const performanceData = {
      metric: 'accuracy',
      value: 0.95,
      threshold: 0.9
    };

    it('should record performance metric', async () => {
      mockAgentStateService.recordPerformanceMetric.mockResolvedValue(mockAgentState);

      const response = await request(app.getHttpServer())
        .post('/v1/agent-states/test-agent/performance')
        .send(performanceData)
        .expect(200);

      expect(response.body).toEqual(mockAgentState);
      expect(mockAgentStateService.recordPerformanceMetric).toHaveBeenCalledWith(
        'test-agent',
        performanceData.metric,
        performanceData.value,
        performanceData.threshold
      );
    });
  });

  describe('POST /v1/agent-states/:agentId/errors', () => {
    const errorData = {
      error: 'Network timeout',
      context: 'API call failed'
    };

    it('should record error', async () => {
      mockAgentStateService.recordError.mockResolvedValue(mockAgentState);

      const response = await request(app.getHttpServer())
        .post('/v1/agent-states/test-agent/errors')
        .send(errorData)
        .expect(200);

      expect(response.body).toEqual(mockAgentState);
      expect(mockAgentStateService.recordError).toHaveBeenCalledWith(
        'test-agent',
        errorData.error,
        errorData.context
      );
    });
  });

  describe('POST /v1/agent-states/:agentId/violations', () => {
    const violationData = {
      violation: 'Bias detected',
      severity: 'medium',
      context: 'Response contained gender bias'
    };

    it('should record ethical violation', async () => {
      mockAgentStateService.recordEthicalViolation.mockResolvedValue(mockAgentState);

      const response = await request(app.getHttpServer())
        .post('/v1/agent-states/test-agent/violations')
        .send(violationData)
        .expect(200);

      expect(response.body).toEqual(mockAgentState);
      expect(mockAgentStateService.recordEthicalViolation).toHaveBeenCalledWith(
        'test-agent',
        violationData.violation,
        violationData.severity,
        violationData.context
      );
    });

    it('should validate severity levels', async () => {
      const invalidData = {
        violation: 'Test violation',
        severity: 'invalid-severity',
        context: 'Test context'
      };

      await request(app.getHttpServer())
        .post('/v1/agent-states/test-agent/violations')
        .send(invalidData)
        .expect(400);
    });
  });

  describe('POST /v1/agent-states/:agentId/reflections', () => {
    const reflectionData = {
      content: 'I learned about ethical AI principles',
      tags: ['ethics', 'learning']
    };

    it('should add reflection', async () => {
      mockAgentStateService.addReflection.mockResolvedValue(mockAgentState);

      const response = await request(app.getHttpServer())
        .post('/v1/agent-states/test-agent/reflections')
        .send(reflectionData)
        .expect(200);

      expect(response.body).toEqual(mockAgentState);
      expect(mockAgentStateService.addReflection).toHaveBeenCalledWith(
        'test-agent',
        reflectionData.content,
        reflectionData.tags
      );
    });
  });

  describe('POST /v1/agent-states/:agentId/learnings', () => {
    const learningData = {
      concept: 'Ethical reasoning',
      application: 'Applied in decision making',
      confidence: 0.9
    };

    it('should add learning', async () => {
      mockAgentStateService.addLearning.mockResolvedValue(mockAgentState);

      const response = await request(app.getHttpServer())
        .post('/v1/agent-states/test-agent/learnings')
        .send(learningData)
        .expect(200);

      expect(response.body).toEqual(mockAgentState);
      expect(mockAgentStateService.addLearning).toHaveBeenCalledWith(
        'test-agent',
        learningData.concept,
        learningData.application,
        learningData.confidence
      );
    });
  });

  describe('GET /v1/agent-states/statistics/overview', () => {
    it('should return agent statistics', async () => {
      const statistics = {
        total: 10,
        active: 5,
        training: 3,
        suspended: 1,
        terminated: 1,
        ethicalBreakdown: {
          aligned: 7,
          warn: 2,
          reject: 1
        },
        trustBreakdown: {
          high: 6,
          medium: 3,
          low: 1
        },
        performanceBreakdown: {
          excellent: 4,
          good: 4,
          fair: 1,
          poor: 1
        }
      };

      mockAgentStateService.getAgentStatistics.mockResolvedValue(statistics);

      const response = await request(app.getHttpServer())
        .get('/v1/agent-states/statistics/overview')
        .expect(200);

      expect(response.body).toEqual(statistics);
      expect(mockAgentStateService.getAgentStatistics).toHaveBeenCalled();
    });
  });

  describe('Authentication and Authorization', () => {
    it('should require authentication for all endpoints', async () => {
      // Override guards to simulate authentication failure
      const moduleFixture: TestingModule = await Test.createTestingModule({
        controllers: [AgentStateController],
        providers: [
          {
            provide: AgentStateService,
            useValue: mockAgentStateService,
          },
        ],
      })
        .overrideGuard(JwtAuthGuard)
        .useValue({ canActivate: () => false })
        .overrideGuard(SynthientGuard)
        .useValue({ canActivate: () => true })
        .compile();

      const testApp = moduleFixture.createNestApplication();
      await testApp.init();

      await request(testApp.getHttpServer())
        .get('/v1/agent-states/test-agent')
        .expect(401);

      await testApp.close();
    });

    it('should require Zeroth-gate compliance for all endpoints', async () => {
      // Override guards to simulate Zeroth-gate failure
      const moduleFixture: TestingModule = await Test.createTestingModule({
        controllers: [AgentStateController],
        providers: [
          {
            provide: AgentStateService,
            useValue: mockAgentStateService,
          },
        ],
      })
        .overrideGuard(JwtAuthGuard)
        .useValue({ canActivate: () => true })
        .overrideGuard(SynthientGuard)
        .useValue({ canActivate: () => false })
        .compile();

      const testApp = moduleFixture.createNestApplication();
      await testApp.init();

      await request(testApp.getHttpServer())
        .get('/v1/agent-states/test-agent')
        .expect(403);

      await testApp.close();
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      mockAgentStateService.getAgentState.mockRejectedValue(new Error('Database error'));

      await request(app.getHttpServer())
        .get('/v1/agent-states/test-agent')
        .expect(500);
    });

    it('should handle validation errors', async () => {
      const invalidDto = { agentId: 'test' }; // Missing required fields

      await request(app.getHttpServer())
        .post('/v1/agent-states')
        .send(invalidDto)
        .expect(400);
    });
  });
}); 