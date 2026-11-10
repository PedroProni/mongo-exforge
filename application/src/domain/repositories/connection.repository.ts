import { ConnectionEntity } from '@domain/entities/connection.entity';

export interface ConnectionRepository {
  create(connection: ConnectionEntity): Promise<ConnectionEntity>;
  findOwned(user_id: string, id: string): Promise<ConnectionEntity | null>;
  listOwned(user_id: string): Promise<ConnectionEntity[]>;
  countOwned(user_id: string): Promise<number>;
  deleteOwned(user_id: string, id: string): Promise<boolean>;
  deleteAllOwned(user_id: string): Promise<void>;
}
