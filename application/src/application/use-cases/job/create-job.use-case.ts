import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { JobInputResolverService } from '@application/services/job-input-resolver.service';
import { JobEntity } from '@domain/entities/job.entity';
import { JobQueuePort } from '@domain/ports/job-queue.port';
import { JobRepository } from '@domain/repositories/job.repository';
import { JOB_INJECT_TOKEN, JOB_QUEUE_INJECT_TOKEN } from '@domain/constants/inject.constant';
import { AuthenticatedUser } from '@domain/types/authenticated-user.type';
import { CreateJobInput } from '@domain/types/create-job-input.type';

@Injectable()
export class CreateJobUseCase {
  constructor(
    @Inject(JOB_INJECT_TOKEN) private readonly jobRepository: JobRepository,
    @Inject(JOB_QUEUE_INJECT_TOKEN) private readonly jobQueue: JobQueuePort,
    private readonly jobInputResolver: JobInputResolverService,
  ) {}

  async execute(user: AuthenticatedUser, input: CreateJobInput): Promise<JobEntity> {
    const query = await this.jobInputResolver.resolve(user, input);

    const job = JobEntity.create({
      user_id: user.id,
      name: input.name.trim(),
      export_format: input.export_format,
      query,
      fields: input.fields,
      sort: input.sort,
      max_rows: input.max_rows,
    });
    await this.jobRepository.create(job);

    try {
      await this.jobQueue.enqueue(job.getId());
    } catch {
      await this.jobRepository.markFailed(job.getId(), 'Could not enqueue the export');
      throw new ServiceUnavailableException('Could not enqueue the export');
    }
    return job;
  }
}
