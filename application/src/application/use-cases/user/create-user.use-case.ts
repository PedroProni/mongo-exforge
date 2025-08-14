import { Inject, Injectable } from '@nestjs/common';
import { hash, genSalt } from 'bcrypt';
import { USER_INJECT_TOKEN } from '@domain/tokens/inject.token';
import { CreateUserCommand } from '@application/commands/export-all.commands';
import { ApplicationUserMapper } from '@application/mappers/user.mapper';
import { UserRepository } from '@domain/repositories/user.repository';

@Injectable()
export class CreateUserUseCase {
  constructor(@Inject(USER_INJECT_TOKEN) private readonly userRepository: UserRepository) {}

  async execute(command: CreateUserCommand): Promise<void> {
    const hashed_password = await hash(command.password, await genSalt(10));
    const user = ApplicationUserMapper.toEntity(command);
    user.setPassword(hashed_password);
    await this.userRepository.create(user);
  }
}
