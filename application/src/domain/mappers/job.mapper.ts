import { JobEntity } from '@domain/entities/job.entity';

export class DomainJobMapper {
  static toPersistence(entity: JobEntity): any {
    return {
      _id: entity.getId(),
      name: entity.getName(),
      status: entity.getStatus(),
      export_format: entity.getExportFormat(),
      collection: entity.getCollection(),
      query: entity.getQuery(),
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
      name: raw.name,
      status: raw.status,
      export_format: raw.export_format,
      collection: raw.collection,
      query: raw.query,
      fields: raw.fields || [],
      sort: raw.sort || {},
      file_url: raw.file_url,
      created_at: raw.created_at || new Date(),
      updated_at: raw.updated_at || new Date(),
    });
  }
}
