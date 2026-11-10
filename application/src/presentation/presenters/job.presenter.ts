import { JobEntity } from '@domain/entities/job.entity';
import { Page } from '@domain/types/page.type';
import { JobResponse } from '@shared/responses/job-response.type';

export class JobPresenter {
  static toResponse(job: JobEntity): JobResponse {
    return {
      id: job.getId(),
      name: job.getName(),
      status: job.getStatus(),
      export_format: job.getExportFormat(),
      rows_exported: job.getRowsExported(),
      attempts: job.getAttempts(),
      max_rows: job.getMaxRows(),
      error: job.getError(),
      file_available: job.getFileKey() !== '',
      query: job.getQuery().map(item => ({ collection: item.getCollection(), field: item.getField(), operator: item.getOperator(), value: item.getValue() })),
      fields: job.getFields(),
      sort: job.getSort(),
      created_at: job.getCreatedAt(),
      started_at: job.getStartedAt(),
      finished_at: job.getFinishedAt(),
    };
  }

  static toPage(page: Page<JobEntity>): Page<JobResponse> {
    return { ...page, items: page.items.map(item => JobPresenter.toResponse(item)) };
  }
}
