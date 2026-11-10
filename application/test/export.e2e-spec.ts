import { INestApplication } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import ExcelJS from 'exceljs';
import request from 'supertest';
import { CleanupExpiredExportsUseCase } from '@application/use-cases/job/cleanup-expired-exports.use-case';
import { createApp } from './e2e-app';

const SOURCE_DB = 'exforge_e2e_source';
const POLL_ATTEMPTS = 60;
const POLL_INTERVAL_MS = 500;

type JobBody = { id: string; status: string; rows_exported: number; error: string; file_available: boolean };

describe('exports (e2e)', () => {
  let app: INestApplication;
  let mongo: MongoClient;
  let sourceUri: string;
  let tokenA: string;
  let tokenB: string;

  const http = () => request(app.getHttpServer());
  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

  async function signUp(email: string): Promise<string> {
    const response = await http().post('/user').send({ name: 'Test', surname: 'User', email, password: 'a-strong-password' }).expect(201);
    return response.body.token;
  }

  async function waitForJob(token: string, id: string): Promise<JobBody> {
    for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
      const body = (await http().get(`/job/${id}`).set(auth(token)).expect(200)).body as JobBody;
      if (['completed', 'failed', 'expired'].includes(body.status)) return body;
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
    }
    throw new Error('job did not finish');
  }

  function jobPayload(overrides: Record<string, unknown> = {}) {
    return {
      name: 'Adults',
      export_format: 'csv',
      query: [{ uri: sourceUri, collection: 'people', field: 'age', operator: 'gte', value: 30 }],
      fields: ['name', 'age', 'address.city'],
      sort: { age: 'asc' },
      ...overrides,
    };
  }

  async function download(token: string, id: string): Promise<Buffer> {
    const redirect = await http().get(`/job/${id}/download`).set(auth(token)).redirects(0).expect(302);
    const response = await fetch(redirect.headers.location);
    expect(response.status).toBe(200);
    return Buffer.from(await response.arrayBuffer());
  }

  beforeAll(async () => {
    app = await createApp();
    const base = process.env.MONGODB_URI as string;
    sourceUri = base.replace(/\/[^/?]*(\?|$)/, `/${SOURCE_DB}$1`);
    mongo = await MongoClient.connect(base);
    await mongo.db(SOURCE_DB).dropDatabase();
    await mongo
      .db(SOURCE_DB)
      .collection('people')
      .insertMany(
        Array.from({ length: 300 }, (_, index) => ({ name: index === 0 ? '=cmd|calc' : `person ${index}`, age: 20 + (index % 40), address: { city: index % 2 ? 'Rio' : 'Lima' }, note: 'a,"b"' })),
      );
    await mongo.db(SOURCE_DB).collection('empty_one').insertOne({ tmp: 1 });
    await mongo.db(SOURCE_DB).collection('empty_one').deleteMany({});
    const suffix = Date.now();
    tokenA = await signUp(`a${suffix}@test.dev`);
    tokenB = await signUp(`b${suffix}@test.dev`);
  });

  afterAll(async () => {
    await mongo.db(SOURCE_DB).dropDatabase();
    await mongo.close();
    await app.close();
  });

  describe('authentication', () => {
    it('refuses requests without a token', async () => {
      await http().get('/job').expect(401);
      await http().post('/job').send(jobPayload()).expect(401);
      await http()
        .post('/mongo/inspect')
        .send({ uris: [sourceUri] })
        .expect(401);
      await http().get('/user/me').expect(401);
    });

    it('refuses a forged token', async () => {
      await http().get('/job').set(auth('not.a.token')).expect(401);
    });

    it('does not list users', async () => {
      await http().get('/user').set(auth(tokenA)).expect(404);
    });

    it('answers the same error for an unknown email and a wrong password', async () => {
      const email = `login${Date.now()}@test.dev`;
      await signUp(email);
      const unknown = await http().post('/user/login').send({ email: 'nobody@test.dev', password: 'a-strong-password' }).expect(401);
      const wrong = await http().post('/user/login').send({ email, password: 'another-password' }).expect(401);
      expect(wrong.body.message).toBe(unknown.body.message);
    });

    it('rejects a duplicate email with 409', async () => {
      const email = `dup${Date.now()}@test.dev`;
      await signUp(email);
      await http().post('/user').send({ name: 'T', surname: 'U', email, password: 'a-strong-password' }).expect(409);
    });

    it('never returns the password hash', async () => {
      const response = await http().get('/user/me').set(auth(tokenA)).expect(200);
      expect(JSON.stringify(response.body)).not.toMatch(/password|\$2[aby]\$/);
    });

    it('stops accepting the token after the account is deleted', async () => {
      const token = await signUp(`gone${Date.now()}@test.dev`);
      await http().delete('/user/me').set(auth(token)).expect(204);
      await http().get('/job').set(auth(token)).expect(401);
    });
  });

  describe('inspect', () => {
    it('lists collections and sampled fields', async () => {
      const response = await http()
        .post('/mongo/inspect')
        .set(auth(tokenA))
        .send({ uris: [sourceUri] })
        .expect(200);
      const people = JSON.stringify(response.body);
      expect(people).toContain('people');
      expect(people).toContain('address');
    });
  });

  describe('csv export', () => {
    let job: JobBody;

    beforeAll(async () => {
      const created = await http().post('/job').set(auth(tokenA)).send(jobPayload()).expect(201);
      expect(created.body.status).toBe('pending');
      job = await waitForJob(tokenA, created.body.id);
    });

    it('completes with the filtered row count', async () => {
      const expected = await mongo
        .db(SOURCE_DB)
        .collection('people')
        .countDocuments({ age: { $gte: 30 } });
      expect(job.status).toBe('completed');
      expect(job.rows_exported).toBe(expected);
      expect(job.file_available).toBe(true);
    });

    it('does not expose the source uri', async () => {
      const response = await http().get(`/job/${job.id}`).set(auth(tokenA)).expect(200);
      expect(JSON.stringify(response.body)).not.toContain(sourceUri);
    });

    it('downloads a sorted csv with only the selected fields', async () => {
      const lines = (await download(tokenA, job.id)).toString('utf8').trim().split(/\r?\n/);
      expect(lines[0]).toBe('name,age,address.city');
      expect(lines).toHaveLength(job.rows_exported + 1);
      const ages = lines.slice(1).map(line => Number(line.split(',').slice(-2, -1)[0]));
      expect([...ages].sort((a, b) => a - b)).toEqual(ages);
    });

    it('lists the job for its owner', async () => {
      const response = await http().get('/job?page=1&limit=5').set(auth(tokenA)).expect(200);
      expect(response.body.items.map((item: JobBody) => item.id)).toContain(job.id);
    });
  });

  describe('csv formula injection', () => {
    it('neutralizes a cell that starts with an equals sign', async () => {
      const created = await http()
        .post('/job')
        .set(auth(tokenA))
        .send(jobPayload({ name: 'Formula', query: [{ uri: sourceUri, collection: 'people', field: 'age', operator: 'eq', value: 20 }], sort: undefined }))
        .expect(201);
      const done = await waitForJob(tokenA, created.body.id);
      expect(done.status).toBe('completed');
      const text = (await download(tokenA, created.body.id)).toString('utf8');
      expect(text).toContain("'=cmd|calc");
      expect(text).not.toMatch(/(^|,|\n)=cmd/);
    });
  });

  describe('json and xlsx exports', () => {
    it('produces valid json', async () => {
      const created = await http()
        .post('/job')
        .set(auth(tokenA))
        .send(jobPayload({ export_format: 'json' }))
        .expect(201);
      const done = await waitForJob(tokenA, created.body.id);
      expect(done.status).toBe('completed');
      const parsed = JSON.parse((await download(tokenA, created.body.id)).toString('utf8'));
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(done.rows_exported);
      expect(Object.keys(parsed[0])).toEqual(expect.arrayContaining(['name', 'age']));
    });

    it('produces a readable workbook', async () => {
      const created = await http()
        .post('/job')
        .set(auth(tokenA))
        .send(jobPayload({ export_format: 'xlsx' }))
        .expect(201);
      const done = await waitForJob(tokenA, created.body.id);
      expect(done.status).toBe('completed');
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load((await download(tokenA, created.body.id)) as never);
      expect(workbook.worksheets[0].rowCount).toBe(done.rows_exported + 1);
    });
  });

  describe('empty result', () => {
    it('completes with zero rows and offers no file', async () => {
      const created = await http()
        .post('/job')
        .set(auth(tokenA))
        .send(jobPayload({ name: 'Nobody', query: [{ uri: sourceUri, collection: 'people', field: 'age', operator: 'gt', value: 1000 }] }))
        .expect(201);
      const done = await waitForJob(tokenA, created.body.id);
      expect(done.status).toBe('completed');
      expect(done.rows_exported).toBe(0);
      expect(done.file_available).toBe(false);
      await http().get(`/job/${created.body.id}/download`).set(auth(tokenA)).expect(404);
    });
  });

  describe('failure states', () => {
    it('marks the job failed when the collection does not exist', async () => {
      const created = await http()
        .post('/job')
        .set(auth(tokenA))
        .send(jobPayload({ name: 'Missing', query: [{ uri: sourceUri, collection: 'does_not_exist', field: 'a', operator: 'eq', value: 1 }] }));
      if (created.status === 201) {
        const done = await waitForJob(tokenA, created.body.id);
        expect(done.status).toBe('failed');
        expect(done.error).not.toBe('');
      } else {
        expect(created.status).toBe(400);
      }
    });

    it('refuses to download a job that is not completed', async () => {
      const created = await http()
        .post('/job')
        .set(auth(tokenA))
        .send(jobPayload({ name: 'Missing2', query: [{ uri: sourceUri, collection: 'does_not_exist', field: 'a', operator: 'eq', value: 1 }] }));
      if (created.status !== 201) return;
      const done = await waitForJob(tokenA, created.body.id);
      expect(done.status).toBe('failed');
      await http().get(`/job/${created.body.id}/download`).set(auth(tokenA)).expect(409);
    });
  });

  describe('isolation between users', () => {
    let jobId: string;

    beforeAll(async () => {
      const created = await http()
        .post('/job')
        .set(auth(tokenA))
        .send(jobPayload({ name: 'Private' }))
        .expect(201);
      jobId = created.body.id;
      await waitForJob(tokenA, jobId);
    });

    it('hides the job from another user', async () => {
      await http().get(`/job/${jobId}`).set(auth(tokenB)).expect(404);
    });

    it('refuses the download to another user', async () => {
      await http().get(`/job/${jobId}/download`).set(auth(tokenB)).redirects(0).expect(404);
    });

    it('does not list it for another user', async () => {
      const response = await http().get('/job').set(auth(tokenB)).expect(200);
      expect(response.body.items.map((item: JobBody) => item.id)).not.toContain(jobId);
    });

    it('answers 400 for a malformed id', async () => {
      await http().get('/job/not-an-id').set(auth(tokenA)).expect(400);
    });
  });

  describe('query injection', () => {
    const post = (query: unknown[], extra: Record<string, unknown> = {}) =>
      http()
        .post('/job')
        .set(auth(tokenA))
        .send(jobPayload({ query, ...extra }));
    const item = (overrides: Record<string, unknown>) => ({ uri: '', collection: 'people', field: 'age', operator: 'eq', value: 1, ...overrides });
    const withUri = (overrides: Record<string, unknown>) => item({ uri: sourceUri, ...overrides });

    it('rejects an operator object as a value', async () => {
      await post([withUri({ value: { $gt: '' } })]).expect(400);
    });

    it('rejects a $where field', async () => {
      await post([withUri({ field: '$where', value: 'sleep(1000)' })]).expect(400);
    });

    it('rejects an unknown operator', async () => {
      await post([withUri({ operator: 'regex' })]).expect(400);
      await post([withUri({ operator: '$where' })]).expect(400);
    });

    it('rejects an array that contains an object', async () => {
      await post([withUri({ operator: 'in', value: [{ $ne: null }] })]).expect(400);
    });

    it.each(['$out', 'a$b', 'system.users', 'a b', '', '../x', 'a'.repeat(200)])('rejects the collection name %j', async collection => {
      await post([withUri({ collection })]).expect(400);
    });

    it.each(['__proto__', 'a.__proto__.b', '$expr', 'a..b', 'a.$b'])('rejects the field %j', async field => {
      await post([withUri({ field })]).expect(400);
    });

    it('rejects unknown properties', async () => {
      await post([withUri({})], { admin: true }).expect(400);
      await post([withUri({ pipeline: [] })]).expect(400);
    });

    it('rejects a sort map with a bad direction or key', async () => {
      await post([withUri({})], { sort: { age: 'sideways' } }).expect(400);
      await post([withUri({})], { sort: { $natural: 'asc' } }).expect(400);
    });

    it('rejects a missing source collection of the system namespace on inspect', async () => {
      const response = await http()
        .post('/mongo/inspect')
        .set(auth(tokenA))
        .send({ uris: [sourceUri] })
        .expect(200);
      expect(JSON.stringify(response.body)).not.toContain('system.');
    });
  });

  describe('validation limits', () => {
    it('rejects an oversized page limit', async () => {
      await http().get('/job?limit=100000').set(auth(tokenA)).expect(400);
    });

    it('rejects a negative page', async () => {
      await http().get('/job?page=-1').set(auth(tokenA)).expect(400);
    });

    it('rejects a short password', async () => {
      await http()
        .post('/user')
        .send({ name: 'T', surname: 'U', email: `s${Date.now()}@test.dev`, password: 'short' })
        .expect(400);
    });
  });

  describe('expiry sweep', () => {
    it('deletes the object, marks the job expired and answers 410 on download', async () => {
      const created = await http()
        .post('/job')
        .set(auth(tokenA))
        .send(jobPayload({ name: 'Old' }))
        .expect(201);
      const done = await waitForJob(tokenA, created.body.id);
      expect(done.status).toBe('completed');
      const redirect = await http().get(`/job/${created.body.id}/download`).set(auth(tokenA)).redirects(0).expect(302);
      expect((await fetch(redirect.headers.location)).status).toBe(200);

      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      await mongo
        .db(new URL(process.env.MONGODB_URI as string).pathname.slice(1))
        .collection('job')
        .updateOne({ _id: created.body.id as never }, { $set: { finished_at: threeDaysAgo } });
      expect(await app.get(CleanupExpiredExportsUseCase).execute()).toBeGreaterThanOrEqual(1);

      expect((await fetch(redirect.headers.location)).status).toBe(404);
      const after = (await http().get(`/job/${created.body.id}`).set(auth(tokenA)).expect(200)).body as JobBody;
      expect(after.status).toBe('expired');
      expect(after.file_available).toBe(false);
      await http().get(`/job/${created.body.id}/download`).set(auth(tokenA)).expect(410);
    });
  });

  describe('health', () => {
    it('is public and reports the dependencies', async () => {
      const response = await http().get('/health').expect(200);
      expect(JSON.stringify(response.body)).toMatch(/mongo/i);
    });
  });
});
