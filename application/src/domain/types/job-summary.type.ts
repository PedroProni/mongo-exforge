import { JobEntity } from '@domain/entities/job.entity';
import { ExportFormat } from '@domain/enums/export-format.enum';

export type JobSummary = {
  exports: number;
  completed: number;
  failed: number;
  active: number;
  rows_exported: number;
  by_format: Record<ExportFormat, number>;
  series: { date: string; count: number }[];
  recent: JobEntity[];
};
