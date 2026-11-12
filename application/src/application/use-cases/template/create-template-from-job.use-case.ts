import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { StoredInputService } from '@application/services/stored-input.service';
import { CreateTemplateUseCase } from '@application/use-cases/template/create-template.use-case';
import { TemplateEntity } from '@domain/entities/template.entity';
import { JobRepository } from '@domain/repositories/job.repository';
import { JOB_INJECT_TOKEN } from '@domain/constants/inject.constant';
import { AuthenticatedUser } from '@domain/types/authenticated-user.type';

@Injectable()
export class CreateTemplateFromJobUseCase {
  constructor(
    @Inject(JOB_INJECT_TOKEN) private readonly jobRepository: JobRepository,
    private readonly storedInputService: StoredInputService,
    private readonly createTemplateUseCase: CreateTemplateUseCase,
  ) {}

  async execute(user: AuthenticatedUser, job_id: string, name: string): Promise<TemplateEntity> {
    const job = await this.jobRepository.findOwned(user.id, job_id);
    if (!job) throw new NotFoundException('Job not found');
    const input = this.storedInputService.toCreateJobInput(name, {
      export_format: job.getExportFormat(),
      query: job.getQuery().map(item => item.toProps()),
      fields: job.getFields(),
      sort: job.getSort(),
      max_rows: job.getMaxRows(),
    });
    return this.createTemplateUseCase.execute(user, input);
  }
}
