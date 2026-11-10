import { ConnectionEntity } from '@domain/entities/connection.entity';
import { ConnectionProps } from '@domain/types/connection-props.type';

export class ConnectionDocumentMapper {
  static toPersistence(entity: ConnectionEntity): ConnectionProps {
    return {
      _id: entity.getId(),
      user_id: entity.getUserId(),
      name: entity.getName(),
      uri: entity.getUri(),
      uri_masked: entity.getUriMasked(),
      created_at: entity.getCreatedAt(),
      updated_at: entity.getUpdatedAt(),
    };
  }

  static toDomain(raw: ConnectionProps): ConnectionEntity {
    return new ConnectionEntity(raw);
  }
}
