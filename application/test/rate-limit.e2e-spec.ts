import { INestApplication } from '@nestjs/common';
import request from 'supertest';

describe('job creation rate limit (e2e)', () => {
  let app: INestApplication;
  let token: string;
  const previous = process.env.JOB_RATE_LIMIT_PER_MINUTE;

  beforeAll(async () => {
    process.env.JOB_RATE_LIMIT_PER_MINUTE = '3';
    const { createApp } = await import('./e2e-app');
    app = await createApp();
    const response = await request(app.getHttpServer())
      .post('/user')
      .send({ name: 'T', surname: 'U', email: `rl${Date.now()}@test.dev`, password: 'a-strong-password' })
      .expect(201);
    token = response.body.token;
  });

  afterAll(async () => {
    if (previous === undefined) delete process.env.JOB_RATE_LIMIT_PER_MINUTE;
    else process.env.JOB_RATE_LIMIT_PER_MINUTE = previous;
    await app.close();
  });

  it('answers 429 after the configured number of job creations per minute, and only for job creation', async () => {
    const payload = { name: 'rl', export_format: 'csv', query: [{ uri: 'http://bad', collection: 'people', field: 'a', operator: 'eq', value: 1 }] };
    const statuses: number[] = [];
    for (let attempt = 0; attempt < 5; attempt++) {
      statuses.push(
        (
          await request(app.getHttpServer())
            .post('/job')
            .set({ Authorization: `Bearer ${token}` })
            .send(payload)
        ).status,
      );
    }
    expect(statuses).toEqual([400, 400, 400, 429, 429]);
    await request(app.getHttpServer())
      .get('/job')
      .set({ Authorization: `Bearer ${token}` })
      .expect(200);
  });
});
