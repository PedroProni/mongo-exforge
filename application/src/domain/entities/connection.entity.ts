import { randomUUID } from 'crypto';
import { ConnectionProps } from '@domain/types/connection-props.type';
import { NewConnectionProps } from '@domain/types/new-connection-props.type';

export class ConnectionEntity {
  private readonly _id: string;
  private readonly user_id: string;
  private readonly name: string;
  private readonly uri: string;
  private readonly uri_masked: string;
  private readonly created_at: Date;
  private readonly updated_at: Date;

  constructor(props: ConnectionProps) {
    this._id = props._id;
    this.user_id = props.user_id;
    this.name = props.name;
    this.uri = props.uri;
    this.uri_masked = props.uri_masked;
    this.created_at = props.created_at;
    this.updated_at = props.updated_at;
  }

  static create(props: NewConnectionProps): ConnectionEntity {
    const now = new Date();
    return new ConnectionEntity({ ...props, _id: randomUUID(), created_at: now, updated_at: now });
  }

  getId(): string {
    return this._id;
  }

  getUserId(): string {
    return this.user_id;
  }

  getName(): string {
    return this.name;
  }

  getUri(): string {
    return this.uri;
  }

  getUriMasked(): string {
    return this.uri_masked;
  }

  getCreatedAt(): Date {
    return this.created_at;
  }

  getUpdatedAt(): Date {
    return this.updated_at;
  }
}
