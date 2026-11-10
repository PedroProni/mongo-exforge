import { BadRequestException, Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { EncryptionService } from '@application/services/encryption.service';
import { JobEntity } from '@domain/entities/job.entity';
import { JobQueuePort } from '@domain/ports/job-queue.port';
import { JobRepository } from '@domain/repositories/job.repository';
import { MongoRepository } from '@domain/repositories/mongo.repository';
import { JOB_INJECT_TOKEN, JOB_QUEUE_INJECT_TOKEN, MONGO_INJECT_TOKEN } from '@domain/constants/inject.constant';
import { AuthenticatedUser } from '@domain/types/authenticated-user.type';
import { CreateJobInput } from '@domain/types/create-job-input.type';

@Injectable()
export class CreateJobUseCase {
  constructor(
    @Inject(JOB_INJECT_TOKEN) private readonly jobRepository: JobRepository,
    @Inject(MONGO_INJECT_TOKEN) private readonly mongoRepository: MongoRepository,
    @Inject(JOB_QUEUE_INJECT_TOKEN) private readonly jobQueue: JobQueuePort,
    private readonly encryptionService: EncryptionService,
  ) {}

  async execute(user: AuthenticatedUser, input: CreateJobInput): Promise<JobEntity> {
    await this.assertSources(input);

    const job = JobEntity.create({
      user_id: user.id,
      name: input.name.trim(),
      export_format: input.export_format,
      query: input.query.map(item => ({ ...item, uri: this.encryptionService.encrypt(item.uri) })),
      fields: input.fields,
      sort: input.sort,
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

  private async assertSources(input: CreateJobInput): Promise<void> {
    const uris = Array.from(new Set(input.query.map(item => item.uri)));
    for (const uri of uris) {
      try {
        await this.mongoRepository.assertAllowed(uri);
      } catch (error) {
        throw new BadRequestException((error as Error).message);
      }
    }
  }
}
