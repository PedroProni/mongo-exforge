import { INestApplication } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import request from 'supertest';
import { createApp } from './e2e-app';

const SOURCE_DB = 'exforge_e2e_features_source';
const POLL_ATTEMPTS = 60;
const POLL_INTERVAL_MS = 500;
const TEMPLATE_CAP = 50;
const PREVIEW_LIMIT = 30;

type JobBody = { id: string; name: string; status: string; rows_exported: number; error: string; file_size: number; query: { connection_id: string }[] };

describe('dashboard, preview, templates and re-run (e2e)', () => {
  let app: INestApplication;
  let mongo: MongoClient;
  let sourceUri: string;
  let tokenA: string;
  let tokenB: string;
  let connectionA: string;

  const http = () => request(app.getHttpServer());
  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

  async function signUp(email: string): Promise<string> {
    return (await http().post('/user').send({ name: 'Test', surname: 'User', email, password: 'a-strong-password' }).expect(201)).body.token;
  }

  async function waitForJob(token: string, id: string): Promise<JobBody> {
    for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
      const body = (await http().get(`/job/${id}`).set(auth(token)).expect(200)).body as JobBody;
      if (['completed', 'failed', 'expired'].includes(body.status)) return body;
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
    }
    throw new Error('job did not finish');
  }

  function payload(overrides: Record<string, unknown> = {}) {
    return {
      name: 'Adults',
      export_format: 'csv',
      query: [{ connection_id: connectionA, collection: 'people', field: 'age', operator: 'gte', value: 30 }],
      fields: ['name', 'age'],
      sort: { age: 'asc' },
      ...overrides,
    };
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
      .insertMany(Array.from({ length: 300 }, (_, index) => ({ name: `person ${index}`, age: 20 + (index % 40), blob: 'x'.repeat(1000) })));
    const suffix = Date.now();
    tokenA = await signUp(`fa${suffix}@test.dev`);
    tokenB = await signUp(`fb${suffix}@test.dev`);
    connectionA = (await http().post('/connection').set(auth(tokenA)).send({ name: 'Source A', uri: sourceUri }).expect(201)).body.id;
  });

  afterAll(async () => {
    await app.close();
    await mongo.db(SOURCE_DB).dropDatabase();
    await mongo.close();
  });

  describe('authentication', () => {
    it.each([
      ['get', '/dashboard'],
      ['post', '/preview'],
      ['get', '/template'],
      ['post', '/template'],
      ['post', '/job/00000000-0000-4000-8000-000000000000/rerun'],
      ['post', '/job/00000000-0000-4000-8000-000000000000/template'],
      ['post', '/template/00000000-0000-4000-8000-000000000000/run'],
    ] as const)('refuses %s %s without a token', async (method, path) => {
      await http()[method](path).expect(401);
    });
  });

  describe('preview', () => {
    it('returns at most 20 rows, the columns and a bounded count', async () => {
      const response = await http().post('/preview').set(auth(tokenA)).send({ query: payload().query }).expect(200);
      expect(response.body.rows).toHaveLength(20);
      expect(response.body.columns).toEqual(expect.arrayContaining(['_id', 'name', 'age']));
      expect(response.body.row_limit).toBe(20);
      expect(response.body.estimated_total).toBeGreaterThan(0);
      expect(response.body.estimated_total).toBeLessThanOrEqual(300);
    });

    it('applies the filters, the fields and the sort', async () => {
      const query = [{ connection_id: connectionA, collection: 'people', field: 'age', operator: 'gte', value: 59 }];
      const response = await http().post('/preview').set(auth(tokenA)).send({ query, fields: ['age'], sort: { age: 'desc' } }).expect(200);
      expect(response.body.estimated_total).toBe(7);
      expect(response.body.rows).toHaveLength(7);
      expect(response.body.rows.every((row: { age: number }) => row.age === 59)).toBe(true);
      expect(Object.keys(response.body.rows[0])).toEqual(['age']);
    });

    it('works with an inline uri the user could submit to an export', async () => {
      const query = [{ uri: sourceUri, collection: 'people', field: 'age', operator: 'eq', value: 20 }];
      const response = await http().post('/preview').set(auth(tokenA)).send({ query }).expect(200);
      expect(response.body.rows.length).toBeGreaterThan(0);
    });

    it('truncates long strings', async () => {
      const response = await http().post('/preview').set(auth(tokenA)).send({ query: payload().query, fields: ['blob'] }).expect(200);
      expect(response.body.rows[0].blob.length).toBeLessThan(400);
    });

    it('refuses the connection of another user', async () => {
      await http().post('/preview').set(auth(tokenB)).send({ query: payload().query }).expect(400);
    });

    it.each([
      ['an operator-looking field', { field: '$where' }],
      ['a system collection', { collection: 'system.users' }],
      ['an unknown operator', { operator: 'regex' }],
      ['a missing collection', { collection: 'does_not_exist' }],
      ['an object value', { value: { $gt: '' } }],
    ])('refuses %s', async (_label, patch) => {
      const query = [{ connection_id: connectionA, collection: 'people', field: 'age', operator: 'gte', value: 30, ...patch }];
      await http().post('/preview').set(auth(tokenA)).send({ query }).expect(400);
    });

    it('refuses extra properties and an empty query', async () => {
      await http().post('/preview').set(auth(tokenA)).send({ query: payload().query, limit: 100000 }).expect(400);
      await http().post('/preview').set(auth(tokenA)).send({ query: [] }).expect(400);
    });

    it('requires exactly one of uri and connection_id', async () => {
      const query = [{ uri: sourceUri, connection_id: connectionA, collection: 'people', field: 'age', operator: 'gte', value: 1 }];
      await http().post('/preview').set(auth(tokenA)).send({ query }).expect(400);
    });
  });

  describe('jobs: progress data, filters and re-run', () => {
    let jobId: string;

    it('stores the connection reference and the file size of a finished job', async () => {
      const created = await http().post('/job').set(auth(tokenA)).send(payload({ name: 'Adults (filters)' })).expect(201);
      jobId = created.body.id;
      expect(created.body.query[0].connection_id).toBe(connectionA);
      const done = await waitForJob(tokenA, jobId);
      expect(done.status).toBe('completed');
      expect(done.file_size).toBeGreaterThan(0);
    });

    it('filters by status and searches by name, escaping regex characters', async () => {
      const done = await http().get('/job').query({ status: 'completed' }).set(auth(tokenA)).expect(200);
      expect(done.body.items.length).toBeGreaterThan(0);
      expect(done.body.items.every((item: JobBody) => item.status === 'completed')).toBe(true);
      const failed = await http().get('/job').query({ status: 'failed' }).set(auth(tokenA)).expect(200);
      expect(failed.body.total).toBe(0);
      const byName = await http().get('/job').query({ q: 'adults (FILTERS)' }).set(auth(tokenA)).expect(200);
      expect(byName.body.total).toBe(1);
      const wildcard = await http().get('/job').query({ q: '.*' }).set(auth(tokenA)).expect(200);
      expect(wildcard.body.total).toBe(0);
    });

    it('rejects an invalid status and a huge search', async () => {
      await http().get('/job').query({ status: 'nope' }).set(auth(tokenA)).expect(400);
      await http().get('/job').query({ q: 'a'.repeat(200) }).set(auth(tokenA)).expect(400);
    });

    it('does not leak jobs across users through filters', async () => {
      const response = await http().get('/job').query({ q: 'Adults' }).set(auth(tokenB)).expect(200);
      expect(response.body.total).toBe(0);
    });

    it('runs an export again with a new id and the same input', async () => {
      const response = await http().post(`/job/${jobId}/rerun`).set(auth(tokenA)).send({}).expect(201);
      expect(response.body.id).not.toBe(jobId);
      expect(response.body.name).toBe('Adults (filters)');
      const done = await waitForJob(tokenA, response.body.id);
      expect(done.status).toBe('completed');
      expect(done.rows_exported).toBeGreaterThan(0);
    });

    it('accepts a new name when re-running', async () => {
      const response = await http().post(`/job/${jobId}/rerun`).set(auth(tokenA)).send({ name: 'Again' }).expect(201);
      expect(response.body.name).toBe('Again');
    });

    it('answers 404 when another user re-runs or saves the job', async () => {
      await http().post(`/job/${jobId}/rerun`).set(auth(tokenB)).send({}).expect(404);
      await http().post(`/job/${jobId}/template`).set(auth(tokenB)).send({ name: 'stolen' }).expect(404);
    });

    it('re-validates the stored connection at run time', async () => {
      const temporary = (await http().post('/connection').set(auth(tokenA)).send({ name: 'Temporary', uri: sourceUri }).expect(201)).body.id;
      const created = await http().post('/job').set(auth(tokenA)).send(payload({ name: 'Temp job', query: [{ connection_id: temporary, collection: 'people', field: 'age', operator: 'gte', value: 1 }] })).expect(201);
      await waitForJob(tokenA, created.body.id);
      await http().delete(`/connection/${temporary}`).set(auth(tokenA)).expect(204);
      await http().post(`/job/${created.body.id}/rerun`).set(auth(tokenA)).send({}).expect(400);
    });

    it('refuses a rerun body with extra properties', async () => {
      await http().post(`/job/${jobId}/rerun`).set(auth(tokenA)).send({ uri: 'mongodb://evil.example.com/db' }).expect(400);
    });
  });

  describe('templates', () => {
    let templateId: string;

    it('creates, lists and never exposes a uri', async () => {
      const created = await http().post('/template').set(auth(tokenA)).send(payload({ name: 'Weekly adults' })).expect(201);
      templateId = created.body.id;
      expect(created.body.query[0].connection_id).toBe(connectionA);
      expect(JSON.stringify(created.body)).not.toContain('mongodb://');
      const list = await http().get('/template').set(auth(tokenA)).expect(200);
      expect(list.body.map((item: { id: string }) => item.id)).toContain(templateId);
      expect(JSON.stringify(list.body)).not.toContain('mongodb://');
    });

    it('stores an inline uri encrypted and never returns it', async () => {
      const created = await http()
        .post('/template')
        .set(auth(tokenA))
        .send(payload({ name: 'Inline source', query: [{ uri: sourceUri, collection: 'people', field: 'age', operator: 'eq', value: 20 }] }))
        .expect(201);
      expect(JSON.stringify(created.body)).not.toContain(SOURCE_DB);
      const stored = await mongo.db(new URL(process.env.MONGODB_URI as string).pathname.slice(1)).collection('template').findOne({ _id: created.body.id } as never);
      expect(JSON.stringify(stored)).not.toContain(SOURCE_DB);
      const run = await http().post(`/template/${created.body.id}/run`).set(auth(tokenA)).send({}).expect(201);
      expect((await waitForJob(tokenA, run.body.id)).status).toBe('completed');
    });

    it('does not list templates of another user', async () => {
      const list = await http().get('/template').set(auth(tokenB)).expect(200);
      expect(list.body).toEqual([]);
    });

    it('answers 404 when another user renames, deletes or runs it', async () => {
      await http().patch(`/template/${templateId}`).set(auth(tokenB)).send({ name: 'mine now' }).expect(404);
      await http().delete(`/template/${templateId}`).set(auth(tokenB)).expect(404);
      await http().post(`/template/${templateId}/run`).set(auth(tokenB)).send({}).expect(404);
      const still = await http().get('/template').set(auth(tokenA)).expect(200);
      expect(still.body.find((item: { id: string }) => item.id === templateId).name).toBe('Weekly adults');
    });

    it('refuses to save a template that uses the connection of another user', async () => {
      await http().post('/template').set(auth(tokenB)).send(payload({ name: 'borrowed' })).expect(400);
    });

    it('refuses a duplicate name with 409', async () => {
      await http().post('/template').set(auth(tokenA)).send(payload({ name: 'Weekly adults' })).expect(409);
    });

    it('renames, refusing a name already taken', async () => {
      const other = (await http().post('/template').set(auth(tokenA)).send(payload({ name: 'Second' })).expect(201)).body.id;
      await http().patch(`/template/${other}`).set(auth(tokenA)).send({ name: 'Weekly adults' }).expect(409);
      const renamed = await http().patch(`/template/${other}`).set(auth(tokenA)).send({ name: 'Second renamed' }).expect(200);
      expect(renamed.body.name).toBe('Second renamed');
    });

    it('starts an export from a template and keeps the saved setup', async () => {
      const run = await http().post(`/template/${templateId}/run`).set(auth(tokenA)).send({ name: 'From template' }).expect(201);
      expect(run.body.name).toBe('From template');
      const done = await waitForJob(tokenA, run.body.id);
      expect(done.status).toBe('completed');
      expect(done.rows_exported).toBe(220);
    });

    it('saves a past export as a template', async () => {
      const jobs = await http().get('/job').query({ q: 'From template' }).set(auth(tokenA)).expect(200);
      const created = await http().post(`/job/${jobs.body.items[0].id}/template`).set(auth(tokenA)).send({ name: 'Saved from job' }).expect(201);
      expect(created.body.query[0].connection_id).toBe(connectionA);
    });

    it('re-validates the connection when a template runs after the connection is gone', async () => {
      const temporary = (await http().post('/connection').set(auth(tokenA)).send({ name: 'Gone soon', uri: sourceUri }).expect(201)).body.id;
      const created = await http()
        .post('/template')
        .set(auth(tokenA))
        .send(payload({ name: 'Orphan', query: [{ connection_id: temporary, collection: 'people', field: 'age', operator: 'gte', value: 1 }] }))
        .expect(201);
      await http().delete(`/connection/${temporary}`).set(auth(tokenA)).expect(204);
      await http().post(`/template/${created.body.id}/run`).set(auth(tokenA)).send({}).expect(400);
    });

    it('deletes a template', async () => {
      await http().delete(`/template/${templateId}`).set(auth(tokenA)).expect(204);
      await http().post(`/template/${templateId}/run`).set(auth(tokenA)).send({}).expect(404);
    });

    it('caps the number of templates per user', async () => {
      const current = (await http().get('/template').set(auth(tokenA)).expect(200)).body.length;
      for (let index = current; index < TEMPLATE_CAP; index++) await http().post('/template').set(auth(tokenA)).send(payload({ name: `Filler ${index}` })).expect(201);
      await http().post('/template').set(auth(tokenA)).send(payload({ name: 'One too many' })).expect(409);
      await http().post('/template').set(auth(tokenB)).send(payload({ name: 'B is not affected', query: [{ uri: sourceUri, collection: 'people', field: 'age', operator: 'eq', value: 20 }] })).expect(201);
    });
  });

  describe('dashboard', () => {
    it('summarises only the jobs of the requesting user', async () => {
      const a = (await http().get('/dashboard').set(auth(tokenA)).expect(200)).body;
      expect(a.totals.exports).toBeGreaterThanOrEqual(4);
      expect(a.totals.completed).toBeGreaterThan(0);
      expect(a.totals.rows_exported).toBeGreaterThan(0);
      expect(a.totals.success_rate).toBeGreaterThan(0);
      expect(a.by_format.csv).toBe(a.totals.exports);
      expect(a.series).toHaveLength(30);
      expect(a.series.reduce((sum: number, item: { count: number }) => sum + item.count, 0)).toBe(a.totals.exports);
      expect(a.recent.length).toBeLessThanOrEqual(6);
      expect(JSON.stringify(a)).not.toContain('mongodb://');
      const b = (await http().get('/dashboard').set(auth(tokenB)).expect(200)).body;
      expect(b.totals).toEqual({ exports: 0, completed: 0, failed: 0, active: 0, rows_exported: 0, success_rate: null });
      expect(b.recent).toEqual([]);
      expect(b.by_format).toEqual({ csv: 0, json: 0, xlsx: 0 });
    });
  });

  describe('preview rate limit', () => {
    it('answers 429 after the per-minute budget without touching job creation', async () => {
      const send = () => http().post('/preview').set(auth(tokenA)).send({ query: payload().query, fields: ['age'] });
      const statuses: number[] = [];
      for (let index = 0; index < PREVIEW_LIMIT + 3; index++) statuses.push((await send()).status);
      expect(statuses.filter(status => status === 429).length).toBeGreaterThanOrEqual(1);
      await http().post('/job').set(auth(tokenA)).send(payload({ name: 'still allowed' })).expect(201);
    });
  });
});
