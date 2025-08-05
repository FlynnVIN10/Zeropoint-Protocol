const request = require('supertest');
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../../dist/app.module');

describe('Dashboard API Endpoints', () => {
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

  describe('POST /v1/dashboard/telemetry', () => {
    it('should log telemetry successfully with valid event data', async () => {
      const response = await request(server)
        .post('/v1/dashboard/telemetry')
        .send({
          event: 'test_event',
          data: { component: 'test_component' }
        })
        .expect(200);

      expect(response.body).toHaveProperty('status', 'logged');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should handle telemetry with type and component', async () => {
      const response = await request(server)
        .post('/v1/dashboard/telemetry')
        .send({
          type: 'interaction',
          component: 'chat_input'
        })
        .expect(200);

      expect(response.body).toHaveProperty('status', 'logged');
    });

    it('should handle telemetry with metadata', async () => {
      const response = await request(server)
        .post('/v1/dashboard/telemetry')
        .send({
          event: 'button_click',
          data: {
            component: 'submit_button',
            metadata: {
              buttonId: 'submit',
              timestamp: Date.now()
            }
          }
        })
        .expect(200);

      expect(response.body).toHaveProperty('status', 'logged');
    });

    it('should handle empty data object', async () => {
      const response = await request(server)
        .post('/v1/dashboard/telemetry')
        .send({
          event: 'test',
          data: {}
        })
        .expect(200);

      expect(response.body).toHaveProperty('status', 'logged');
    });

    it('should handle missing data property', async () => {
      const response = await request(server)
        .post('/v1/dashboard/telemetry')
        .send({
          event: 'test'
        })
        .expect(200);

      expect(response.body).toHaveProperty('status', 'logged');
    });

    it('should handle various event types', async () => {
      const eventTypes = ['click', 'hover', 'focus', 'blur', 'submit', 'error'];
      
      for (const eventType of eventTypes) {
        const response = await request(server)
          .post('/v1/dashboard/telemetry')
          .send({
            event: eventType,
            data: { component: 'test' }
          })
          .expect(200);

        expect(response.body).toHaveProperty('status', 'logged');
      }
    });

    it('should handle various component types', async () => {
      const components = ['button', 'input', 'form', 'modal', 'sidebar', 'header'];
      
      for (const component of components) {
        const response = await request(server)
          .post('/v1/dashboard/telemetry')
          .send({
            event: 'interaction',
            data: { component }
          })
          .expect(200);

        expect(response.body).toHaveProperty('status', 'logged');
      }
    });

    it('should handle complex metadata', async () => {
      const response = await request(server)
        .post('/v1/dashboard/telemetry')
        .send({
          event: 'form_submit',
          data: {
            component: 'contact_form',
            metadata: {
              formId: 'contact',
              fields: ['name', 'email', 'message'],
              validationErrors: [],
              submissionTime: Date.now(),
              userAgent: 'test-agent'
            }
          }
        })
        .expect(200);

      expect(response.body).toHaveProperty('status', 'logged');
    });

    it('should handle invalid JSON', async () => {
      const response = await request(server)
        .post('/v1/dashboard/telemetry')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
    });

    it('should handle missing event and type', async () => {
      const response = await request(server)
        .post('/v1/dashboard/telemetry')
        .send({
          data: { component: 'test' }
        })
        .expect(200);

      expect(response.body).toHaveProperty('status', 'logged');
    });

    it('should handle large payloads', async () => {
      const largeData = {
        event: 'large_payload',
        data: {
          component: 'test',
          metadata: {
            largeArray: Array(1000).fill('test'),
            timestamp: Date.now()
          }
        }
      };

      const response = await request(server)
        .post('/v1/dashboard/telemetry')
        .send(largeData)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'logged');
    });
  });

  describe('GET /v1/dashboard/stream', () => {
    it('should return dashboard stream endpoint', async () => {
      const response = await request(server)
        .get('/v1/dashboard/stream')
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('GET /v1/dashboard/agents/xp', () => {
    it('should return agent XP data', async () => {
      const response = await request(server)
        .get('/v1/dashboard/agents/xp')
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('GET /v1/dashboard/status', () => {
    it('should return dashboard status', async () => {
      const response = await request(server)
        .get('/v1/dashboard/status')
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });
}); 