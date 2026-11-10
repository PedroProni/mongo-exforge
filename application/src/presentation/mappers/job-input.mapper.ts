import { SortDirection } from '@domain/enums/sort-direction.enum';
import { CreateJobInput } from '@domain/types/create-job-input.type';
import { JobSort } from '@domain/types/job-sort.type';
import { CreateJobDto } from '@shared/dtos/job/create-job.dto';

export class JobInputMapper {
  static toCreateJobInput(dto: CreateJobDto): CreateJobInput {
    const sort: JobSort = Object.fromEntries(Object.entries(dto.sort ?? {}).map(([field, direction]) => [field, direction === SortDirection.ASC ? 1 : -1]));
    return {
      name: dto.name,
      export_format: dto.export_format,
      query: dto.query.map(item => ({ uri: item.uri, connection_id: item.connection_id, collection: item.collection, field: item.field, operator: item.operator, value: item.value })),
      fields: dto.fields ?? [],
      sort,
      max_rows: dto.max_rows ?? 0,
    };
  }
}
