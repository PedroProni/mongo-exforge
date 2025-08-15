import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MONGO_INJECT_TOKEN } from '@domain/tokens/inject.token';
import { MongoRepository } from '@domain/repositories/mongo.repository';
import { EncryptionService } from '@application/services/encryption.service';
import { MongoEntity } from '@domain/entities/mongo.entity';
import { SelectURIsCommand } from '@application/commands/export-all.commands';

@Injectable()
export class SelectURIsUseCase {
  private readonly logger = new Logger(SelectURIsUseCase.name);

  constructor(
    @Inject(MONGO_INJECT_TOKEN) private readonly mongoRepository: MongoRepository,
    private readonly jwtService: JwtService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async execute(command: SelectURIsCommand, token: string): Promise<MongoEntity> {
    try {
      const { id } = this.jwtService.verify(token);
      const info = await this.mongoRepository.getInfo(command.uris, command.remember_me, id);
      const raw_uris = info.getUris();
      const encrypted_uris = raw_uris.map(uri => this.encryptionService.encrypt(uri));
      info.setUris(encrypted_uris);
      return info;
    } catch (error: any) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
