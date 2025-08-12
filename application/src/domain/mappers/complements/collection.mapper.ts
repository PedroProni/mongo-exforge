import { CollectionEntity } from '@domain/entities/complements/collection.entity';

export class DomainCollectionMapper {
  toPersistence(entity: CollectionEntity): any {
    return {
      db_name: entity.getDbName(),
      collection_name: entity.getCollectionName(),
      collection_fields: entity.getCollectionFields(),
    };
    0;
  }

  toDomain(data: any): CollectionEntity {
    return new CollectionEntity({
      db_name: data.db_name,
      collection_name: data.collection_name,
      collection_fields: data.collection_fields,
    });
  }
}
