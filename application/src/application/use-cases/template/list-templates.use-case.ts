import { Inject, Injectable } from '@nestjs/common';
import { TemplateEntity } from '@domain/entities/template.entity';
import { TemplateRepository } from '@domain/repositories/template.repository';
import { TEMPLATE_INJECT_TOKEN } from '@domain/constants/inject.constant';
import { AuthenticatedUser } from '@domain/types/authenticated-user.type';

@Injectable()
export class ListTemplatesUseCase {
  constructor(@Inject(TEMPLATE_INJECT_TOKEN) private readonly templateRepository: TemplateRepository) {}

  execute(user: AuthenticatedUser): Promise<TemplateEntity[]> {
    return this.templateRepository.listOwned(user.id);
  }
}
