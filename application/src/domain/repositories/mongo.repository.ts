import { MongoEntity } from '@domain/entities/mongo.entity';
import { IConnectionInfo } from '@shared/interfaces/example.interface';

export interface MongoRepository {
  create(user_id: string, uri: string, encrypted_uri: string): Promise<MongoEntity>;
  getInfo(uris: string[], user_id: string): Promise<IConnectionInfo>;
}
