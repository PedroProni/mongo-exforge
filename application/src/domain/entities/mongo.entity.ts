import { CollectionEntity } from '@domain/entities/complements/collection.entity';

export class MongoEntity {
  private user_id: string;
  private remember_me: boolean;
  private uris: string[];
  private collections: CollectionEntity[];

  constructor(props: { user_id: string; remember_me: boolean; uris: string[]; collections: CollectionEntity[] }) {
    this.user_id = props.user_id;
    this.remember_me = props.remember_me;
    this.uris = props.uris;
    this.collections = props.collections;
  }

  // Getters
  public getUserId(): string {
    return this.user_id;
  }

  public getRememberMe(): boolean {
    return this.remember_me;
  }

  public getUris(): string[] {
    return this.uris;
  }

  public getCollections(): CollectionEntity[] {
    return this.collections;
  }

  // Setters
  public setUris(uris: string[]): void {
    this.uris = uris;
  }

  public setCollections(collections: CollectionEntity[]): void {
    this.collections = collections;
  }
}
