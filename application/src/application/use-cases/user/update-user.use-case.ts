import { Inject, Injectable } from '@nestjs/common';
import { USER_INJECT_TOKEN } from '@domain/tokens/inject.token';
import { UpdateUserCommand } from '@application/commands/export-all.commands';
import { ApplicationUserMapper } from '@application/mappers/user.mapper';
import { UserRepository } from '@domain/repositories/user.repository';

@Injectable()
export class UpdateUserUseCase {
  constructor(@Inject(USER_INJECT_TOKEN) private readonly userRepository: UserRepository) {}

  async execute(command: UpdateUserCommand): Promise<void> {
    const user = ApplicationUserMapper.toEntity(command);
    await this.userRepository.update(user);
  }
}
