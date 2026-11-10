import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '@infrastructure/auth/jwt-auth.guard';
import { UserRepository } from '@domain/repositories/user.repository';

describe('JwtAuthGuard', () => {
  function build(options: { is_public?: boolean; payload?: { sub?: string } | Error; user_exists?: boolean } = {}) {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(options.is_public ?? false) };
    const jwt = {
      verifyAsync: jest.fn().mockImplementation(() => (options.payload instanceof Error ? Promise.reject(options.payload) : Promise.resolve(options.payload ?? { sub: 'user-1' }))),
    };
    const repository = { findById: jest.fn().mockResolvedValue(options.user_exists === false ? null : { getId: () => 'user-1', getEmail: () => 'a@test.dev' }) };
    const guard = new JwtAuthGuard(reflector as unknown as Reflector, jwt as unknown as JwtService, repository as unknown as UserRepository);
    return { guard, jwt, repository };
  }

  function contextFor(authorization?: string) {
    const request: { headers: Record<string, string | undefined>; user?: unknown } = { headers: { authorization } };
    const context = { getHandler: () => undefined, getClass: () => undefined, switchToHttp: () => ({ getRequest: () => request }) };
    return { context: context as unknown as ExecutionContext, request };
  }

  it('lets public routes through without looking at the token', async () => {
    const { guard, jwt } = build({ is_public: true });
    expect(await guard.canActivate(contextFor().context)).toBe(true);
    expect(jwt.verifyAsync).not.toHaveBeenCalled();
  });

  it('attaches the user for a valid bearer token', async () => {
    const { guard } = build();
    const { context, request } = contextFor('Bearer good.token.value');
    expect(await guard.canActivate(context)).toBe(true);
    expect(request.user).toEqual({ id: 'user-1', email: 'a@test.dev' });
  });

  it.each([undefined, '', 'Bearer', 'Basic abc', 'Token abc', 'good.token.value'])('refuses the header %p', async header => {
    const { guard } = build();
    await expect(guard.canActivate(contextFor(header).context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refuses a token that fails verification with 401', async () => {
    const { guard } = build({ payload: new Error('jwt expired') });
    await expect(guard.canActivate(contextFor('Bearer bad').context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refuses a token without subject', async () => {
    const { guard } = build({ payload: {} });
    await expect(guard.canActivate(contextFor('Bearer x').context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refuses a valid token whose user no longer exists', async () => {
    const { guard } = build({ user_exists: false });
    await expect(guard.canActivate(contextFor('Bearer x').context)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
