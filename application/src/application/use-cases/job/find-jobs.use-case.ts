import { Inject, Injectable } from '@nestjs/common';
import { JobEntity } from '@domain/entities/job.entity';
import { JobRepository } from '@domain/repositories/job.repository';
import { JOB_INJECT_TOKEN } from '@domain/constants/inject.constant';
import { AuthenticatedUser } from '@domain/types/authenticated-user.type';
import { Page } from '@domain/types/page.type';
import { PageRequest } from '@domain/types/page-request.type';

@Injectable()
export class FindJobsUseCase {
  constructor(@Inject(JOB_INJECT_TOKEN) private readonly jobRepository: JobRepository) {}

  execute(user: AuthenticatedUser, request: PageRequest): Promise<Page<JobEntity>> {
    return this.jobRepository.listOwned(user.id, request);
  }
}
