import { ExportFormat, QueryOperator, SortDirection } from './api.types';

export type FilterDraft = { field: string; operator: QueryOperator; value: string };
export type JobDraft = {
  name: string;
  export_format: ExportFormat;
  source: 'saved' | 'uri';
  connection_id: string;
  uri: string;
  collection: string;
  filters: FilterDraft[];
  fields: string;
  sort_field: string;
  sort_direction: SortDirection;
  max_rows: string;
};
