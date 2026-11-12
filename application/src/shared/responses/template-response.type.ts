import { ExportFormat } from '@domain/enums/export-format.enum';
import { JobSort } from '@domain/types/job-sort.type';
import { QueryValue } from '@domain/types/query-value.type';

export type TemplateResponse = {
  id: string;
  name: string;
  export_format: ExportFormat;
  query: { connection_id: string; collection: string; field: string; operator: string; value: QueryValue }[];
  fields: string[];
  sort: JobSort;
  max_rows: number;
  created_at: Date;
  updated_at: Date;
};
