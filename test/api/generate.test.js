const request = require('supertest');
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../../dist/app.module');

describe('Generate API Endpoints', () => {
  let app;
  let server;

  beforeAll(async () => {
    app = await NestFactory.create(AppModule);
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /v1/generate/text', () => {
    it('should generate text successfully with valid prompt', async () => {
      const response = await request(server)
        .post('/v1/generate/text')
        .send({
          prompt: 'Hello, how are you?'
        })
        .expect(201);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('text');
      expect(response.body.data).toHaveProperty('confidence');
      expect(response.body.data).toHaveProperty('type');
      expect(response.body.data).toHaveProperty('metadata');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should handle empty prompt', async () => {
      const response = await request(server)
        .post('/v1/generate/text')
        .send({
          prompt: ''
        })
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
      expect(response.body).toHaveProperty('message');
    });

    it('should handle missing prompt', async () => {
      const response = await request(server)
        .post('/v1/generate/text')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
      expect(response.body).toHaveProperty('message');
    });

    it('should handle invalid JSON', async () => {
      const response = await request(server)
        .post('/v1/generate/text')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
    });

    it('should handle streaming requests', async () => {
      const response = await request(server)
        .post('/v1/generate/text')
        .send({
          prompt: 'Tell me about Zeropoint Protocol',
          stream: true
        })
        .expect(201);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
    });

    it('should handle context in request', async () => {
      const response = await request(server)
        .post('/v1/generate/text')
        .send({
          prompt: 'Continue the conversation',
          context: {
            conversation: [
              { role: 'user', content: 'Hello' },
              { role: 'assistant', content: 'Hi there!' }
            ]
          }
        })
        .expect(201);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
    });

    it('should return appropriate confidence scores', async () => {
      const response = await request(server)
        .post('/v1/generate/text')
        .send({
          prompt: 'What is AI safety?'
        })
        .expect(201);

      expect(response.body.data.confidence).toBeGreaterThanOrEqual(0);
      expect(response.body.data.confidence).toBeLessThanOrEqual(1);
    });

    it('should return appropriate response types', async () => {
      const response = await request(server)
        .post('/v1/generate/text')
        .send({
          prompt: 'Hello'
        })
        .expect(201);

      const validTypes = ['greeting', 'informational', 'question', 'command', 'error'];
      expect(validTypes).toContain(response.body.data.type);
    });

    it('should include metadata in response', async () => {
      const response = await request(server)
        .post('/v1/generate/text')
        .send({
          prompt: 'Test prompt'
        })
        .expect(201);

      expect(response.body.data.metadata).toHaveProperty('prompt');
      expect(response.body.data.metadata).toHaveProperty('timestamp');
      expect(response.body.data.metadata).toHaveProperty('model');
    });

    it('should handle long prompts', async () => {
      const longPrompt = 'A'.repeat(1000);
      const response = await request(server)
        .post('/v1/generate/text')
        .send({
          prompt: longPrompt
        })
        .expect(201);

      expect(response.body).toHaveProperty('status', 'success');
    });

    it('should handle special characters in prompt', async () => {
      const response = await request(server)
        .post('/v1/generate/text')
        .send({
          prompt: 'Test with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?'
        })
        .expect(201);

      expect(response.body).toHaveProperty('status', 'success');
    });
  });

  describe('GET /v1/generate/text/stream', () => {
    it('should return streaming endpoint', async () => {
      const response = await request(server)
        .get('/v1/generate/text/stream')
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('POST /v1/generate/image', () => {
    it('should handle image generation requests', async () => {
      const response = await request(server)
        .post('/v1/generate/image')
        .send({
          prompt: 'A futuristic AI interface'
        })
        .expect(201);

      expect(response.body).toHaveProperty('status');
    });
  });
}); 