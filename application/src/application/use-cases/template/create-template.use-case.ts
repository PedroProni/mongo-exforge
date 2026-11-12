import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { JobInputResolverService } from '@application/services/job-input-resolver.service';
import { TemplateEntity } from '@domain/entities/template.entity';
import { TemplateRepository } from '@domain/repositories/template.repository';
import { TEMPLATE_INJECT_TOKEN } from '@domain/constants/inject.constant';
import { MAX_TEMPLATES_PER_USER, TEMPLATE_LIMIT_MESSAGE } from '@domain/constants/template.constant';
import { AuthenticatedUser } from '@domain/types/authenticated-user.type';
import { CreateJobInput } from '@domain/types/create-job-input.type';

@Injectable()
export class CreateTemplateUseCase {
  constructor(
    @Inject(TEMPLATE_INJECT_TOKEN) private readonly templateRepository: TemplateRepository,
    private readonly jobInputResolver: JobInputResolverService,
  ) {}

  async execute(user: AuthenticatedUser, input: CreateJobInput): Promise<TemplateEntity> {
    if ((await this.templateRepository.countOwned(user.id)) >= MAX_TEMPLATES_PER_USER) throw new ConflictException(TEMPLATE_LIMIT_MESSAGE);
    const query = await this.jobInputResolver.resolve(user, input);
    const template = TemplateEntity.create({
      user_id: user.id,
      name: input.name.trim(),
      export_format: input.export_format,
      query,
      fields: input.fields,
      sort: input.sort,
      max_rows: input.max_rows,
    });
    return this.templateRepository.create(template);
  }
}
