import { JobEntity } from '@domain/entities/job.entity';
import { ExportFormat } from '@domain/enums/export-format.enum';

export type DashboardSummary = {
  window_days: number;
  totals: { exports: number; completed: number; failed: number; active: number; rows_exported: number; success_rate: number | null };
  by_format: Record<ExportFormat, number>;
  series: { date: string; count: number }[];
  recent: JobEntity[];
};
