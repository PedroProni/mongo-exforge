import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { hash } from 'bcrypt';
import { BCRYPT_ROUNDS } from '@domain/constants/auth.constant';
import { UserEntity } from '@domain/entities/user.entity';
import { UserRepository } from '@domain/repositories/user.repository';
import { USER_INJECT_TOKEN } from '@domain/constants/inject.constant';
import { AuthenticatedUser } from '@domain/types/authenticated-user.type';
import { UserChanges } from '@domain/types/user-changes.type';

@Injectable()
export class UpdateMeUseCase {
  constructor(@Inject(USER_INJECT_TOKEN) private readonly userRepository: UserRepository) {}

  async execute(user: AuthenticatedUser, changes: UserChanges): Promise<UserEntity> {
    const prepared: UserChanges = { ...changes, password: changes.password ? await hash(changes.password, BCRYPT_ROUNDS) : undefined };
    const updated = await this.userRepository.update(user.id, prepared);
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }
}
