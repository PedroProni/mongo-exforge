import { BadRequestException, Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { EnvConfigService } from '@common/env/services/env-config.service';
import { EncryptionService } from '@application/services/encryption.service';
import { JobEntity } from '@domain/entities/job.entity';
import { JobQueuePort } from '@domain/ports/job-queue.port';
import { ConnectionRepository } from '@domain/repositories/connection.repository';
import { JobRepository } from '@domain/repositories/job.repository';
import { MongoRepository } from '@domain/repositories/mongo.repository';
import { CONNECTION_INJECT_TOKEN, JOB_INJECT_TOKEN, JOB_QUEUE_INJECT_TOKEN, MONGO_INJECT_TOKEN } from '@domain/constants/inject.constant';
import { AuthenticatedUser } from '@domain/types/authenticated-user.type';
import { CreateJobInput } from '@domain/types/create-job-input.type';
import { QueryProps } from '@domain/types/query-props.type';

@Injectable()
export class CreateJobUseCase {
  constructor(
    @Inject(JOB_INJECT_TOKEN) private readonly jobRepository: JobRepository,
    @Inject(MONGO_INJECT_TOKEN) private readonly mongoRepository: MongoRepository,
    @Inject(JOB_QUEUE_INJECT_TOKEN) private readonly jobQueue: JobQueuePort,
    @Inject(CONNECTION_INJECT_TOKEN) private readonly connectionRepository: ConnectionRepository,
    private readonly encryptionService: EncryptionService,
    private readonly envConfigService: EnvConfigService,
  ) {}

  async execute(user: AuthenticatedUser, input: CreateJobInput): Promise<JobEntity> {
    this.assertMaxRows(input.max_rows);
    const query = await this.resolveQuery(user, input);
    await this.assertSources(query);

    const job = JobEntity.create({
      user_id: user.id,
      name: input.name.trim(),
      export_format: input.export_format,
      query,
      fields: input.fields,
      sort: input.sort,
      max_rows: input.max_rows,
    });
    await this.jobRepository.create(job);

    try {
      await this.jobQueue.enqueue(job.getId());
    } catch {
      await this.jobRepository.markFailed(job.getId(), 'Could not enqueue the export');
      throw new ServiceUnavailableException('Could not enqueue the export');
    }
    return job;
  }

  private assertMaxRows(max_rows: number): void {
    if (max_rows > this.envConfigService.getExportMaxRows()) throw new BadRequestException(`max_rows cannot exceed ${this.envConfigService.getExportMaxRows()}`);
  }

  private async resolveQuery(user: AuthenticatedUser, input: CreateJobInput): Promise<QueryProps[]> {
    const connections = new Map<string, string>();
    const query: QueryProps[] = [];
    for (const item of input.query) {
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
      query.push({ uri, collection: item.collection, field: item.field, operator: item.operator, value: item.value });
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
