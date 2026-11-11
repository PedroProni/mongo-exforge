import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CONNECTION_INJECT_TOKEN } from '@domain/constants/inject.constant';
import { ConnectionRepository } from '@domain/repositories/connection.repository';
import { AuthenticatedUser } from '@domain/types/authenticated-user.type';

@Injectable()
export class DeleteConnectionUseCase {
  constructor(@Inject(CONNECTION_INJECT_TOKEN) private readonly connectionRepository: ConnectionRepository) {}

  async execute(user: AuthenticatedUser, id: string): Promise<void> {
    if (!(await this.connectionRepository.deleteOwned(user.id, id))) throw new NotFoundException('Connection not found');
  }
}
