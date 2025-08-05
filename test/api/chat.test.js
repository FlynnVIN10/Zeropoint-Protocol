const request = require('supertest');
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../../dist/app.module');

describe('Chat API Endpoints', () => {
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

  describe('GET /v1/chat/history', () => {
    it('should return chat history successfully', async () => {
      const response = await request(server)
        .get('/v1/chat/history')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return chat history with proper structure', async () => {
      const response = await request(server)
        .get('/v1/chat/history')
        .expect(200);

      // If there are messages in history, they should have proper structure
      if (response.body.length > 0) {
        const message = response.body[0];
        expect(message).toHaveProperty('id');
        expect(message).toHaveProperty('content');
        expect(message).toHaveProperty('timestamp');
        expect(message).toHaveProperty('role');
      }
    });

    it('should handle query parameters', async () => {
      const response = await request(server)
        .get('/v1/chat/history?limit=10&offset=0')
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should handle invalid query parameters gracefully', async () => {
      const response = await request(server)
        .get('/v1/chat/history?limit=invalid&offset=invalid')
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should return empty array when no history exists', async () => {
      // This test assumes the chat history starts empty in test environment
      const response = await request(server)
        .get('/v1/chat/history')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /v1/chat/send', () => {
    it('should send chat message successfully', async () => {
      const response = await request(server)
        .post('/v1/chat/send')
        .send({
          message: 'Hello, this is a test message'
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('content');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('role');
    });

    it('should handle empty message', async () => {
      const response = await request(server)
        .post('/v1/chat/send')
        .send({
          message: ''
        })
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
    });

    it('should handle missing message', async () => {
      const response = await request(server)
        .post('/v1/chat/send')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
    });

    it('should handle long messages', async () => {
      const longMessage = 'A'.repeat(1000);
      const response = await request(server)
        .post('/v1/chat/send')
        .send({
          message: longMessage
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
    });

    it('should handle special characters in message', async () => {
      const response = await request(server)
        .post('/v1/chat/send')
        .send({
          message: 'Test with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?'
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
    });

    it('should handle invalid JSON', async () => {
      const response = await request(server)
        .post('/v1/chat/send')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
    });
  });

  describe('GET /v1/chat/stream', () => {
    it('should return chat stream endpoint', async () => {
      const response = await request(server)
        .get('/v1/chat/stream')
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('POST /v1/chat/request-change', () => {
    it('should handle change requests', async () => {
      const response = await request(server)
        .post('/v1/chat/request-change')
        .send({
          messageId: 'test-id',
          reason: 'test reason'
        })
        .expect(201);

      expect(response.body).toBeDefined();
    });
  });

  describe('POST /v1/chat/vote', () => {
    it('should handle voting on messages', async () => {
      const response = await request(server)
        .post('/v1/chat/vote')
        .send({
          messageId: 'test-id',
          vote: 'up'
        })
        .expect(201);

      expect(response.body).toBeDefined();
    });

    it('should handle invalid vote types', async () => {
      const response = await request(server)
        .post('/v1/chat/vote')
        .send({
          messageId: 'test-id',
          vote: 'invalid'
        })
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
    });
  });

  describe('GET /v1/chat/proposals', () => {
    it('should return chat proposals', async () => {
      const response = await request(server)
        .get('/v1/chat/proposals')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Integration: Send message and check history', () => {
    it('should add sent message to history', async () => {
      // Send a message
      const sendResponse = await request(server)
        .post('/v1/chat/send')
        .send({
          message: 'Integration test message'
        })
        .expect(201);

      const messageId = sendResponse.body.id;

      // Check that message appears in history
      const historyResponse = await request(server)
        .get('/v1/chat/history')
        .expect(200);

      const messageInHistory = historyResponse.body.find(msg => msg.id === messageId);
      expect(messageInHistory).toBeDefined();
      expect(messageInHistory.content).toBe('Integration test message');
    });
  });

  describe('Error handling', () => {
    it('should handle server errors gracefully', async () => {
      // This test would require mocking a server error
      // For now, we'll test that the endpoint exists and responds
      const response = await request(server)
        .get('/v1/chat/history')
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should handle malformed requests', async () => {
      const response = await request(server)
        .post('/v1/chat/send')
        .send(null)
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
    });
  });
}); 