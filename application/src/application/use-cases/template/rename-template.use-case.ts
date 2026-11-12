import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TemplateEntity } from '@domain/entities/template.entity';
import { TemplateRepository } from '@domain/repositories/template.repository';
import { TEMPLATE_INJECT_TOKEN } from '@domain/constants/inject.constant';
import { AuthenticatedUser } from '@domain/types/authenticated-user.type';

@Injectable()
export class RenameTemplateUseCase {
  constructor(@Inject(TEMPLATE_INJECT_TOKEN) private readonly templateRepository: TemplateRepository) {}

  async execute(user: AuthenticatedUser, id: string, name: string): Promise<TemplateEntity> {
    if (!(await this.templateRepository.renameOwned(user.id, id, name.trim()))) throw new NotFoundException('Template not found');
    const template = await this.templateRepository.findOwned(user.id, id);
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }
}
