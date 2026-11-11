import { CollectionInfo } from '@domain/types/collection-info.type';

export class CollectionEntity {
  private readonly db_name: string;
  private readonly collection_name: string;
  private readonly collection_fields: string[];

  constructor(props: CollectionInfo) {
    this.db_name = props.db_name;
    this.collection_name = props.collection_name;
    this.collection_fields = props.collection_fields;
  }

  getDbName(): string {
    return this.db_name;
  }

  getCollectionName(): string {
    return this.collection_name;
  }

  getCollectionFields(): string[] {
    return this.collection_fields;
  }
}
