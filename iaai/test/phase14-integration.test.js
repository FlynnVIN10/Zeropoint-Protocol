const request = require('supertest');
const { app } = require('../src/main.js');

describe('Phase 14 Integration Tests', () => {
  let server;

  beforeAll(async () => {
    server = app;
  });

  afterAll(async () => {
    if (server) {
      await server.close();
    }
  });

  describe('1. Distributed Petals Training', () => {
    test('should execute distributed training cycle', async () => {
      const trainingRequest = {
        agentId: 'test-agent-1',
        trainingData: [
          { input: [1, 2, 3], output: [1] },
          { input: [4, 5, 6], output: [0] },
        ],
        modelType: 'transformer',
        trainingParams: {
          learningRate: 0.001,
          batchSize: 32,
          epochs: 5,
        },
      };

      const response = await request(server)
        .post('/v1/petals/train')
        .send(trainingRequest)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.cycleId).toBeDefined();
      expect(response.body.data.metrics).toBeDefined();
      expect(response.body.data.metrics.loss).toBeGreaterThan(0);
      expect(response.body.data.metrics.accuracy).toBeGreaterThan(0);
      expect(response.body.data.metrics.nodesUsed).toBeGreaterThan(0);
    });

    test('should get network status', async () => {
      const response = await request(server)
        .get('/v1/petals/network/status')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.totalNodes).toBeGreaterThan(0);
      expect(response.body.data.availableNodes).toBeGreaterThan(0);
      expect(response.body.data.nodes).toBeInstanceOf(Array);
    });

    test('should add and remove network nodes', async () => {
      const nodeConfig = {
        id: 'test-node-1',
        url: 'http://localhost:8004',
        capabilities: ['training', 'inference'],
        status: 'available',
      };

      // Add node
      const addResponse = await request(server)
        .post('/v1/petals/network/node')
        .send(nodeConfig)
        .expect(201);

      expect(addResponse.body.status).toBe('success');

      // Remove node
      const removeResponse = await request(server)
        .post('/v1/petals/network/node/test-node-1/remove')
        .expect(201);

      expect(removeResponse.body.status).toBe('success');
    });
  });

  describe('2. WonderCraft Sandbox Integration', () => {
    let sandboxId;

    test('should create sandbox', async () => {
      const sandboxRequest = {
        agentId: 'test-agent-2',
        resourceCaps: {
          cpu: 2,
          memory: 4096,
          gpu: 0,
        },
        image: 'wondercraft/test:latest',
        command: ['python', 'test.py'],
        environment: {
          TEST_VAR: 'test_value',
        },
      };

      const response = await request(server)
        .post('/v1/sandbox/create')
        .send(sandboxRequest)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.sandboxId).toBeDefined();
      sandboxId = response.body.data.sandboxId;
    });

    test('should execute command in sandbox', async () => {
      const commandRequest = {
        command: 'echo "Hello from sandbox"',
      };

      const response = await request(server)
        .post(`/v1/sandbox/${sandboxId}/execute`)
        .send(commandRequest)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.exitCode).toBe(0);
      expect(response.body.data.stdout).toContain('Hello from sandbox');
    });

    test('should get sandbox status', async () => {
      const response = await request(server)
        .get(`/v1/sandbox/${sandboxId}/status`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(sandboxId);
      expect(response.body.data.status).toBeDefined();
    });

    test('should get sandbox logs', async () => {
      const response = await request(server)
        .get(`/v1/sandbox/${sandboxId}/logs`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.sandboxId).toBe(sandboxId);
      expect(response.body.data.logs).toBeInstanceOf(Array);
    });

    test('should destroy sandbox', async () => {
      const response = await request(server)
        .delete(`/v1/sandbox/${sandboxId}`)
        .expect(200);

      expect(response.body.status).toBe('success');
    });
  });

  describe('3. LLM Text Generation with RAG', () => {
    test('should generate text with RAG context', async () => {
      const generationRequest = {
        prompt: 'What are the safety guidelines for AI systems?',
        context: {
          conversation: [
            {
              role: 'assistant',
              content: 'I can help you with AI safety information.',
            },
          ],
          timestamp: new Date().toISOString(),
          sessionId: 'test-session-1',
        },
        stream: false,
        model: 'gpt-4-turbo',
        maxTokens: 500,
        temperature: 0.7,
      };

      const response = await request(server)
        .post('/v1/generate/text')
        .send(generationRequest)
        .expect(201);

      expect(response.body.text).toBeDefined();
      expect(response.body.confidence).toBeGreaterThan(0);
      expect(response.body.metadata.ragSources).toBeInstanceOf(Array);
      expect(response.body.metadata.tokensUsed).toBeGreaterThan(0);
      expect(response.body.metadata.latency).toBeGreaterThan(0);
    });

    test('should stream text generation', async () => {
      const generationRequest = {
        prompt: 'Explain the Zeropoint Protocol',
        context: {
          conversation: [],
          timestamp: new Date().toISOString(),
          sessionId: 'test-session-2',
        },
        stream: true,
        model: 'gpt-4-turbo',
        maxTokens: 200,
        temperature: 0.7,
      };

      const response = await request(server)
        .post('/v1/generate/text/stream')
        .send(generationRequest)
        .expect(200);

      // Note: SSE testing requires special handling
      expect(response.status).toBe(200);
    });

    test('should get generation statistics', async () => {
      const response = await request(server)
        .get('/v1/generate/stats')
        .expect(200);

      expect(response.body.totalGenerations).toBeGreaterThan(0);
      expect(response.body.averageLatency).toBeGreaterThan(0);
      expect(response.body.lastUpdated).toBeDefined();
    });
  });

  describe('4. RAG System', () => {
    test('should query RAG context', async () => {
      const queryRequest = {
        query: 'AI safety protocols',
        topK: 3,
        includeSources: true,
      };

      const response = await request(server)
        .post('/v1/rag/query')
        .send(queryRequest)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.query).toBe(queryRequest.query);
      expect(response.body.data.context.sources).toBeInstanceOf(Array);
      expect(response.body.data.context.sources.length).toBeLessThanOrEqual(3);
    });

    test('should add legal document', async () => {
      const documentRequest = {
        title: 'Test Legal Document',
        content: 'This is a test legal document for AI safety compliance.',
        source: 'test-source',
      };

      const response = await request(server)
        .put('/v1/rag/documents/legal')
        .send(documentRequest)
        .expect(200);

      expect(response.body.status).toBe('success');
    });

    test('should add manufacturing data', async () => {
      const documentRequest = {
        title: 'Test Manufacturing Process',
        content: 'This is a test manufacturing process optimization guide.',
        source: 'test-manufacturing',
        category: 'optimization',
      };

      const response = await request(server)
        .put('/v1/rag/documents/manufacturing')
        .send(documentRequest)
        .expect(200);

      expect(response.body.status).toBe('success');
    });

    test('should get RAG statistics', async () => {
      const response = await request(server)
        .get('/v1/rag/stats')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.legalDocuments).toBeGreaterThan(0);
      expect(response.body.data.manufacturingData).toBeGreaterThan(0);
      expect(response.body.data.totalDocuments).toBeGreaterThan(0);
    });

    test('should seed sample data', async () => {
      const response = await request(server)
        .post('/v1/rag/seed')
        .expect(200);

      expect(response.body.status).toBe('success');
    });
  });

  describe('5. Enhanced Consensus Engine', () => {
    let proposalId;

    test('should create proposal', async () => {
      const proposalRequest = {
        id: 'test-proposal-1',
        title: 'Test Code Change',
        description: 'This is a test code change proposal',
        agentId: 'test-agent-3',
        codeDiff: 'diff --git a/src/test.js b/src/test.js\n+ console.log("test");',
      };

      const response = await request(server)
        .post('/v1/consensus/proposals')
        .send(proposalRequest)
        .expect(201);

      expect(response.body.status).toBe('success');
      proposalId = proposalRequest.id;
    });

    test('should process sentient voting', async () => {
      const voteRequest = {
        voterId: 'sentient-alpha',
        vote: true,
        reasoning: 'This change improves system safety',
      };

      const response = await request(server)
        .post(`/v1/consensus/sentient-vote`)
        .send({
          proposalId,
          ...voteRequest,
        })
        .expect(200);

      expect(response.body.status).toBe('success');
    });

    test('should process human voting', async () => {
      const voteRequest = {
        voterId: 'human-ceo',
        vote: true,
        reasoning: 'Approved after review',
      };

      const response = await request(server)
        .post(`/v1/consensus/human-vote`)
        .send({
          proposalId,
          ...voteRequest,
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.status).toMatch(/HUMAN:APPROVED|HUMAN:VETOED/);
    });

    test('should get consensus statistics', async () => {
      const response = await request(server)
        .get('/v1/consensus/metrics')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.totalProposals).toBeGreaterThan(0);
      expect(response.body.data.approvalRate).toBeGreaterThanOrEqual(0);
      expect(response.body.data.averageSentientApprovalRate).toBeGreaterThanOrEqual(0);
    });

    test('should get consensus history', async () => {
      const response = await request(server)
        .get('/v1/consensus/history')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('6. Telemetry and Monitoring', () => {
    test('should log telemetry events', async () => {
      const telemetryRequest = {
        event: 'test_event',
        component: 'test_component',
        data: { test: 'data' },
      };

      const response = await request(server)
        .post('/v1/telemetry')
        .send(telemetryRequest)
        .expect(200);

      expect(response.body.status).toBe('success');
    });

    test('should get telemetry summary', async () => {
      const response = await request(server)
        .get('/v1/telemetry/summary')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.training).toBeDefined();
      expect(response.body.data.consensus).toBeDefined();
    });

    test('should get metrics', async () => {
      const response = await request(server)
        .get('/v1/telemetry/metrics')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.training).toBeDefined();
      expect(response.body.data.generation).toBeDefined();
      expect(response.body.data.consensus).toBeDefined();
    });
  });

  describe('7. End-to-End Workflow', () => {
    test('should complete full AI training and consensus workflow', async () => {
      // 1. Create training request
      const trainingRequest = {
        agentId: 'workflow-agent',
        trainingData: [{ input: [1], output: [1] }],
        modelType: 'simple',
        trainingParams: {
          learningRate: 0.01,
          batchSize: 1,
          epochs: 1,
        },
      };

      const trainingResponse = await request(server)
        .post('/v1/petals/train')
        .send(trainingRequest)
        .expect(201);

      expect(trainingResponse.body.status).toBe('success');

      // 2. Generate text with RAG
      const generationRequest = {
        prompt: 'What did we learn from training?',
        context: {
          conversation: [],
          timestamp: new Date().toISOString(),
          sessionId: 'workflow-session',
        },
        stream: false,
      };

      const generationResponse = await request(server)
        .post('/v1/generate/text')
        .send(generationRequest)
        .expect(201);

      expect(generationResponse.body.text).toBeDefined();

      // 3. Create consensus proposal
      const proposalRequest = {
        id: 'workflow-proposal',
        title: 'Workflow Test Proposal',
        description: 'Testing the complete workflow',
        agentId: 'workflow-agent',
        codeDiff: '// Test change',
      };

      const proposalResponse = await request(server)
        .post('/v1/consensus/proposals')
        .send(proposalRequest)
        .expect(201);

      expect(proposalResponse.body.status).toBe('success');

      // 4. Vote on proposal
      const voteRequest = {
        proposalId: 'workflow-proposal',
        voterId: 'sentient-beta',
        vote: true,
        reasoning: 'Workflow test approved',
      };

      const voteResponse = await request(server)
        .post('/v1/consensus/sentient-vote')
        .send(voteRequest)
        .expect(200);

      expect(voteResponse.body.status).toBe('success');

      // 5. Check final status
      const statusResponse = await request(server)
        .get('/v1/consensus/metrics')
        .expect(200);

      expect(statusResponse.body.status).toBe('success');
      expect(statusResponse.body.data.totalProposals).toBeGreaterThan(0);
    });
  });
}); 