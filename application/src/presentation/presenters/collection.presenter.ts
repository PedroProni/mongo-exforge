import { CollectionEntity } from '@domain/entities/collection.entity';
import { CollectionInfo } from '@domain/types/collection-info.type';

export class CollectionPresenter {
  static toResponse(collection: CollectionEntity): CollectionInfo {
    return { db_name: collection.getDbName(), collection_name: collection.getCollectionName(), collection_fields: collection.getCollectionFields() };
  }
}
