import { MongoEntity } from '@domain/entities/mongo.entity';
import { DomainCollectionMapper } from '@domain/mappers/complements/collection.mapper';

export class DomainMongoMapper {
  static toPersistence(entity: MongoEntity): any {
    return {
      user_id: entity.getUserId(),
      remember_me: entity.getRememberMe(),
      uri: entity.getUri(),
      collections: entity.getCollections().map(DomainCollectionMapper.toPersistence),
    };
  }

  static toDomain(raw: any): MongoEntity {
    return new MongoEntity({
      user_id: raw.user_id,
      remember_me: raw.remember_me,
      uri: raw.uri,
      collections: raw.collections.map(DomainCollectionMapper.toDomain),
    });
  }
}
