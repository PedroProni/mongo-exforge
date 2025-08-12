import { Inject, Injectable } from '@nestjs/common';
import { MONGO_INJECT_TOKEN } from '@domain/tokens/inject.token';
import { MongoRepository } from '@domain/repositories/mongo.repository';

@Injectable()
export class SelectURIsUseCase {
  constructor(@Inject(MONGO_INJECT_TOKEN) private readonly mongoRepository: MongoRepository) {}

  async execute(uris: string[]): Promise<void> {
    await this.mongoRepository.getInfo(uris);
  }
}
