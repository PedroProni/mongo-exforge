import { TemplateEntity } from '@domain/entities/template.entity';
import { TemplateProps } from '@domain/types/template-props.type';

export class TemplateDocumentMapper {
  static toPersistence(entity: TemplateEntity): TemplateProps {
    return entity.toProps();
  }

  static toDomain(raw: TemplateProps): TemplateEntity {
    return new TemplateEntity({ ...raw, fields: raw.fields ?? [], sort: raw.sort ?? {}, max_rows: raw.max_rows ?? 0 });
  }
}
