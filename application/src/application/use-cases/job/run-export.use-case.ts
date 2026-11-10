import { Inject, Injectable, Logger } from '@nestjs/common';
import { EnvConfigService } from '@common/env/services/env-config.service';
import { EncryptionService } from '@application/services/encryption.service';
import { ExportStreamService } from '@application/services/export-stream.service';
import { ExportRejectedError } from '@application/errors/export-rejected.error';
import { EXPORT_CONTENT_TYPES, OBJECT_KEY_PREFIX, XLSX_MAX_ROWS } from '@domain/constants/export.constant';
import { PROGRESS_FLUSH_ROWS } from '@domain/constants/queue.constant';
import { JobEntity } from '@domain/entities/job.entity';
import { ExportFormat } from '@domain/enums/export-format.enum';
import { ExportStatus } from '@domain/enums/export-status.enum';
import { StoragePort } from '@domain/ports/storage.port';
import { JobRepository } from '@domain/repositories/job.repository';
import { MongoRepository } from '@domain/repositories/mongo.repository';
import { JOB_INJECT_TOKEN, MONGO_INJECT_TOKEN, STORAGE_INJECT_TOKEN } from '@domain/tokens/inject.token';
import { ExportRow } from '@domain/types/export-row.type';
import { SourceGroup } from '@domain/types/source-group.type';

@Injectable()
export class RunExportUseCase {
  private readonly logger = new Logger(RunExportUseCase.name);

  constructor(
    @Inject(JOB_INJECT_TOKEN) private readonly jobRepository: JobRepository,
    @Inject(MONGO_INJECT_TOKEN) private readonly mongoRepository: MongoRepository,
    @Inject(STORAGE_INJECT_TOKEN) private readonly storage: StoragePort,
    private readonly encryptionService: EncryptionService,
    private readonly exportStreamService: ExportStreamService,
    private readonly envConfigService: EnvConfigService,
  ) {}

  async execute(job_id: string, attempt: number): Promise<void> {
    const job = await this.jobRepository.findById(job_id);
    if (!job) throw new ExportRejectedError('Job not found');
    if (job.getStatus() === ExportStatus.COMPLETED || job.getStatus() === ExportStatus.EXPIRED || job.getStatus() === ExportStatus.FAILED) return;

    await this.jobRepository.markInProgress(job_id, attempt);

    const counter = { rows: 0 };
    const iterator = this.meter(job, counter)[Symbol.asyncIterator]();
    try {
      const first = await iterator.next();
      if (first.done) {
        await this.jobRepository.markCompleted(job_id, { file_key: '', rows_exported: 0 });
        return;
      }
      await this.upload(job, first.value, iterator, counter);
    } finally {
      await iterator.return?.(undefined);
    }
  }

  async fail(job_id: string, message: string): Promise<void> {
    await this.jobRepository.markFailed(job_id, message);
    this.logger.warn(`Export ${job_id} marked as failed`);
  }

  private async upload(job: JobEntity, first: ExportRow, iterator: AsyncIterator<ExportRow>, counter: { rows: number }): Promise<void> {
    async function* chain(): AsyncGenerator<ExportRow> {
      yield first;
      for (;;) {
        const next = await iterator.next();
        if (next.done) return;
        yield next.value;
      }
    }

    const key = `${OBJECT_KEY_PREFIX}/${job.getUserId()}/${job.getId()}.${job.getExportFormat()}`;
    const stream = this.exportStreamService.create(job.getExportFormat(), job.getFields(), chain());
    try {
      await this.storage.upload({ key, body: stream, content_type: EXPORT_CONTENT_TYPES[job.getExportFormat()] });
    } catch (error) {
      stream.destroy(error as Error);
      throw error;
    }
    await this.jobRepository.markCompleted(job.getId(), { file_key: key, rows_exported: counter.rows });
  }

  private async *meter(job: JobEntity, counter: { rows: number }): AsyncGenerator<ExportRow> {
    const max_rows = job.getExportFormat() === ExportFormat.XLSX ? Math.min(this.envConfigService.getExportMaxRows(), XLSX_MAX_ROWS) : this.envConfigService.getExportMaxRows();
    const source = this.mongoRepository.stream({ groups: this.group(job), fields: job.getFields(), sort: job.getSort() });
    for await (const row of source) {
      counter.rows++;
      if (counter.rows > max_rows) throw new ExportRejectedError(`The export exceeds the limit of ${max_rows} rows`);
      if (counter.rows % PROGRESS_FLUSH_ROWS === 0) await this.jobRepository.updateProgress(job.getId(), counter.rows);
      yield row;
    }
  }

  private group(job: JobEntity): SourceGroup[] {
    const groups = new Map<string, SourceGroup>();
    for (const query of job.getQuery()) {
      const uri = this.encryptionService.decrypt(query.getUri());
      const key = `${uri}\u0000${query.getCollection()}`;
      const group = groups.get(key) ?? { uri, collection: query.getCollection(), filters: [] };
      group.filters.push({ uri, collection: query.getCollection(), field: query.getField(), operator: query.getOperator(), value: query.getValue() });
      groups.set(key, group);
    }
    return Array.from(groups.values());
  }
}
