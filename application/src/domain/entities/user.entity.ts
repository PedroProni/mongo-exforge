import { v4 as uuidv4 } from 'uuid';
import { UserTier } from '@domain/enums/all.enums';

export class UserEntity {
  private readonly _id: string;
  private tier: UserTier;
  private name: string;
  private surname: string;
  private email: string;
  private password: string;
  private created_at: Date;
  private updated_at: Date;

  constructor(props: { _id: string; tier: UserTier; name: string; surname: string; email: string; password: string; created_at: Date; updated_at: Date }) {
    this._id = props._id || uuidv4();
    this.tier = props.tier || UserTier.FREE;
    this.name = props.name;
    this.surname = props.surname;
    this.email = props.email;
    this.password = props.password;
    this.created_at = props.created_at || new Date();
    this.updated_at = props.updated_at || new Date();
  }

  // Getters
  getId(): string {
    return this._id;
  }

  getTier(): UserTier {
    return this.tier;
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
