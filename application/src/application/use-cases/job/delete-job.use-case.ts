import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ExportStatus } from '@domain/enums/export-status.enum';
import { StoragePort } from '@domain/ports/storage.port';
import { JobRepository } from '@domain/repositories/job.repository';
import { JOB_INJECT_TOKEN, STORAGE_INJECT_TOKEN } from '@domain/constants/inject.constant';
import { AuthenticatedUser } from '@domain/types/authenticated-user.type';

@Injectable()
export class DeleteJobUseCase {
  constructor(
    @Inject(JOB_INJECT_TOKEN) private readonly jobRepository: JobRepository,
    @Inject(STORAGE_INJECT_TOKEN) private readonly storage: StoragePort,
  ) {}

  async execute(user: AuthenticatedUser, id: string): Promise<void> {
    const job = await this.jobRepository.findOwned(user.id, id);
    if (!job) throw new NotFoundException('Job not found');
    if (job.getStatus() === ExportStatus.PENDING || job.getStatus() === ExportStatus.IN_PROGRESS) throw new ConflictException('The export is still running');
    if (job.getFileKey()) await this.storage.delete(job.getFileKey());
    await this.jobRepository.deleteOwned(user.id, id);
  }
}
