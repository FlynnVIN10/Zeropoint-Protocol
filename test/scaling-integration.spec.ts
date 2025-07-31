import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { soulchain } from '../src/agents/soulchain/soulchain.ledger.js';

describe('Scaling Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.spyOn(soulchain, 'addXPTransaction').mockResolvedValue('test-cid');
  });

  describe('/v1/scaling/predict (POST)', () => {
    it('should predict scaling requirements with traffic heuristics', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/scaling/predict')
        .send({
          timeWindow: 300,
          trafficPattern: { peakHours: [9, 10, 11] }
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('predictedLoad');
      expect(response.body.data).toHaveProperty('recommendedInstances');
      expect(response.body.data).toHaveProperty('confidence');
      expect(response.body.data).toHaveProperty('factors');
      expect(response.body.data.factors).toHaveProperty('hour');
      expect(response.body.data.factors).toHaveProperty('isWeekend');
    });

    it('should log SOULSCALE:PREDICT to soulchain', async () => {
      await request(app.getHttpServer())
        .post('/v1/scaling/predict')
        .send({ timeWindow: 300 })
        .expect(200);

      expect(soulchain.addXPTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          agentId: 'consensus-bridge',
          rationale: expect.stringContaining('SOULSCALE:PREDICT')
        })
      );
    });

    it('should handle ethical validation failures', async () => {
      // Mock checkIntent to return false
      jest.spyOn(require('../src/guards/synthient.guard.js'), 'checkIntent').mockReturnValue(false);

      const response = await request(app.getHttpServer())
        .post('/v1/scaling/predict')
        .send({ timeWindow: 300 })
        .expect(403);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Zeroth-gate blocked');
    });
  });

  describe('/v1/scaling/expand (POST)', () => {
    it('should expand scaling with node addition simulation', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/scaling/expand')
        .send({
          nodes: 2,
          reason: 'High traffic load detected'
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('nodesAdded', 2);
      expect(response.body.data).toHaveProperty('totalInstances');
      expect(response.body.data).toHaveProperty('estimatedTime');
      expect(response.body.data).toHaveProperty('reason');
    });

    it('should log SOULSCALE:EXPAND to soulchain', async () => {
      await request(app.getHttpServer())
        .post('/v1/scaling/expand')
        .send({ nodes: 1, reason: 'Auto-scaling triggered' })
        .expect(200);

      expect(soulchain.addXPTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          agentId: 'consensus-bridge',
          rationale: expect.stringContaining('SOULSCALE:EXPAND')
        })
      );
    });

    it('should handle ethical validation failures for expansion', async () => {
      // Mock checkIntent to return false
      jest.spyOn(require('../src/guards/synthient.guard.js'), 'checkIntent').mockReturnValue(false);

      const response = await request(app.getHttpServer())
        .post('/v1/scaling/expand')
        .send({ nodes: 1 })
        .expect(403);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Zeroth-gate blocked');
    });
  });

  describe('/v1/scaling/status (GET)', () => {
    it('should return current scaling status', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/scaling/status')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('autoScaling');
      expect(response.body.data).toHaveProperty('currentInstances');
      expect(response.body.data).toHaveProperty('maxInstances');
      expect(response.body.data).toHaveProperty('resourceUsage');
      expect(response.body.data.resourceUsage).toHaveProperty('cpu');
      expect(response.body.data.resourceUsage).toHaveProperty('memory');
      expect(response.body.data).toHaveProperty('performance');
      expect(response.body.data.performance).toHaveProperty('requestsPerSecond');
      expect(response.body.data.performance).toHaveProperty('responseTime');
    });

    it('should include timestamp in response', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/scaling/status')
        .expect(200);

      expect(response.body.data).toHaveProperty('timestamp');
      expect(new Date(response.body.data.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('Advanced AI Endpoints', () => {
    describe('/v1/advanced/summarize (POST)', () => {
      it('should process text summarization with ethical validation', async () => {
        const response = await request(app.getHttpServer())
          .post('/v1/advanced/summarize')
          .send({
            text: 'This is a test text for summarization. It contains multiple sentences that should be summarized into a concise format.',
            options: { maxLength: 100, style: 'concise' }
          })
          .expect(200);

        expect(response.body).toHaveProperty('summary');
        expect(response.body).toHaveProperty('key_points');
        expect(response.body).toHaveProperty('confidence');
        expect(response.body).toHaveProperty('metadata');
        expect(response.body.metadata).toHaveProperty('ethical_validation', 'passed');
        expect(response.body.metadata).toHaveProperty('soulchain_logged', true);
      });
    });

    describe('/v1/advanced/context-prompt (POST)', () => {
      it('should process context-aware prompting with ethical validation', async () => {
        const response = await request(app.getHttpServer())
          .post('/v1/advanced/context-prompt')
          .send({
            prompt: 'What is the main topic?',
            context: 'This document discusses artificial intelligence and its applications in modern technology.',
            options: { temperature: 0.7, maxTokens: 500 }
          })
          .expect(200);

        expect(response.body).toHaveProperty('response');
        expect(response.body).toHaveProperty('context_used');
        expect(response.body).toHaveProperty('confidence');
        expect(response.body).toHaveProperty('metadata');
        expect(response.body.metadata).toHaveProperty('ethical_validation', 'passed');
        expect(response.body.metadata).toHaveProperty('soulchain_logged', true);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed requests gracefully', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/scaling/predict')
        .send({ invalidField: 'invalid value' })
        .expect(200); // Should still work with extra fields

      expect(response.body.status).toBe('success');
    });

    it('should handle missing required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/scaling/expand')
        .send({})
        .expect(200); // Should use defaults

      expect(response.body.status).toBe('success');
      expect(response.body.data.nodesAdded).toBe(1);
    });
  });
}); 