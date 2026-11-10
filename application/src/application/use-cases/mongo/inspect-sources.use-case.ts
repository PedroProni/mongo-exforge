import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { CollectionEntity } from '@domain/entities/collection.entity';
import { MongoRepository } from '@domain/repositories/mongo.repository';
import { MONGO_INJECT_TOKEN } from '@domain/tokens/inject.token';

@Injectable()
export class InspectSourcesUseCase {
  private readonly logger = new Logger(InspectSourcesUseCase.name);

  constructor(@Inject(MONGO_INJECT_TOKEN) private readonly mongoRepository: MongoRepository) {}

  async execute(uris: string[]): Promise<CollectionEntity[]> {
    const unique = Array.from(new Set(uris));
    for (const uri of unique) {
      try {
        await this.mongoRepository.assertAllowed(uri);
      } catch (error) {
        throw new BadRequestException((error as Error).message);
      }
    }

    const result: CollectionEntity[] = [];
    for (const uri of unique) {
      try {
        result.push(...(await this.mongoRepository.inspect(uri)));
      } catch (error) {
        this.logger.warn(`Inspect failed: ${(error as Error).message}`);
        throw new BadRequestException('Could not inspect the MongoDB source');
      }
    }
    return result;
  }
}
