import { ExportFormat } from '@domain/enums/export-format.enum';
import { JobSort } from '@domain/types/job-sort.type';
import { QueryProps } from '@domain/types/query-props.type';

export type NewTemplateProps = {
  user_id: string;
  name: string;
  export_format: ExportFormat;
  query: QueryProps[];
  fields: string[];
  sort: JobSort;
  max_rows: number;
};
