import { Inject, Injectable, Logger } from '@nestjs/common';
import { EnvConfigService } from '@common/env/services/env-config.service';
import { EXPIRED_SWEEP_BATCH, MILLISECONDS_PER_HOUR } from '@domain/constants/pagination.constant';
import { StoragePort } from '@domain/ports/storage.port';
import { JobRepository } from '@domain/repositories/job.repository';
import { JOB_INJECT_TOKEN, STORAGE_INJECT_TOKEN } from '@domain/constants/inject.constant';

@Injectable()
export class CleanupExpiredExportsUseCase {
  private readonly logger = new Logger(CleanupExpiredExportsUseCase.name);

  constructor(
    @Inject(JOB_INJECT_TOKEN) private readonly jobRepository: JobRepository,
    @Inject(STORAGE_INJECT_TOKEN) private readonly storage: StoragePort,
    private readonly envConfigService: EnvConfigService,
  ) {}

  async execute(now: Date = new Date()): Promise<number> {
    const threshold = new Date(now.getTime() - this.envConfigService.getExportTtlHours() * MILLISECONDS_PER_HOUR);
    let removed = 0;

    for (;;) {
      const jobs = await this.jobRepository.findExpired(threshold, EXPIRED_SWEEP_BATCH);
      let progress = 0;
      for (const job of jobs) {
        try {
          await this.storage.delete(job.getFileKey());
          await this.jobRepository.markExpired(job.getId());
          progress++;
        } catch (error) {
          this.logger.error(`Could not expire export ${job.getId()}: ${(error as Error).message}`);
        }
      }
      removed += progress;
      if (jobs.length < EXPIRED_SWEEP_BATCH || progress === 0) return removed;
    }
  }
}
