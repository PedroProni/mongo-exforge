import { Injectable, Inject } from '@nestjs/common';
import { JOB_INJECT_TOKEN } from '@domain/tokens/inject.token';
import { CreateJobCommand } from '@application/commands/job/create-job.command';
import { JobEntity } from '@domain/entities/job.entity';
import { JobRepository } from '@domain/repositories/job.repository';
import { ApplicationJobMapper } from '@application/mappers/job.mapper';

@Injectable()
export class CreateJobUseCase {
  constructor(@Inject(JOB_INJECT_TOKEN) private readonly jobRepository: JobRepository) {}

  async execute(command: CreateJobCommand): Promise<JobEntity> {
    return this.jobRepository.create(ApplicationJobMapper.toEntity(command));
  }
}
