import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '@domain/repositories/user.repository';
import { USER_INJECT_TOKEN } from '@domain/tokens/inject.token';

@Injectable()
export class FindUsersUseCase {
  constructor(@Inject(USER_INJECT_TOKEN) private readonly userRepository: UserRepository) {}

  async execute(page: number, limit: number, id: string, email: string) {
    return this.userRepository.find(page, limit, id, email);
  }
}
