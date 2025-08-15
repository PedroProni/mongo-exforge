import { MongoEntity } from '@domain/entities/mongo.entity';

export interface MongoRepository {
  getInfo(uris: string[], remember_me: boolean, user_id: string): Promise<MongoEntity>;
}
