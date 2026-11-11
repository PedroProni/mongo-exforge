import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EnvConfigService } from '@common/env/services/env-config.service';
import { EXPORT_BACKOFF_DELAY_MS, EXPORT_JOB_NAME, EXPORT_KEEP_COMPLETED, EXPORT_KEEP_FAILED, EXPORT_QUEUE_NAME } from '@domain/constants/queue.constant';
import { JobQueuePort } from '@domain/ports/job-queue.port';

@Injectable()
export class BullJobQueueAdapter implements JobQueuePort {
  constructor(
    @InjectQueue(EXPORT_QUEUE_NAME) private readonly queue: Queue,
    private readonly envConfigService: EnvConfigService,
  ) {}

  async enqueue(job_id: string): Promise<void> {
    await this.queue.add(
      EXPORT_JOB_NAME,
      { job_id },
      {
        jobId: job_id,
        attempts: this.envConfigService.getExportAttempts(),
        backoff: { type: 'exponential', delay: EXPORT_BACKOFF_DELAY_MS },
        removeOnComplete: EXPORT_KEEP_COMPLETED,
        removeOnFail: EXPORT_KEEP_FAILED,
      },
    );
  }
}
