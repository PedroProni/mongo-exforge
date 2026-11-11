import { ConflictException, GoneException, NotFoundException } from '@nestjs/common';
import { DownloadJobUseCase } from '@application/use-cases/job/download-job.use-case';
import { ExportStatus } from '@domain/enums/export-status.enum';
import { JobRepository } from '@domain/repositories/job.repository';
import { StoragePort } from '@domain/ports/storage.port';
import { buildJob } from '../../../testing/job.factory';
import { InMemoryStorage } from '../../../testing/in-memory-storage';

describe('DownloadJobUseCase', () => {
  const user = { id: 'user-1', email: 'a@test.dev' };

  function build(job: ReturnType<typeof buildJob> | null) {
    const findOwned = jest.fn().mockResolvedValue(job);
    const useCase = new DownloadJobUseCase({ findOwned } as unknown as JobRepository, new InMemoryStorage() as unknown as StoragePort);
    return { useCase, findOwned };
  }

  it('looks the job up by owner and id', async () => {
    const { useCase, findOwned } = build(buildJob());
    await useCase.execute(user, 'job-1');
    expect(findOwned).toHaveBeenCalledWith('user-1', 'job-1');
  });

  it('returns a short lived link with a sanitized filename', async () => {
    const { useCase } = build(buildJob({ name: '../../etc/passwd report' }));
    const url = await useCase.execute(user, 'job-1');
    expect(url).toContain('exports/user-1/job-1.csv');
    expect(url).toContain('filename=etc_passwd_report.csv');
    expect(url).toContain('ttl=300');
  });

  it('falls back to a default name when nothing usable is left', async () => {
    const { useCase } = build(buildJob({ name: '***' }));
    expect(await useCase.execute(user, 'job-1')).toMatch(/filename=[A-Za-z0-9_-]+\.csv/);
  });

  it('answers not found when the job belongs to someone else', async () => {
    const { useCase } = build(null);
    await expect(useCase.execute({ id: 'intruder', email: 'b@test.dev' }, 'job-1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it.each([ExportStatus.PENDING, ExportStatus.IN_PROGRESS, ExportStatus.FAILED])('refuses a %s job', async status => {
    const { useCase } = build(buildJob({ status }));
    await expect(useCase.execute(user, 'job-1')).rejects.toBeInstanceOf(ConflictException);
  });

  it('answers gone for an expired job', async () => {
    const { useCase } = build(buildJob({ status: ExportStatus.EXPIRED }));
    await expect(useCase.execute(user, 'job-1')).rejects.toBeInstanceOf(GoneException);
  });

  it('answers not found for a completed job with no file', async () => {
    const { useCase } = build(buildJob({ file_key: '' }));
    await expect(useCase.execute(user, 'job-1')).rejects.toBeInstanceOf(NotFoundException);
  });
});
