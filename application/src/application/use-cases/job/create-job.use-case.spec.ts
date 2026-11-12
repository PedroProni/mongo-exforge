import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { CreateJobUseCase } from '@application/use-cases/job/create-job.use-case';
import { EnvConfigService } from '@common/env/services/env-config.service';
import { ConnectionRepository } from '@domain/repositories/connection.repository';
import { JobInputResolverService } from '@application/services/job-input-resolver.service';
import { EncryptionService } from '@application/services/encryption.service';
import { ExportFormat } from '@domain/enums/export-format.enum';
import { QueryOperator } from '@domain/enums/query-operator.enum';
import { JobRepository } from '@domain/repositories/job.repository';
import { MongoRepository } from '@domain/repositories/mongo.repository';
import { CreateJobInput } from '@domain/types/create-job-input.type';

describe('CreateJobUseCase', () => {
  const user = { id: 'user-1', email: 'a@test.dev' };
  const input: CreateJobInput = {
    name: '  Report  ',
    export_format: ExportFormat.CSV,
    query: [{ uri: 'mongodb://db.example.com/app', collection: 'people', field: 'age', operator: QueryOperator.GTE, value: 30 }],
    fields: ['name'],
    sort: { age: 1 },
    max_rows: 0,
  };

  function build(overrides: { assertAllowed?: jest.Mock; enqueue?: jest.Mock; connection_uri?: string | null } = {}) {
    const create = jest.fn().mockImplementation(async job => job);
    const markFailed = jest.fn().mockResolvedValue(undefined);
    const assertAllowed = overrides.assertAllowed ?? jest.fn().mockResolvedValue(undefined);
    const enqueue = overrides.enqueue ?? jest.fn().mockResolvedValue(undefined);
    const encryption = { encrypt: (value: string) => `enc(${value})`, decrypt: (value: string) => value.replace(/^enc\(|\)$/g, '') } as unknown as EncryptionService;
    const findOwned = jest.fn().mockResolvedValue(overrides.connection_uri ? { getUri: () => overrides.connection_uri } : null);
    const resolver = new JobInputResolverService(
      { assertAllowed } as unknown as MongoRepository,
      { findOwned } as unknown as ConnectionRepository,
      encryption,
      { getExportMaxRows: () => 1000 } as unknown as EnvConfigService,
    );
    const useCase = new CreateJobUseCase({ create, markFailed } as unknown as JobRepository, { enqueue }, resolver);
    return { useCase, create, markFailed, assertAllowed, enqueue, findOwned };
  }

  it('stores the uri encrypted and enqueues only the job id', async () => {
    const { useCase, create, enqueue } = build();
    const job = await useCase.execute(user, input);
    expect(create.mock.calls[0][0].getQuery()[0].uri).toBe('enc(mongodb://db.example.com/app)');
    expect(job.getName()).toBe('Report');
    expect(job.getUserId()).toBe('user-1');
    expect(enqueue).toHaveBeenCalledWith(job.getId());
  });

  it('validates each distinct uri once', async () => {
    const { useCase, assertAllowed } = build();
    await useCase.execute(user, { ...input, query: [input.query[0], { ...input.query[0], field: 'name', operator: QueryOperator.EQ, value: 'x' }] });
    expect(assertAllowed).toHaveBeenCalledTimes(1);
  });

  it('answers 400 and creates nothing when a uri is refused', async () => {
    const { useCase, create, enqueue } = build({ assertAllowed: jest.fn().mockRejectedValue(new Error('Address not allowed')) });
    await expect(useCase.execute(user, input)).rejects.toBeInstanceOf(BadRequestException);
    expect(create).not.toHaveBeenCalled();
    expect(enqueue).not.toHaveBeenCalled();
  });

  it('marks the job failed and answers 503 when the queue is down', async () => {
    const { useCase, markFailed } = build({ enqueue: jest.fn().mockRejectedValue(new Error('redis down')) });
    await expect(useCase.execute(user, input)).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(markFailed).toHaveBeenCalledWith(expect.any(String), 'Could not enqueue the export');
  });

  it('resolves a saved connection of the user and reuses its stored ciphertext', async () => {
    const { useCase, create, findOwned, assertAllowed } = build({ connection_uri: 'enc(mongodb://saved.example.com/app)' });
    await useCase.execute(user, { ...input, query: [{ connection_id: 'conn-1', collection: 'people', field: 'age', operator: QueryOperator.GTE, value: 1 }] });
    expect(findOwned).toHaveBeenCalledWith('user-1', 'conn-1');
    expect(create.mock.calls[0][0].getQuery()[0].uri).toBe('enc(mongodb://saved.example.com/app)');
    expect(assertAllowed).toHaveBeenCalledWith('mongodb://saved.example.com/app');
  });

  it('refuses a connection that is not found for this user', async () => {
    const { useCase, create } = build({ connection_uri: null });
    await expect(useCase.execute(user, { ...input, query: [{ connection_id: 'someone-elses', collection: 'people', field: 'a', operator: QueryOperator.EQ, value: 1 }] })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(create).not.toHaveBeenCalled();
  });

  it.each([{ uri: 'mongodb://x/db', connection_id: 'c' }, {}])('requires exactly one of uri and connection_id: %j', async source => {
    const { useCase } = build({ connection_uri: 'enc(mongodb://x/db)' });
    await expect(useCase.execute(user, { ...input, query: [{ ...source, collection: 'people', field: 'a', operator: QueryOperator.EQ, value: 1 }] })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('refuses a max_rows above the server cap', async () => {
    const { useCase, create } = build();
    await expect(useCase.execute(user, { ...input, max_rows: 1001 })).rejects.toBeInstanceOf(BadRequestException);
    expect(create).not.toHaveBeenCalled();
  });
});
