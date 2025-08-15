import { Inject, Injectable } from '@nestjs/common';
import { hash, genSalt } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { USER_INJECT_TOKEN } from '@domain/tokens/inject.token';
import { CreateUserCommand } from '@application/commands/export-all.commands';
import { ApplicationUserMapper } from '@application/mappers/user.mapper';
import { UserRepository } from '@domain/repositories/user.repository';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_INJECT_TOKEN) private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: CreateUserCommand): Promise<{ token: string }> {
    const hashed_password = await hash(command.password, await genSalt(10));
    const user = ApplicationUserMapper.toEntity(command);
    user.setPassword(hashed_password);
    await this.userRepository.create(user);

    const token = this.jwtService.sign({ id: user.getId(), email: user.getEmail() });
    return { token };
  }
}
