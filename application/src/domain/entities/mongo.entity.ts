import { CollectionEntity } from '@domain/entities/complements/collection.entity';

export class MongoEntity {
  private uris: string[];
  private collections: CollectionEntity[];

  constructor(props: { uris: string[]; collections: CollectionEntity[] }) {
    this.uris = props.uris;
    this.collections = props.collections;
  }

  public getUris(): string[] {
    return this.uris;
  }

  public getCollections(): CollectionEntity[] {
    return this.collections;
  }
}
