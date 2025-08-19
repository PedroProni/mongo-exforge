import { Inject, Injectable } from '@nestjs/common';
import { JOB_INJECT_TOKEN } from '@domain/tokens/inject.token';
import { JobRepository } from '@domain/repositories/job.repository';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class FindJobsUseCase {
  constructor(
    @Inject(JOB_INJECT_TOKEN) private readonly jobRepository: JobRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(page: number, limit: number, user_token: string, _id?: string) {
    const { id } = this.jwtService.verify(user_token);
    return this.jobRepository.find(page, limit, id, _id);
  }
}
