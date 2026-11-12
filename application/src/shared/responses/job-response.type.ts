import { ExportFormat } from '@domain/enums/export-format.enum';
import { ExportStatus } from '@domain/enums/export-status.enum';
import { JobSort } from '@domain/types/job-sort.type';
import { QueryValue } from '@domain/types/query-value.type';

export type JobResponse = {
  id: string;
  name: string;
  status: ExportStatus;
  export_format: ExportFormat;
  rows_exported: number;
  attempts: number;
  max_rows: number;
  error: string;
  file_available: boolean;
  file_size: number;
  query: { connection_id: string; collection: string; field: string; operator: string; value: QueryValue }[];
  fields: string[];
  sort: JobSort;
  created_at: Date;
  started_at: Date | null;
  finished_at: Date | null;
};
