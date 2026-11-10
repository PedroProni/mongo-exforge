import { ConnectionEntity } from '@domain/entities/connection.entity';
import { ConnectionResponse } from '@shared/responses/connection-response.type';

export class ConnectionPresenter {
  static toResponse(connection: ConnectionEntity): ConnectionResponse {
    return { id: connection.getId(), name: connection.getName(), uri_masked: connection.getUriMasked(), created_at: connection.getCreatedAt() };
  }
}
