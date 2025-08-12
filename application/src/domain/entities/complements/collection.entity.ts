export class CollectionEntity {
  private db_name: string;
  private collection_name: string;
  private collection_fields: string[];

  constructor(props: { db_name: string; collection_name: string; collection_fields: string[] }) {
    this.db_name = props.db_name;
    this.collection_name = props.collection_name;
    this.collection_fields = props.collection_fields;
  }

  // Getters
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
