import { NotFoundException } from '@nestjs/common';
import { EncryptionService } from '@application/services/encryption.service';
import { StoredInputService } from '@application/services/stored-input.service';
import { CreateJobUseCase } from '@application/use-cases/job/create-job.use-case';
import { RerunJobUseCase } from '@application/use-cases/job/rerun-job.use-case';
import { QueryOperator } from '@domain/enums/query-operator.enum';
import { JobRepository } from '@domain/repositories/job.repository';
import { buildJob } from '../../../testing/job.factory';

describe('RerunJobUseCase', () => {
  const user = { id: 'user-1', email: 'a@test.dev' };
  const encryption = { decrypt: (value: string) => value.replace(/^enc\(|\)$/g, '') } as unknown as EncryptionService;

  it('rebuilds the stored input and sends it through the export creation path', async () => {
    const job = buildJob({
      name: 'Original',
      fields: ['name'],
      max_rows: 9,
      query: [{ uri: 'enc(mongodb://inline.example.com/db)', collection: 'people', field: 'age', operator: QueryOperator.GTE, value: 30 }],
    });
    const findOwned = jest.fn().mockResolvedValue(job);
    const execute = jest.fn().mockResolvedValue('new-job');
    const useCase = new RerunJobUseCase({ findOwned } as unknown as JobRepository, new StoredInputService(encryption), { execute } as unknown as CreateJobUseCase);
    await expect(useCase.execute(user, 'job-1')).resolves.toBe('new-job');
    expect(findOwned).toHaveBeenCalledWith('user-1', 'job-1');
    expect(execute.mock.calls[0][0]).toBe(user);
    expect(execute.mock.calls[0][1]).toMatchObject({ name: 'Original', fields: ['name'], max_rows: 9, query: [{ uri: 'mongodb://inline.example.com/db', collection: 'people' }] });
  });

  it('uses the given name instead of the original one', async () => {
    const execute = jest.fn().mockResolvedValue('new-job');
    const useCase = new RerunJobUseCase({ findOwned: jest.fn().mockResolvedValue(buildJob()) } as unknown as JobRepository, new StoredInputService(encryption), {
      execute,
    } as unknown as CreateJobUseCase);
    await useCase.execute(user, 'job-1', '  Again  ');
    expect(execute.mock.calls[0][1].name).toBe('Again');
  });

  it('answers not found for a job that is not owned and never creates anything', async () => {
    const execute = jest.fn();
    const useCase = new RerunJobUseCase({ findOwned: jest.fn().mockResolvedValue(null) } as unknown as JobRepository, new StoredInputService(encryption), { execute } as unknown as CreateJobUseCase);
    await expect(useCase.execute(user, 'job-9')).rejects.toBeInstanceOf(NotFoundException);
    expect(execute).not.toHaveBeenCalled();
  });
});
