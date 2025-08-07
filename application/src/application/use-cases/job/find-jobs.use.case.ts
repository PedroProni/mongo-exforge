import { Inject, Injectable } from '@nestjs/common';
import { JOB_INJECT_TOKEN } from '@domain/tokens/inject.token';
import { JobRepository } from '@domain/repositories/job.repository';

@Injectable()
export class FindJobsUseCase {
  constructor(@Inject(JOB_INJECT_TOKEN) private readonly jobRepository: JobRepository) {}

  async execute(page: number, limit: number, id?: string) {
    return this.jobRepository.find(page, limit, id);
  }
}
