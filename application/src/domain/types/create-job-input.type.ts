import { ExportFormat } from '@domain/enums/export-format.enum';
import { JobSort } from '@domain/types/job-sort.type';
import { QueryInput } from '@domain/types/query-input.type';

export type CreateJobInput = {
  name: string;
  export_format: ExportFormat;
  query: QueryInput[];
  fields: string[];
  sort: JobSort;
  max_rows: number;
};
