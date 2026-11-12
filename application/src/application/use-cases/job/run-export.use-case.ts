import { Inject, Injectable, Logger } from '@nestjs/common';
import { Transform } from 'stream';
import { EnvConfigService } from '@common/env/services/env-config.service';
import { SourceGroupService } from '@application/services/source-group.service';
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
import { JOB_INJECT_TOKEN, MONGO_INJECT_TOKEN, STORAGE_INJECT_TOKEN } from '@domain/constants/inject.constant';
import { ByteCounter } from '@domain/types/byte-counter.type';
import { ExportCounter } from '@domain/types/export-counter.type';
import { ExportRow } from '@domain/types/export-row.type';

@Injectable()
export class RunExportUseCase {
  private readonly logger = new Logger(RunExportUseCase.name);

  constructor(
    @Inject(JOB_INJECT_TOKEN) private readonly jobRepository: JobRepository,
    @Inject(MONGO_INJECT_TOKEN) private readonly mongoRepository: MongoRepository,
    @Inject(STORAGE_INJECT_TOKEN) private readonly storage: StoragePort,
    private readonly sourceGroupService: SourceGroupService,
    private readonly exportStreamService: ExportStreamService,
    private readonly envConfigService: EnvConfigService,
  ) {}

  async execute(job_id: string, attempt: number): Promise<void> {
    const job = await this.jobRepository.findById(job_id);
    if (!job) throw new ExportRejectedError('Job not found');
    if (job.getStatus() === ExportStatus.COMPLETED || job.getStatus() === ExportStatus.EXPIRED || job.getStatus() === ExportStatus.FAILED) return;

    await this.jobRepository.markInProgress(job_id, attempt);

    const counter: ExportCounter = { rows: 0 };
    const iterator = this.meter(job, counter)[Symbol.asyncIterator]();
    try {
      const first = await iterator.next();
      if (first.done) {
        await this.jobRepository.markCompleted(job_id, { file_key: '', file_size: 0, rows_exported: 0 });
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

  private async upload(job: JobEntity, first: ExportRow, iterator: AsyncIterator<ExportRow>, counter: ExportCounter): Promise<void> {
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
    const bytes: ByteCounter = { total: 0 };
    const body = stream.pipe(this.byteCounter(bytes));
    body.on('error', () => undefined);
    stream.on('error', error => body.destroy(error));
    try {
      await this.storage.upload({ key, body, content_type: EXPORT_CONTENT_TYPES[job.getExportFormat()] });
    } catch (error) {
      stream.on('error', () => undefined);
      stream.destroy(error as Error);
      body.destroy();
      throw counter.rejection ?? error;
    }
    await this.jobRepository.markCompleted(job.getId(), { file_key: key, file_size: bytes.total, rows_exported: counter.rows });
  }

  private byteCounter(bytes: ByteCounter): Transform {
    return new Transform({
      transform(chunk: Buffer, _encoding, callback): void {
        bytes.total += chunk.length;
        callback(null, chunk);
      },
    });
  }

  private async *meter(job: JobEntity, counter: ExportCounter): AsyncGenerator<ExportRow> {
    const server_cap = job.getMaxRows() > 0 ? Math.min(job.getMaxRows(), this.envConfigService.getExportMaxRows()) : this.envConfigService.getExportMaxRows();
    const max_rows = job.getExportFormat() === ExportFormat.XLSX ? Math.min(server_cap, XLSX_MAX_ROWS) : server_cap;
    const source = this.mongoRepository.stream({ groups: this.sourceGroupService.build(job.getQuery().map(item => item.toProps())), fields: job.getFields(), sort: job.getSort() });
    for await (const row of source) {
      counter.rows++;
      if (counter.rows > max_rows) {
        counter.rejection = new ExportRejectedError(`The export exceeds the limit of ${max_rows} rows`);
        throw counter.rejection;
      }
      if (counter.rows % PROGRESS_FLUSH_ROWS === 0) await this.jobRepository.updateProgress(job.getId(), counter.rows);
      yield row;
    }
  }
}
