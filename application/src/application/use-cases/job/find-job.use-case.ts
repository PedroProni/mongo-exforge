import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { JobEntity } from '@domain/entities/job.entity';
import { JobRepository } from '@domain/repositories/job.repository';
import { JOB_INJECT_TOKEN } from '@domain/constants/inject.constant';
import { AuthenticatedUser } from '@domain/types/authenticated-user.type';

@Injectable()
export class FindJobUseCase {
  constructor(@Inject(JOB_INJECT_TOKEN) private readonly jobRepository: JobRepository) {}

  async execute(user: AuthenticatedUser, id: string): Promise<JobEntity> {
    const job = await this.jobRepository.findOwned(user.id, id);
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }
}
