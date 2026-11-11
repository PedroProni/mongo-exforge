import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { BCRYPT_ROUNDS, INVALID_CREDENTIALS_MESSAGE } from '@domain/constants/auth.constant';
import { UserRepository } from '@domain/repositories/user.repository';
import { USER_INJECT_TOKEN } from '@domain/constants/inject.constant';

@Injectable()
export class LoginUserUseCase {
  private dummy_hash?: Promise<string>;

  constructor(
    @Inject(USER_INJECT_TOKEN) private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(email: string, password: string): Promise<{ token: string }> {
    const user = await this.userRepository.findByEmail(email);
    const valid = await compare(password, user ? user.getPassword() : await this.getDummyHash());
    if (!user || !valid) throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    return { token: await this.jwtService.signAsync({ sub: user.getId(), email: user.getEmail() }) };
  }

  private getDummyHash(): Promise<string> {
    this.dummy_hash ??= hash('exforge-dummy-password', BCRYPT_ROUNDS);
    return this.dummy_hash;
  }
}
