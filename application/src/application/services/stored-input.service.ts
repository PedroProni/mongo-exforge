import { Injectable } from '@nestjs/common';
import { EncryptionService } from '@application/services/encryption.service';
import { CreateJobInput } from '@domain/types/create-job-input.type';
import { StoredJobSource } from '@domain/types/stored-job-source.type';

@Injectable()
export class StoredInputService {
  constructor(private readonly encryptionService: EncryptionService) {}

  toCreateJobInput(name: string, source: StoredJobSource): CreateJobInput {
    return {
      name,
      export_format: source.export_format,
      query: source.query.map(item => ({
        ...(item.connection_id ? { connection_id: item.connection_id } : { uri: this.encryptionService.decrypt(item.uri) }),
        collection: item.collection,
        field: item.field,
        operator: item.operator,
        value: item.value,
      })),
      fields: source.fields,
      sort: source.sort,
      max_rows: source.max_rows,
    };
  }
}
