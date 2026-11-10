import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '@domain/repositories/user.repository';
import { USER_INJECT_TOKEN } from '@domain/constants/inject.constant';
import { AuthenticatedUser } from '@domain/types/authenticated-user.type';

@Injectable()
export class DeleteMeUseCase {
  constructor(@Inject(USER_INJECT_TOKEN) private readonly userRepository: UserRepository) {}

  execute(user: AuthenticatedUser): Promise<void> {
    return this.userRepository.delete(user.id);
  }
}
