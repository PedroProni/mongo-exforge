import { JobEntity } from '@domain/entities/job.entity';
import { JobProps } from '@domain/types/job-props.type';

export class JobDocumentMapper {
  static toPersistence(entity: JobEntity): JobProps {
    return {
      _id: entity.getId(),
      user_id: entity.getUserId(),
      name: entity.getName(),
      status: entity.getStatus(),
      export_format: entity.getExportFormat(),
      query: entity.getQuery().map(item => item.toProps()),
      fields: entity.getFields(),
      sort: entity.getSort(),
      file_key: entity.getFileKey(),
      file_size: entity.getFileSize(),
      rows_exported: entity.getRowsExported(),
      attempts: entity.getAttempts(),
      max_rows: entity.getMaxRows(),
      error: entity.getError(),
      started_at: entity.getStartedAt(),
      finished_at: entity.getFinishedAt(),
      created_at: entity.getCreatedAt(),
      updated_at: entity.getUpdatedAt(),
    };
  }

  static toDomain(raw: JobProps): JobEntity {
    return new JobEntity({
      _id: raw._id,
      user_id: raw.user_id,
      name: raw.name,
      status: raw.status,
      export_format: raw.export_format,
      query: raw.query,
      fields: raw.fields ?? [],
      sort: raw.sort ?? {},
      file_key: raw.file_key ?? '',
      file_size: raw.file_size ?? 0,
      rows_exported: raw.rows_exported ?? 0,
      attempts: raw.attempts ?? 0,
      max_rows: raw.max_rows ?? 0,
      error: raw.error ?? '',
      started_at: raw.started_at ?? null,
      finished_at: raw.finished_at ?? null,
      created_at: raw.created_at,
      updated_at: raw.updated_at,
    });
  }
}
