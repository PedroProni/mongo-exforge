import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { INestApplication } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import request from 'supertest';
import { createApp } from './e2e-app';

const SOURCE_DB = 'exforge_e2e_local_source';
const POLL_ATTEMPTS = 60;
const POLL_INTERVAL_MS = 500;

describe('local storage driver (e2e)', () => {
  let app: INestApplication;
  let mongo: MongoClient;
  let dir: string;
  let sourceUri: string;
  let tokenA: string;
  let tokenB: string;
  let jobId: string;

  const http = () => request(app.getHttpServer());
  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

  async function signUp(email: string): Promise<string> {
    return (await http().post('/user').send({ name: 'Test', surname: 'User', email, password: 'a-strong-password' }).expect(201)).body.token;
  }

  beforeAll(async () => {
    dir = await mkdtemp(join(tmpdir(), 'exforge-e2e-local-'));
    process.env.STORAGE_DRIVER = 'local';
    process.env.LOCAL_STORAGE_DIR = dir;
    app = await createApp();
    const base = process.env.MONGODB_URI as string;
    mongo = await MongoClient.connect(base);
    sourceUri = base.replace(/\/[^/?]+(\?|$)/, `/${SOURCE_DB}$1`);
    const people = mongo.db(SOURCE_DB).collection('people');
    await people.deleteMany({});
    await people.insertMany(Array.from({ length: 20 }, (_, i) => ({ name: `p${i}`, age: i })));
    tokenA = await signUp(`local-a-${Date.now()}@example.com`);
    tokenB = await signUp(`local-b-${Date.now()}@example.com`);
  });

  afterAll(async () => {
    await mongo.db(SOURCE_DB).dropDatabase();
    await mongo.close();
    await app.close();
    await rm(dir, { recursive: true, force: true });
    delete process.env.STORAGE_DRIVER;
    delete process.env.LOCAL_STORAGE_DIR;
  });

  it('exports to disk and serves the file through a signed link', async () => {
    const created = await http()
      .post('/job')
      .set(auth(tokenA))
      .send({ name: 'Adults', export_format: 'csv', query: [{ uri: sourceUri, collection: 'people', field: 'age', operator: 'gte', value: 10 }], fields: ['name', 'age'], sort: { age: 'asc' } })
      .expect(201);
    jobId = created.body.id;
    let status = '';
    for (let attempt = 0; attempt < POLL_ATTEMPTS && status !== 'completed' && status !== 'failed'; attempt++) {
      status = (await http().get(`/job/${jobId}`).set(auth(tokenA)).expect(200)).body.status;
      if (status !== 'completed') await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
    }
    expect(status).toBe('completed');

    const link = await http().get(`/job/${jobId}/download-url`).set(auth(tokenA)).expect(200);
    expect(link.body.url).toMatch(/^\/files\//);
    const file = await http().get(link.body.url).expect(200);
    expect(file.headers['content-disposition']).toContain('attachment; filename="Adults.csv"');
    const lines = file.text.trim().split(/\r?\n/);
    expect(lines[0]).toBe('name,age');
    expect(lines).toHaveLength(11);
  });

  it('does not hand another user a link to the job', async () => {
    await http().get(`/job/${jobId}/download-url`).set(auth(tokenB)).expect(404);
    await http().get(`/job/${jobId}/download-url`).expect(401);
  });

  it('refuses forged, tampered and traversal tokens on the public files route', async () => {
    const link = (await http().get(`/job/${jobId}/download-url`).set(auth(tokenA)).expect(200)).body.url as string;
    await http().get('/files/abc.def').expect(404);
    await http().get(`${link}x`).expect(404);
    const forged = Buffer.from(JSON.stringify({ key: '../../etc/passwd', filename: 'x', exp: Date.now() + 60000 })).toString('base64url');
    await http()
      .get(`/files/${forged}.${link.split('.').pop()}`)
      .expect(404);
  });

  it('removes the file from disk when the job is deleted', async () => {
    const link = (await http().get(`/job/${jobId}/download-url`).set(auth(tokenA)).expect(200)).body.url as string;
    await http().delete(`/job/${jobId}`).set(auth(tokenA)).expect(204);
    await http().get(link).expect(404);
  });
});
