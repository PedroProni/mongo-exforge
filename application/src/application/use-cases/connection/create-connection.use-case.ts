import { BadRequestException, ConflictException, Inject, Injectable } from '@nestjs/common';
import { EncryptionService } from '@application/services/encryption.service';
import { UriMaskHelper } from '@common/helpers/functions/uri-mask.helper';
import { MAX_CONNECTIONS_PER_USER } from '@domain/constants/connection.constant';
import { CONNECTION_INJECT_TOKEN, MONGO_INJECT_TOKEN } from '@domain/constants/inject.constant';
import { ConnectionEntity } from '@domain/entities/connection.entity';
import { ConnectionRepository } from '@domain/repositories/connection.repository';
import { MongoRepository } from '@domain/repositories/mongo.repository';
import { AuthenticatedUser } from '@domain/types/authenticated-user.type';

@Injectable()
export class CreateConnectionUseCase {
  constructor(
    @Inject(CONNECTION_INJECT_TOKEN) private readonly connectionRepository: ConnectionRepository,
    @Inject(MONGO_INJECT_TOKEN) private readonly mongoRepository: MongoRepository,
    private readonly encryptionService: EncryptionService,
  ) {}

  async execute(user: AuthenticatedUser, input: { name: string; uri: string }): Promise<ConnectionEntity> {
    try {
      await this.mongoRepository.assertAllowed(input.uri);
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
    if ((await this.connectionRepository.countOwned(user.id)) >= MAX_CONNECTIONS_PER_USER) throw new ConflictException(`You can save up to ${MAX_CONNECTIONS_PER_USER} connections`);
    const connection = ConnectionEntity.create({ user_id: user.id, name: input.name.trim(), uri: this.encryptionService.encrypt(input.uri), uri_masked: UriMaskHelper.mask(input.uri) });
    return this.connectionRepository.create(connection);
  }
}
