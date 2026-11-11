import { UserEntity } from '@domain/entities/user.entity';
import { UserChanges } from '@domain/types/user-changes.type';

export interface UserRepository {
  create(user: UserEntity): Promise<UserEntity>;
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  update(id: string, changes: UserChanges): Promise<UserEntity | null>;
  delete(id: string): Promise<void>;
}
