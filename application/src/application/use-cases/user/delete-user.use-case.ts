import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '@domain/repositories/user.repository';
import { USER_INJECT_TOKEN } from '@domain/tokens/inject.token';

@Injectable()
export class DeleteUserUseCase {
  constructor(@Inject(USER_INJECT_TOKEN) private readonly userRepository: UserRepository) {}

  async execute(id: string) {
    return this.userRepository.delete(id);
  }
}
