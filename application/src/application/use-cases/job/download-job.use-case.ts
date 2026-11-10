import { ConflictException, GoneException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DEFAULT_FILE_BASENAME, DOWNLOAD_LINK_TTL_SECONDS, MAX_FILE_BASENAME_LENGTH } from '@domain/constants/export.constant';
import { ExportStatus } from '@domain/enums/export-status.enum';
import { StoragePort } from '@domain/ports/storage.port';
import { JobRepository } from '@domain/repositories/job.repository';
import { JOB_INJECT_TOKEN, STORAGE_INJECT_TOKEN } from '@domain/tokens/inject.token';
import { AuthenticatedUser } from '@domain/types/authenticated-user.type';

@Injectable()
export class DownloadJobUseCase {
  constructor(
    @Inject(JOB_INJECT_TOKEN) private readonly jobRepository: JobRepository,
    @Inject(STORAGE_INJECT_TOKEN) private readonly storage: StoragePort,
  ) {}

  async execute(user: AuthenticatedUser, id: string): Promise<string> {
    const job = await this.jobRepository.findOwned(user.id, id);
    if (!job) throw new NotFoundException('Job not found');
    if (job.getStatus() === ExportStatus.EXPIRED) throw new GoneException('The export file has expired');
    if (job.getStatus() !== ExportStatus.COMPLETED) throw new ConflictException('The export is not ready');
    if (!job.getFileKey()) throw new NotFoundException('The export produced no rows, so there is no file');

    const base =
      job
        .getName()
        .replace(/[^A-Za-z0-9._-]+/g, '_')
        .replace(/^[._]+|[._]+$/g, '')
        .slice(0, MAX_FILE_BASENAME_LENGTH) || DEFAULT_FILE_BASENAME;
    return this.storage.createDownloadUrl({ key: job.getFileKey(), filename: `${base}.${job.getExportFormat()}`, ttl_seconds: DOWNLOAD_LINK_TTL_SECONDS });
  }
}
