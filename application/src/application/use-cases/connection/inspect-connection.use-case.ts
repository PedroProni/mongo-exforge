import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EncryptionService } from '@application/services/encryption.service';
import { InspectSourcesUseCase } from '@application/use-cases/mongo/inspect-sources.use-case';
import { CONNECTION_INJECT_TOKEN } from '@domain/constants/inject.constant';
import { CollectionEntity } from '@domain/entities/collection.entity';
import { ConnectionRepository } from '@domain/repositories/connection.repository';
import { AuthenticatedUser } from '@domain/types/authenticated-user.type';

@Injectable()
export class InspectConnectionUseCase {
  constructor(
    @Inject(CONNECTION_INJECT_TOKEN) private readonly connectionRepository: ConnectionRepository,
    private readonly encryptionService: EncryptionService,
    private readonly inspectSourcesUseCase: InspectSourcesUseCase,
  ) {}

  async execute(user: AuthenticatedUser, id: string): Promise<CollectionEntity[]> {
    const connection = await this.connectionRepository.findOwned(user.id, id);
    if (!connection) throw new NotFoundException('Connection not found');
    return this.inspectSourcesUseCase.execute([this.encryptionService.decrypt(connection.getUri())]);
  }
}
