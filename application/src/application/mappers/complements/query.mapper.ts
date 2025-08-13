import { QueryEntity } from '@domain/entities/complements/query.entity';
import { QueryDto } from '@shared/dtos/complements/query.dto';

export class ApplicationQueryMapper {
  static toEntity(dto: QueryDto): QueryEntity {
    return new QueryEntity({
      field: dto.field,
      operator: dto.operator,
      value: dto.value,
    });
  }
}
