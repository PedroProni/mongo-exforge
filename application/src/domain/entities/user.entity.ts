import { randomUUID } from 'crypto';
import { NewUserProps } from '@domain/types/new-user-props.type';
import { UserProps } from '@domain/types/user-props.type';

export class UserEntity {
  private readonly _id: string;
  private readonly name: string;
  private readonly surname: string;
  private readonly email: string;
  private readonly password: string;
  private readonly created_at: Date;
  private readonly updated_at: Date;

  constructor(props: UserProps) {
    this._id = props._id;
    this.name = props.name;
    this.surname = props.surname;
    this.email = props.email;
    this.password = props.password;
    this.created_at = props.created_at;
    this.updated_at = props.updated_at;
  }

  static create(props: NewUserProps): UserEntity {
    const now = new Date();
    return new UserEntity({ ...props, _id: randomUUID(), email: props.email.trim().toLowerCase(), created_at: now, updated_at: now });
  }

  getId(): string {
    return this._id;
  }

  getName(): string {
    return this.name;
  }

  getSurname(): string {
    return this.surname;
  }

  getEmail(): string {
    return this.email;
  }

  getPassword(): string {
    return this.password;
  }

  getCreatedAt(): Date {
    return this.created_at;
  }

  getUpdatedAt(): Date {
    return this.updated_at;
  }
}
