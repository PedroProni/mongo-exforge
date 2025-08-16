import { CollectionEntity } from '@domain/entities/complements/collection.entity';

export class MongoEntity {
  private user_id: string;
  private remember_me: boolean;
  private uri: string;
  private collections: CollectionEntity[];

  constructor(props: { user_id: string; remember_me: boolean; uri: string; collections: CollectionEntity[] }) {
    this.user_id = props.user_id;
    this.remember_me = props.remember_me;
    this.uri = props.uri;
    this.collections = props.collections;
  }

  // Getters
  public getUserId(): string {
    return this.user_id;
  }

  public getRememberMe(): boolean {
    return this.remember_me;
  }

  public getUri(): string {
    return this.uri;
  }

  public getCollections(): CollectionEntity[] {
    return this.collections;
  }

  // Setters
  public setUri(uri: string): void {
    this.uri = uri;
  }

  public setCollections(collections: CollectionEntity[]): void {
    this.collections = collections;
  }
}
