import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { BCRYPT_ROUNDS } from '@domain/constants/auth.constant';
import { USER_INJECT_TOKEN } from '@domain/constants/inject.constant';
import { UserRepository } from '@domain/repositories/user.repository';
import { AuthenticatedUser } from '@domain/types/authenticated-user.type';

@Injectable()
export class ChangePasswordUseCase {
  constructor(@Inject(USER_INJECT_TOKEN) private readonly userRepository: UserRepository) {}

  async execute(user: AuthenticatedUser, current_password: string, new_password: string): Promise<void> {
    const found = await this.userRepository.findById(user.id);
    if (!found) throw new NotFoundException('User not found');
    if (!(await compare(current_password, found.getPassword()))) throw new BadRequestException('Current password is incorrect');
    await this.userRepository.update(user.id, { password: await hash(new_password, BCRYPT_ROUNDS) });
  }
}
