import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcrypt';
import { BCRYPT_ROUNDS } from '@domain/constants/auth.constant';
import { UserEntity } from '@domain/entities/user.entity';
import { UserRepository } from '@domain/repositories/user.repository';
import { USER_INJECT_TOKEN } from '@domain/constants/inject.constant';
import { NewUserProps } from '@domain/types/new-user-props.type';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_INJECT_TOKEN) private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: NewUserProps): Promise<{ token: string }> {
    const user = UserEntity.create({ ...input, password: await hash(input.password, BCRYPT_ROUNDS) });
    await this.userRepository.create(user);
    return { token: await this.jwtService.signAsync({ sub: user.getId(), email: user.getEmail() }) };
  }
}
