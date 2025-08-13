import { MongoEntity } from '@domain/entities/mongo.entity';
import { DomainCollectionMapper } from '@domain/mappers/complements/collection.mapper';

export class DomainMongoMapper {
  static toPersistence(entity: MongoEntity): any {
    return {
      uris: entity.getUris(),
      collections: entity.getCollections().map(DomainCollectionMapper.toPersistence),
    };
  }

  static toDomain(raw: any): MongoEntity {
    return new MongoEntity({
      uris: raw.uris,
      collections: raw.collections.map(DomainCollectionMapper.toDomain),
    });
  }
}
