import { CollectionEntity } from '@domain/entities/complements/collection.entity';

export class ApplicationCollectionMapper {
  static toEntity(collection: any): CollectionEntity {
    return new CollectionEntity({
      db_name: collection.db_name,
      collection_name: collection.collection_name,
      collection_fields: collection.collection_fields,
    });
  }
}
