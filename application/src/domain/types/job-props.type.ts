import { ExportFormat } from '@domain/enums/export-format.enum';
import { ExportStatus } from '@domain/enums/export-status.enum';
import { JobSort } from '@domain/types/job-sort.type';
import { QueryProps } from '@domain/types/query-props.type';

export type JobProps = {
  _id: string;
  user_id: string;
  name: string;
  status: ExportStatus;
  export_format: ExportFormat;
  query: QueryProps[];
  fields: string[];
  sort: JobSort;
  file_key: string;
  rows_exported: number;
  attempts: number;
  error: string;
  started_at: Date | null;
  finished_at: Date | null;
  created_at: Date;
  updated_at: Date;
};
