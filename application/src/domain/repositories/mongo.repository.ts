import { MongoEntity } from '@domain/entities/mongo.entity';

export interface MongoRepository {
  getInfo(uris: string[]): Promise<MongoEntity | void>;
}
