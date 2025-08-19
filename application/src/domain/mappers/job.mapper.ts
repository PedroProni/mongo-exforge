import { JobEntity } from '@domain/entities/job.entity';
import { DomainQueryMapper } from './complements/query.mapper';

export class DomainJobMapper {
  static toPersistence(entity: JobEntity): any {
    return {
      _id: entity.getId(),
      user_id: entity.getUserId(),
      name: entity.getName(),
      status: entity.getStatus(),
      export_format: entity.getExportFormat(),
      join_field: entity.getJoinField(),
      query: entity.getQuery().map(DomainQueryMapper.toPersistence),
      fields: entity.getFields(),
      sort: entity.getSort(),
      file_url: entity.getFileUrl(),
      created_at: entity.getCreatedAt(),
      updated_at: entity.getUpdatedAt(),
    };
  }

  static toDomain(raw: any): JobEntity {
    return new JobEntity({
      _id: raw._id,
      user_id: raw.user_id,
      name: raw.name,
      status: raw.status,
      export_format: raw.export_format,
      join_field: raw.join_field || '',
      query: raw.query.map(DomainQueryMapper.toDomain),
      fields: raw.fields || [],
      sort: raw.sort || {},
      file_url: raw.file_url,
      created_at: raw.created_at || new Date(),
      updated_at: raw.updated_at || new Date(),
    });
  }
}
