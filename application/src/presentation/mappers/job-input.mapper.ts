import { SortDirection } from '@domain/enums/sort-direction.enum';
import { CreateJobInput } from '@domain/types/create-job-input.type';
import { PreviewInput } from '@domain/types/preview-input.type';
import { JobSort } from '@domain/types/job-sort.type';
import { CreateJobDto } from '@shared/dtos/job/create-job.dto';
import { PreviewDto } from '@shared/dtos/job/preview.dto';

export class JobInputMapper {
  static toPreviewInput(dto: PreviewDto): PreviewInput {
    return {
      query: dto.query.map(item => ({ uri: item.uri, connection_id: item.connection_id, collection: item.collection, field: item.field, operator: item.operator, value: item.value })),
      fields: dto.fields ?? [],
      sort: JobInputMapper.toSort(dto.sort),
    };
  }

  private static toSort(input?: Record<string, SortDirection>): JobSort {
    return Object.fromEntries(Object.entries(input ?? {}).map(([field, direction]) => [field, direction === SortDirection.ASC ? 1 : -1]));
  }

  static toCreateJobInput(dto: CreateJobDto): CreateJobInput {
    return {
      name: dto.name,
      export_format: dto.export_format,
      query: dto.query.map(item => ({ uri: item.uri, connection_id: item.connection_id, collection: item.collection, field: item.field, operator: item.operator, value: item.value })),
      fields: dto.fields ?? [],
      sort: JobInputMapper.toSort(dto.sort),
      max_rows: dto.max_rows ?? 0,
    };
  }
}
