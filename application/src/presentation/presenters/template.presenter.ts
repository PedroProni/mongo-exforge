import { TemplateEntity } from '@domain/entities/template.entity';
import { TemplateResponse } from '@shared/responses/template-response.type';

export class TemplatePresenter {
  static toResponse(template: TemplateEntity): TemplateResponse {
    return {
      id: template.getId(),
      name: template.getName(),
      export_format: template.getExportFormat(),
      query: template.getQuery().map(item => ({ connection_id: item.getConnectionId(), collection: item.getCollection(), field: item.getField(), operator: item.getOperator(), value: item.getValue() })),
      fields: template.getFields(),
      sort: template.getSort(),
      max_rows: template.getMaxRows(),
      created_at: template.getCreatedAt(),
      updated_at: template.getUpdatedAt(),
    };
  }
}
