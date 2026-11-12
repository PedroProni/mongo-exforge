import { INestApplication } from '@nestjs/common';
import request from 'supertest';

describe('source uri guard with private addresses disabled (e2e)', () => {
  let app: INestApplication;
  let token: string;
  const previous = process.env.EXFORGE_ALLOW_PRIVATE_URIS;

  const payload = (uri: string) => ({ name: 'ssrf', export_format: 'csv', query: [{ uri, collection: 'people', field: 'age', operator: 'eq', value: 1 }] });

  beforeAll(async () => {
    process.env.EXFORGE_ALLOW_PRIVATE_URIS = 'false';
    const { createApp } = await import('./e2e-app');
    app = await createApp();
    const response = await request(app.getHttpServer())
      .post('/user')
      .send({ name: 'T', surname: 'U', email: `ssrf${Date.now()}@test.dev`, password: 'a-strong-password' })
      .expect(201);
    token = response.body.token;
  });

  afterAll(async () => {
    if (previous === undefined) delete process.env.EXFORGE_ALLOW_PRIVATE_URIS;
    else process.env.EXFORGE_ALLOW_PRIVATE_URIS = previous;
    await app.close();
  });

  it.each([
    'mongodb://127.0.0.1:27017/db',
    'mongodb://localhost:27017/db',
    'mongodb://169.254.169.254/db',
    'mongodb://10.0.0.5/db',
    'mongodb://192.168.1.1/db',
    'mongodb://[::1]:27017/db',
    'mongodb://[::ffff:127.0.0.1]:27017/db',
  ])('refuses to create a job for %s', async uri => {
    const response = await request(app.getHttpServer())
      .post('/job')
      .set({ Authorization: `Bearer ${token}` })
      .send(payload(uri))
      .expect(400);
    expect(JSON.stringify(response.body)).not.toContain('27017/db');
  });

  it.each(['mongodb://127.0.0.1:27017/db', 'mongodb://169.254.169.254/db'])('refuses to inspect %s', async uri => {
    await request(app.getHttpServer())
      .post('/mongo/inspect')
      .set({ Authorization: `Bearer ${token}` })
      .send({ uris: [uri] })
      .expect(400);
  });

  it.each(['http://127.0.0.1/db', 'file:///etc/passwd', 'redis://127.0.0.1:6379'])('refuses the scheme of %s', async uri => {
    await request(app.getHttpServer())
      .post('/job')
      .set({ Authorization: `Bearer ${token}` })
      .send(payload(uri))
      .expect(400);
  });

  it.each(['mongodb://127.0.0.1:27017/db', 'mongodb://169.254.169.254/db', 'mongodb://10.0.0.5/db'])('refuses to preview %s', async uri => {
    const response = await request(app.getHttpServer())
      .post('/preview')
      .set({ Authorization: `Bearer ${token}` })
      .send({ query: [{ uri, collection: 'people', field: 'age', operator: 'eq', value: 1 }] })
      .expect(400);
    expect(JSON.stringify(response.body)).not.toContain('27017/db');
  });

  it.each(['mongodb://127.0.0.1:27017/db', 'mongodb://169.254.169.254/db'])('refuses to save a template for %s', async uri => {
    await request(app.getHttpServer())
      .post('/template')
      .set({ Authorization: `Bearer ${token}` })
      .send(payload(uri))
      .expect(400);
  });
});
