import { ExportFormat } from '@domain/enums/export-format.enum';
import { JobProps } from '@domain/types/job-props.type';

export type JobAggregate = {
  totals: { exports: number; completed: number; failed: number; active: number; rows_exported: number }[];
  formats: { _id: ExportFormat; count: number }[];
  series: { _id: string; count: number }[];
  recent: JobProps[];
};
