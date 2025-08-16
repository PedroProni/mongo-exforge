import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MONGO_INJECT_TOKEN } from '@domain/tokens/inject.token';
import { MongoRepository } from '@domain/repositories/mongo.repository';
import { EncryptionService } from '@application/services/encryption.service';
import { SelectURIsCommand } from '@application/commands/export-all.commands';
import { IConnectionInfo } from '@shared/interfaces/example.interface';

@Injectable()
export class SelectURIsUseCase {
  private readonly logger = new Logger(SelectURIsUseCase.name);

  constructor(
    @Inject(MONGO_INJECT_TOKEN) private readonly mongoRepository: MongoRepository,
    private readonly jwtService: JwtService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async execute(command: SelectURIsCommand, token: string): Promise<IConnectionInfo> {
    try {
      const { id } = this.jwtService.verify(token);
      if (command.remember_me) command.uris.map(async uri => await this.mongoRepository.create(id, uri, this.encryptionService.encrypt(uri)));
      const info = await this.mongoRepository.getInfo(command.uris, id);
      const raw_uris = info.uris;
      const encrypted_uris = raw_uris.map(uri => this.encryptionService.encrypt(uri));
      info.uris = encrypted_uris;
      return info;
    } catch (error: any) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
