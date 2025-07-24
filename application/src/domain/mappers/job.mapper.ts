import { JobEntity } from "@domain/entities/job.entity";

export class DomainJobMapper {
    static toPersistence(entity: JobEntity): any {
        return {
            id: entity.getId(),
            status: entity.getStatus(),
            export_format: entity.getExportFormat(),
            query: entity.getQuery(),
            file_url: entity.getFileUrl(),
            created_at: entity.getCreatedAt(),
            updated_at: entity.getUpdatedAt()
        };
    }

    static toDomain(raw: any): JobEntity {
        return new JobEntity({
            _id: raw.id,
            status: raw.status,
            export_format: raw.export_format,
            query: raw.query,
            file_url: raw.file_url,
            created_at: raw.created_at,
            updated_at: raw.updated_at
        });
    }
}
