import { UserEntity } from '@domain/entities/user.entity';

export interface UserRepository {
  create(user: UserEntity): Promise<UserEntity>;
  find(page: number, limit: number, id?: string, email?: string): Promise<UserEntity[]>;
  update(user: UserEntity): Promise<UserEntity>;
  delete(id: string): Promise<void>;
}
