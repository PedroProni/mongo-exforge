import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { EnvConfigService } from '@common/env/services/env-config.service';
import { EncryptionService } from '@application/services/encryption.service';
import { ConnectionRepository } from '@domain/repositories/connection.repository';
import { MongoRepository } from '@domain/repositories/mongo.repository';
import { CONNECTION_INJECT_TOKEN, MONGO_INJECT_TOKEN } from '@domain/constants/inject.constant';
import { AuthenticatedUser } from '@domain/types/authenticated-user.type';
import { CreateJobInput } from '@domain/types/create-job-input.type';
import { QueryProps } from '@domain/types/query-props.type';
import { QueryInput } from '@domain/types/query-input.type';

@Injectable()
export class JobInputResolverService {
  constructor(
    @Inject(MONGO_INJECT_TOKEN) private readonly mongoRepository: MongoRepository,
    @Inject(CONNECTION_INJECT_TOKEN) private readonly connectionRepository: ConnectionRepository,
    private readonly encryptionService: EncryptionService,
    private readonly envConfigService: EnvConfigService,
  ) {}

  async resolve(user: AuthenticatedUser, input: Pick<CreateJobInput, 'query' | 'max_rows'>): Promise<QueryProps[]> {
    this.assertMaxRows(input.max_rows);
    const query = await this.resolveQuery(user, input.query);
    await this.assertSources(query);
    return query;
  }

  private assertMaxRows(max_rows: number): void {
    if (max_rows > this.envConfigService.getExportMaxRows()) throw new BadRequestException(`max_rows cannot exceed ${this.envConfigService.getExportMaxRows()}`);
  }

  private async resolveQuery(user: AuthenticatedUser, items: QueryInput[]): Promise<QueryProps[]> {
    const connections = new Map<string, string>();
    const query: QueryProps[] = [];
    for (const item of items) {
      if (Boolean(item.uri) === Boolean(item.connection_id)) throw new BadRequestException('Each filter needs exactly one of uri or connection_id');
      let uri = item.uri ? this.encryptionService.encrypt(item.uri) : '';
      if (item.connection_id) {
        if (!connections.has(item.connection_id)) {
          const connection = await this.connectionRepository.findOwned(user.id, item.connection_id);
          if (!connection) throw new BadRequestException('Connection not found');
          connections.set(item.connection_id, connection.getUri());
        }
        uri = connections.get(item.connection_id) as string;
      }
      query.push({ uri, ...(item.connection_id ? { connection_id: item.connection_id } : {}), collection: item.collection, field: item.field, operator: item.operator, value: item.value });
    }
    return query;
  }

  private async assertSources(query: QueryProps[]): Promise<void> {
    const uris = Array.from(new Set(query.map(item => item.uri)));
    for (const uri of uris) {
      try {
        await this.mongoRepository.assertAllowed(this.encryptionService.decrypt(uri));
      } catch (error) {
        throw new BadRequestException((error as Error).message);
      }
    }
  }
}
