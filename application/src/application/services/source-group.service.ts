import { Injectable } from '@nestjs/common';
import { EncryptionService } from '@application/services/encryption.service';
import { QueryProps } from '@domain/types/query-props.type';
import { SourceGroup } from '@domain/types/source-group.type';

@Injectable()
export class SourceGroupService {
  constructor(private readonly encryptionService: EncryptionService) {}

  build(query: QueryProps[]): SourceGroup[] {
    const groups = new Map<string, SourceGroup>();
    for (const item of query) {
      const uri = this.encryptionService.decrypt(item.uri);
      const key = `${uri}\u0000${item.collection}`;
      const group = groups.get(key) ?? { uri, collection: item.collection, filters: [] };
      group.filters.push({ uri, collection: item.collection, field: item.field, operator: item.operator, value: item.value });
      groups.set(key, group);
    }
    return Array.from(groups.values());
  }
}
