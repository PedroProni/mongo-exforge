import { EXPORT_FORMATS, QUERY_OPERATORS, SORT_DIRECTIONS } from '../constants/app.constants';

export type ExportFormat = (typeof EXPORT_FORMATS)[number];
export type QueryOperator = (typeof QUERY_OPERATORS)[number];
export type SortDirection = (typeof SORT_DIRECTIONS)[number];
export type JobStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'expired';
export type QueryValue = string | number | boolean | null | Array<string | number | boolean>;

export type QueryItem = { uri?: string; connection_id?: string; collection: string; field: string; operator: QueryOperator; value: QueryValue };

export type Job = {
  id: string;
  name: string;
  status: JobStatus;
  export_format: ExportFormat;
  rows_exported: number;
  attempts: number;
  max_rows: number | null;
  error: string | null;
  file_available: boolean;
  query: QueryItem[];
  fields: string[];
  sort: Record<string, SortDirection>;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
};

export type Page<T> = { items: T[]; total: number; page: number; limit: number };
export type User = { id: string; name: string; surname: string; email: string; created_at: string };
export type Connection = { id: string; name: string; uri_masked: string; created_at: string };
export type CollectionInfo = { db_name: string; collection_name: string; collection_fields: string[] };
export type CreateJobInput = { name: string; export_format: ExportFormat; query: QueryItem[]; fields?: string[]; max_rows?: number; sort?: Record<string, SortDirection> };
export type RegisterInput = { name: string; surname: string; email: string; password: string };
export type TokenResponse = { token: string };
