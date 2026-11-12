import { TemplateEntity } from '@domain/entities/template.entity';

export interface TemplateRepository {
  create(template: TemplateEntity): Promise<TemplateEntity>;
  findOwned(user_id: string, id: string): Promise<TemplateEntity | null>;
  listOwned(user_id: string): Promise<TemplateEntity[]>;
  countOwned(user_id: string): Promise<number>;
  renameOwned(user_id: string, id: string, name: string): Promise<boolean>;
  deleteOwned(user_id: string, id: string): Promise<boolean>;
  deleteAllOwned(user_id: string): Promise<void>;
}
