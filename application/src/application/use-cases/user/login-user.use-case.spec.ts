import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcrypt';
import { LoginUserUseCase } from '@application/use-cases/user/login-user.use-case';
import { UserRepository } from '@domain/repositories/user.repository';

describe('LoginUserUseCase', () => {
  const signAsync = jest.fn().mockResolvedValue('signed-token');

  async function build(found: boolean) {
    const user = { getId: () => 'user-1', getEmail: () => 'a@test.dev', getPassword: () => 'stored' };
    user.getPassword = () => hashed;
    const repository = { findByEmail: jest.fn().mockResolvedValue(found ? user : null) };
    return new LoginUserUseCase(repository as unknown as UserRepository, { signAsync } as unknown as JwtService);
  }

  let hashed: string;

  beforeAll(async () => {
    hashed = await hash('right-password', 4);
  });

  it('signs a token with the user id as subject', async () => {
    const useCase = await build(true);
    expect(await useCase.execute('a@test.dev', 'right-password')).toEqual({ token: 'signed-token' });
    expect(signAsync).toHaveBeenCalledWith({ sub: 'user-1', email: 'a@test.dev' });
  });

  it('gives the same error for a wrong password and an unknown email', async () => {
    const wrong = await (await build(true)).execute('a@test.dev', 'nope-nope-nope').catch((error: UnauthorizedException) => error);
    const unknown = await (await build(false)).execute('x@test.dev', 'nope-nope-nope').catch((error: UnauthorizedException) => error);
    expect(wrong).toBeInstanceOf(UnauthorizedException);
    expect(unknown).toBeInstanceOf(UnauthorizedException);
    expect((wrong as UnauthorizedException).message).toBe((unknown as UnauthorizedException).message);
  });
});
