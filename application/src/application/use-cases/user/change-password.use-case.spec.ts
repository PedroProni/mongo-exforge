import { BadRequestException, NotFoundException } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { ChangePasswordUseCase } from '@application/use-cases/user/change-password.use-case';
import { UserRepository } from '@domain/repositories/user.repository';

describe('ChangePasswordUseCase', () => {
  const user = { id: 'user-1', email: 'a@b.dev' };

  async function build(found = true) {
    const stored = await hash('current-password', 4);
    const repository = { findById: jest.fn().mockResolvedValue(found ? { getPassword: () => stored } : null), update: jest.fn() };
    return { repository, useCase: new ChangePasswordUseCase(repository as unknown as UserRepository) };
  }

  it('stores a hash of the new password when the current one matches', async () => {
    const { useCase, repository } = await build();
    await useCase.execute(user, 'current-password', 'brand-new-password');
    const patch = repository.update.mock.calls[0][1] as { password: string };
    expect(patch.password).not.toBe('brand-new-password');
    expect(await compare('brand-new-password', patch.password)).toBe(true);
  });

  it('refuses a wrong current password without writing', async () => {
    const { useCase, repository } = await build();
    await expect(useCase.execute(user, 'wrong', 'brand-new-password')).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('answers 404 for a missing user', async () => {
    const { useCase } = await build(false);
    await expect(useCase.execute(user, 'x', 'y')).rejects.toBeInstanceOf(NotFoundException);
  });
});
