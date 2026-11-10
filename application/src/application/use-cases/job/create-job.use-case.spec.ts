import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { CreateJobUseCase } from '@application/use-cases/job/create-job.use-case';
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
  };

  function build(overrides: { assertAllowed?: jest.Mock; enqueue?: jest.Mock } = {}) {
    const create = jest.fn().mockImplementation(async job => job);
    const markFailed = jest.fn().mockResolvedValue(undefined);
    const assertAllowed = overrides.assertAllowed ?? jest.fn().mockResolvedValue(undefined);
    const enqueue = overrides.enqueue ?? jest.fn().mockResolvedValue(undefined);
    const encryption = { encrypt: (value: string) => `enc(${value})` } as unknown as EncryptionService;
    const useCase = new CreateJobUseCase({ create, markFailed } as unknown as JobRepository, { assertAllowed } as unknown as MongoRepository, { enqueue }, encryption);
    return { useCase, create, markFailed, assertAllowed, enqueue };
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
});
