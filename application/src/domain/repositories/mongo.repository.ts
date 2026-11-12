import { CollectionEntity } from '@domain/entities/collection.entity';
import { ExportRow } from '@domain/types/export-row.type';
import { PreviewOptions } from '@domain/types/preview-options.type';
import { PreviewResult } from '@domain/types/preview-result.type';
import { SourceStreamOptions } from '@domain/types/source-stream-options.type';

export interface MongoRepository {
  assertAllowed(uri: string): Promise<void>;
  inspect(uri: string): Promise<CollectionEntity[]>;
  preview(options: PreviewOptions): Promise<PreviewResult>;
  stream(options: SourceStreamOptions): AsyncGenerator<ExportRow>;
}
