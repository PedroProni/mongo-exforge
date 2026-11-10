import { Logger, OnModuleInit } from '@nestjs/common';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, UnrecoverableError } from 'bullmq';
import { EnvConfigService } from '@common/env/services/env-config.service';
import { RunExportUseCase } from '@application/use-cases/job/run-export.use-case';
import { ExportRejectedError } from '@application/errors/export-rejected.error';
import { EXPORT_QUEUE_NAME } from '@domain/constants/queue.constant';

@Processor(EXPORT_QUEUE_NAME)
export class ExportJobProcessor extends WorkerHost implements OnModuleInit {
  private readonly logger = new Logger(ExportJobProcessor.name);

  constructor(
    private readonly runExportUseCase: RunExportUseCase,
    private readonly envConfigService: EnvConfigService,
  ) {
    super();
  }

  onModuleInit(): void {
    this.worker.concurrency = this.envConfigService.getExportConcurrency();
  }

  async process(job: Job<{ job_id: string }>): Promise<void> {
    try {
      await this.runExportUseCase.execute(job.data.job_id, job.attemptsMade + 1);
    } catch (error) {
      if (error instanceof ExportRejectedError) throw new UnrecoverableError(error.message);
      throw error;
    }
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job<{ job_id: string }> | undefined, error: Error): Promise<void> {
    if (!job) return;
    const attempts = job.opts.attempts ?? 1;
    const final_failure = error instanceof UnrecoverableError || error.name === 'UnrecoverableError' || job.attemptsMade >= attempts;
    this.logger.warn(`Export ${job.data.job_id} attempt ${job.attemptsMade}/${attempts} failed: ${error.message}`);
    if (final_failure) await this.runExportUseCase.fail(job.data.job_id, error.message);
  }
}
