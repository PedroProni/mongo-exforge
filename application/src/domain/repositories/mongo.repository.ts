import { CollectionEntity } from '@domain/entities/collection.entity';
import { ExportRow } from '@domain/types/export-row.type';
import { SourceStreamOptions } from '@domain/types/source-stream-options.type';

export interface MongoRepository {
  assertAllowed(uri: string): Promise<void>;
  inspect(uri: string): Promise<CollectionEntity[]>;
  stream(options: SourceStreamOptions): AsyncGenerator<ExportRow>;
}
