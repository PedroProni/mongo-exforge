import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TemplateRepository } from '@domain/repositories/template.repository';
import { TEMPLATE_INJECT_TOKEN } from '@domain/constants/inject.constant';
import { AuthenticatedUser } from '@domain/types/authenticated-user.type';

@Injectable()
export class DeleteTemplateUseCase {
  constructor(@Inject(TEMPLATE_INJECT_TOKEN) private readonly templateRepository: TemplateRepository) {}

  async execute(user: AuthenticatedUser, id: string): Promise<void> {
    if (!(await this.templateRepository.deleteOwned(user.id, id))) throw new NotFoundException('Template not found');
  }
}
