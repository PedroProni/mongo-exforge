import { Inject, Injectable } from '@nestjs/common';
import { CONNECTION_INJECT_TOKEN } from '@domain/constants/inject.constant';
import { ConnectionEntity } from '@domain/entities/connection.entity';
import { ConnectionRepository } from '@domain/repositories/connection.repository';
import { AuthenticatedUser } from '@domain/types/authenticated-user.type';

@Injectable()
export class ListConnectionsUseCase {
  constructor(@Inject(CONNECTION_INJECT_TOKEN) private readonly connectionRepository: ConnectionRepository) {}

  execute(user: AuthenticatedUser): Promise<ConnectionEntity[]> {
    return this.connectionRepository.listOwned(user.id);
  }
}
