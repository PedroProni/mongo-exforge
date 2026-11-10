import { Logger } from '@nestjs/common';
import { CleanupExpiredExportsUseCase } from '@application/use-cases/job/cleanup-expired-exports.use-case';
import { EnvConfigService } from '@common/env/services/env-config.service';
import { EXPIRED_SWEEP_BATCH } from '@domain/constants/pagination.constant';
import { StoragePort } from '@domain/ports/storage.port';
import { JobRepository } from '@domain/repositories/job.repository';
import { buildJob } from '../../../testing/job.factory';
import { InMemoryStorage } from '../../../testing/in-memory-storage';

describe('CleanupExpiredExportsUseCase', () => {
  beforeAll(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterAll(() => jest.restoreAllMocks());

  const now = new Date('2026-06-01T12:00:00.000Z');

  function build(batches: ReturnType<typeof buildJob>[][]) {
    const storage = new InMemoryStorage();
    const findExpired = jest.fn();
    batches.forEach(batch => findExpired.mockResolvedValueOnce(batch));
    findExpired.mockResolvedValue([]);
    const markExpired = jest.fn().mockResolvedValue(undefined);
    const useCase = new CleanupExpiredExportsUseCase(
      { findExpired, markExpired } as unknown as JobRepository,
      storage as unknown as StoragePort,
      { getExportTtlHours: () => 24 } as unknown as EnvConfigService,
    );
    return { useCase, storage, findExpired, markExpired };
  }

  it('deletes the object before marking the job expired', async () => {
    const { useCase, storage, markExpired } = build([[buildJob({ _id: 'a', file_key: 'k/a' }), buildJob({ _id: 'b', file_key: 'k/b' })]]);
    expect(await useCase.execute(now)).toBe(2);
    expect(storage.deleted).toEqual(['k/a', 'k/b']);
    expect(markExpired).toHaveBeenCalledWith('a');
    expect(markExpired).toHaveBeenCalledWith('b');
  });

  it('uses the ttl to compute the threshold', async () => {
    const { useCase, findExpired } = build([[]]);
    await useCase.execute(now);
    expect(findExpired).toHaveBeenCalledWith(new Date('2026-05-31T12:00:00.000Z'), EXPIRED_SWEEP_BATCH);
  });

  it('keeps the job when the object cannot be deleted and carries on', async () => {
    const { useCase, storage, markExpired } = build([[buildJob({ _id: 'a', file_key: 'k/a' }), buildJob({ _id: 'b', file_key: 'k/b' })]]);
    storage.failOn.add('k/a');
    expect(await useCase.execute(now)).toBe(1);
    expect(markExpired).not.toHaveBeenCalledWith('a');
    expect(markExpired).toHaveBeenCalledWith('b');
  });

  it('stops when a whole batch fails instead of looping forever', async () => {
    const full = Array.from({ length: EXPIRED_SWEEP_BATCH }, (_, index) => buildJob({ _id: `j${index}`, file_key: `k/${index}` }));
    const { useCase, storage, findExpired } = build([full]);
    full.forEach(job => storage.failOn.add(job.getFileKey()));
    expect(await useCase.execute(now)).toBe(0);
    expect(findExpired).toHaveBeenCalledTimes(1);
  });

  it('keeps sweeping while batches come back full', async () => {
    const full = (prefix: string) => Array.from({ length: EXPIRED_SWEEP_BATCH }, (_, index) => buildJob({ _id: `${prefix}${index}`, file_key: `k/${prefix}${index}` }));
    const { useCase, findExpired } = build([full('x'), full('y'), [buildJob({ _id: 'z' })]]);
    expect(await useCase.execute(now)).toBe(EXPIRED_SWEEP_BATCH * 2 + 1);
    expect(findExpired).toHaveBeenCalledTimes(3);
  });
});
