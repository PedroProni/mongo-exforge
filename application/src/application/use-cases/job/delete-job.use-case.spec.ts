import { ConflictException, NotFoundException } from '@nestjs/common';
import { DeleteJobUseCase } from '@application/use-cases/job/delete-job.use-case';
import { ExportStatus } from '@domain/enums/export-status.enum';
import { StoragePort } from '@domain/ports/storage.port';
import { JobRepository } from '@domain/repositories/job.repository';
import { buildJob } from '../../../testing/job.factory';

describe('DeleteJobUseCase', () => {
  const user = { id: 'user-1', email: 'a@b.dev' };

  function build(job: ReturnType<typeof buildJob> | null) {
    const repository = { findOwned: jest.fn().mockResolvedValue(job), deleteOwned: jest.fn() };
    const storage = { delete: jest.fn() };
    return { repository, storage, useCase: new DeleteJobUseCase(repository as unknown as JobRepository, storage as unknown as StoragePort) };
  }

  it('deletes the file and then the record', async () => {
    const { useCase, repository, storage } = build(buildJob());
    await useCase.execute(user, 'job-1');
    expect(storage.delete).toHaveBeenCalledWith('exports/user-1/job-1.csv');
    expect(repository.deleteOwned).toHaveBeenCalledWith('user-1', 'job-1');
  });

  it('skips the storage call when there is no file', async () => {
    const { useCase, storage, repository } = build(buildJob({ file_key: '', status: ExportStatus.FAILED }));
    await useCase.execute(user, 'job-1');
    expect(storage.delete).not.toHaveBeenCalled();
    expect(repository.deleteOwned).toHaveBeenCalled();
  });

  it('hides a job that is not owned', async () => {
    const { useCase, repository } = build(null);
    await expect(useCase.execute(user, 'job-9')).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.deleteOwned).not.toHaveBeenCalled();
  });

  it.each([ExportStatus.PENDING, ExportStatus.IN_PROGRESS])('refuses to delete a %s job', async status => {
    const { useCase, storage, repository } = build(buildJob({ status }));
    await expect(useCase.execute(user, 'job-1')).rejects.toBeInstanceOf(ConflictException);
    expect(storage.delete).not.toHaveBeenCalled();
    expect(repository.deleteOwned).not.toHaveBeenCalled();
  });
});
