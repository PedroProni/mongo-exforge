import { QueryEntity } from '@domain/entities/complements/query.entity';

export class DomainQueryMapper {
  static toPersistence(entity: QueryEntity): any {
    return {
      collection: entity.getCollection(),
      field: entity.getField(),
      operator: entity.getOperator(),
      value: entity.getValue(),
    };
  }

  static toDomain(data: any): QueryEntity {
    return new QueryEntity({
      uri: data.uri,
      collection: data.collection,
      field: data.field,
      operator: data.operator,
      value: data.value,
    });
  }
}
