import { Readable, Writable } from 'stream';
import { pipeline } from 'stream/promises';
import { ExportRejectedError } from '@application/errors/export-rejected.error';
import { EncryptionService } from '@application/services/encryption.service';
import { SourceGroupService } from '@application/services/source-group.service';
import { ExportStreamService } from '@application/services/export-stream.service';
import { RunExportUseCase } from '@application/use-cases/job/run-export.use-case';
import { EnvConfigService } from '@common/env/services/env-config.service';
import { ExportStatus } from '@domain/enums/export-status.enum';
import { StoragePort } from '@domain/ports/storage.port';
import { JobRepository } from '@domain/repositories/job.repository';
import { MongoRepository } from '@domain/repositories/mongo.repository';
import { ExportRow } from '@domain/types/export-row.type';
import { UploadInput } from '@domain/types/upload-input.type';
import { buildJob } from '../../../testing/job.factory';

describe('RunExportUseCase', () => {
  function build(rows: ExportRow[], options: { status?: ExportStatus; max_rows?: number; missing?: boolean; upload_error?: Error; piped?: boolean } = {}) {
    const job = buildJob({ status: options.status ?? ExportStatus.PENDING, file_key: '', query: [{ uri: 'enc', collection: 'people', field: 'a', operator: 'eq' as never, value: 1 }] });
    const repository = {
      findById: jest.fn().mockResolvedValue(options.missing ? null : job),
      markInProgress: jest.fn().mockResolvedValue(undefined),
      updateProgress: jest.fn().mockResolvedValue(undefined),
      markCompleted: jest.fn().mockResolvedValue(undefined),
      markFailed: jest.fn().mockResolvedValue(undefined),
    };
    const mongo = {
      stream: async function* () {
        for (const row of rows) yield row;
      },
    };
    const uploaded: Buffer[] = [];
    const storage = {
      upload: jest.fn().mockImplementation(async (input: UploadInput) => {
        if (options.upload_error) throw options.upload_error;
        if (options.piped) {
          await new Promise(resolve => setTimeout(resolve, 20));
          return pipeline(input.body as Readable, new Writable({ write: (_chunk, _encoding, callback) => callback() }));
        }
        for await (const chunk of input.body) uploaded.push(Buffer.from(chunk as Buffer));
      }),
    };
    const streams = {
      create: (_format: unknown, _fields: unknown, source: AsyncIterable<ExportRow>) =>
        Readable.from(
          (async function* () {
            for await (const row of source) yield JSON.stringify(row) + '\n';
          })(),
        ),
    };
    const useCase = new RunExportUseCase(
      repository as unknown as JobRepository,
      mongo as unknown as MongoRepository,
      storage as unknown as StoragePort,
      new SourceGroupService({ decrypt: (value: string) => value } as unknown as EncryptionService),
      streams as unknown as ExportStreamService,
      { getExportMaxRows: () => options.max_rows ?? 1000 } as unknown as EnvConfigService,
    );
    return { useCase, repository, storage, uploaded };
  }

  it('uploads the rows under a deterministic key and marks the job completed', async () => {
    const { useCase, repository, storage, uploaded } = build([{ a: 1 }, { a: 2 }]);
    await useCase.execute('job-1', 2);
    expect(repository.markInProgress).toHaveBeenCalledWith('job-1', 2);
    expect(storage.upload.mock.calls[0][0].key).toBe('exports/user-1/job-1.csv');
    expect(Buffer.concat(uploaded).toString()).toBe('{"a":1}\n{"a":2}\n');
    expect(repository.markCompleted).toHaveBeenCalledWith('job-1', { file_key: 'exports/user-1/job-1.csv', file_size: 16, rows_exported: 2 });
  });

  it('completes an empty result without uploading anything', async () => {
    const { useCase, repository, storage } = build([]);
    await useCase.execute('job-1', 1);
    expect(storage.upload).not.toHaveBeenCalled();
    expect(repository.markCompleted).toHaveBeenCalledWith('job-1', { file_key: '', file_size: 0, rows_exported: 0 });
  });

  it.each([ExportStatus.COMPLETED, ExportStatus.FAILED, ExportStatus.EXPIRED])('does nothing for a %s job (idempotent redelivery)', async status => {
    const { useCase, repository, storage } = build([{ a: 1 }], { status });
    await useCase.execute('job-1', 1);
    expect(repository.markInProgress).not.toHaveBeenCalled();
    expect(storage.upload).not.toHaveBeenCalled();
  });

  it('rejects without retry semantics when the job is gone', async () => {
    const { useCase } = build([], { missing: true });
    await expect(useCase.execute('job-1', 1)).rejects.toBeInstanceOf(ExportRejectedError);
  });

  it('aborts with a rejection when the row cap is exceeded and never completes the job', async () => {
    const { useCase, repository } = build([{ a: 1 }, { a: 2 }, { a: 3 }], { max_rows: 2 });
    await expect(useCase.execute('job-1', 1)).rejects.toBeInstanceOf(ExportRejectedError);
    expect(repository.markCompleted).not.toHaveBeenCalled();
  });

  it('does not crash when the row cap is hit before a slow storage starts reading the upload body', async () => {
    const { useCase } = build(
      Array.from({ length: 500 }, (_, index) => ({ a: index })),
      { max_rows: 100, piped: true },
    );
    await expect(useCase.execute('job-1', 1)).rejects.toBeInstanceOf(ExportRejectedError);
    await new Promise(resolve => setTimeout(resolve, 50));
  });

  it('propagates a storage failure so the queue can retry', async () => {
    const { useCase, repository } = build([{ a: 1 }], { upload_error: new Error('storage down') });
    await expect(useCase.execute('job-1', 1)).rejects.toThrow('storage down');
    expect(repository.markCompleted).not.toHaveBeenCalled();
  });

  it('marks the job failed on request', async () => {
    const { useCase, repository } = build([]);
    await useCase.fail('job-1', 'boom');
    expect(repository.markFailed).toHaveBeenCalledWith('job-1', 'boom');
  });
});
