import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { StoredInputService } from '@application/services/stored-input.service';
import { CreateJobUseCase } from '@application/use-cases/job/create-job.use-case';
import { JobEntity } from '@domain/entities/job.entity';
import { TemplateRepository } from '@domain/repositories/template.repository';
import { TEMPLATE_INJECT_TOKEN } from '@domain/constants/inject.constant';
import { AuthenticatedUser } from '@domain/types/authenticated-user.type';

@Injectable()
export class RunTemplateUseCase {
  constructor(
    @Inject(TEMPLATE_INJECT_TOKEN) private readonly templateRepository: TemplateRepository,
    private readonly storedInputService: StoredInputService,
    private readonly createJobUseCase: CreateJobUseCase,
  ) {}

  async execute(user: AuthenticatedUser, id: string, name?: string): Promise<JobEntity> {
    const template = await this.templateRepository.findOwned(user.id, id);
    if (!template) throw new NotFoundException('Template not found');
    const input = this.storedInputService.toCreateJobInput(name?.trim() || template.getName(), {
      export_format: template.getExportFormat(),
      query: template.getQuery().map(item => item.toProps()),
      fields: template.getFields(),
      sort: template.getSort(),
      max_rows: template.getMaxRows(),
    });
    return this.createJobUseCase.execute(user, input);
  }
}
