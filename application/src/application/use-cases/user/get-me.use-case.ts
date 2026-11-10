import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserEntity } from '@domain/entities/user.entity';
import { UserRepository } from '@domain/repositories/user.repository';
import { USER_INJECT_TOKEN } from '@domain/tokens/inject.token';
import { AuthenticatedUser } from '@domain/types/authenticated-user.type';

@Injectable()
export class GetMeUseCase {
  constructor(@Inject(USER_INJECT_TOKEN) private readonly userRepository: UserRepository) {}

  async execute(user: AuthenticatedUser): Promise<UserEntity> {
    const found = await this.userRepository.findById(user.id);
    if (!found) throw new NotFoundException('User not found');
    return found;
  }
}
