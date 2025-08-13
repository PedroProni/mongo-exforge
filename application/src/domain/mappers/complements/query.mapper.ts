import { QueryEntity } from '@domain/entities/complements/query.entity';

export class DomainQueryMapper {
  static toPersistence(entity: QueryEntity): any {
    return {
      field: entity.getField(),
      operator: entity.getOperator(),
      value: entity.getValue(),
    };
  }

  static toDomain(data: any): QueryEntity {
    return new QueryEntity({
      field: data.field,
      operator: data.operator,
      value: data.value,
    });
  }
}
