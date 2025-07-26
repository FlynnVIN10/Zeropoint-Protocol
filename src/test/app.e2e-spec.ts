// © [2025] Zeropoint Protocol, LLC. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed license. See LICENSE.md for details.

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { checkIntent } from '../guards/synthient.guard';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  it('/v1/health (GET)', async () => {
    if (!checkIntent('health-check')) return;
    const res = await request(app.getHttpServer()).get('/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('/v1/register (POST)', async () => {
    if (!checkIntent('register')) return;
    const res = await request(app.getHttpServer())
      .post('/v1/register')
      .send({ username: 'testuser', password: 'testpass123' });
    expect(res.status).toBe(201);
    expect(res.body.username).toBe('testuser');
  });

  it('/v1/login (POST)', async () => {
    if (!checkIntent('login')) return;
    const res = await request(app.getHttpServer())
      .post('/v1/login')
      .send({ username: 'testuser', password: 'testpass123' });
    expect(res.status).toBe(201);
    expect(res.body.access_token).toBeDefined();
    accessToken = res.body.access_token;
  });

  it('/v1/protected (GET)', async () => {
    if (!checkIntent('protected')) return;
    const res = await request(app.getHttpServer())
      .get('/v1/protected')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('You have accessed a protected route.');
  });

  afterAll(async () => {
    await app.close();
  });
}); 