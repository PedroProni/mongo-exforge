import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginUserCommand } from '@application/commands/export-all.commands';
import { USER_INJECT_TOKEN } from '@domain/tokens/inject.token';
import { UserRepository } from '@domain/repositories/user.repository';

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(USER_INJECT_TOKEN) private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: LoginUserCommand): Promise<{ token: string }> {
    const user_array = await this.userRepository.find(1, 1, undefined, command.email);
    if (user_array.length === 0) throw new NotFoundException(`User with email '${command.email}' not found`);

    const is_password_valid = await compare(command.password, user_array[0].getPassword());
    if (!is_password_valid) throw new NotFoundException(`Invalid password`);

    const token = this.jwtService.sign({ id: user_array[0].getId(), email: user_array[0].getEmail() });
    return { token };
  }
}
