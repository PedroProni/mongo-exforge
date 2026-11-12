import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { StoredInputService } from '@application/services/stored-input.service';
import { CreateJobUseCase } from '@application/use-cases/job/create-job.use-case';
import { JobEntity } from '@domain/entities/job.entity';
import { JobRepository } from '@domain/repositories/job.repository';
import { JOB_INJECT_TOKEN } from '@domain/constants/inject.constant';
import { AuthenticatedUser } from '@domain/types/authenticated-user.type';

@Injectable()
export class RerunJobUseCase {
  constructor(
    @Inject(JOB_INJECT_TOKEN) private readonly jobRepository: JobRepository,
    private readonly storedInputService: StoredInputService,
    private readonly createJobUseCase: CreateJobUseCase,
  ) {}

  async execute(user: AuthenticatedUser, id: string, name?: string): Promise<JobEntity> {
    const job = await this.jobRepository.findOwned(user.id, id);
    if (!job) throw new NotFoundException('Job not found');
    const input = this.storedInputService.toCreateJobInput(name?.trim() || job.getName(), {
      export_format: job.getExportFormat(),
      query: job.getQuery().map(item => item.toProps()),
      fields: job.getFields(),
      sort: job.getSort(),
      max_rows: job.getMaxRows(),
    });
    return this.createJobUseCase.execute(user, input);
  }
}
