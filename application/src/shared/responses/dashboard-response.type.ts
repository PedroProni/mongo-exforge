import { ExportFormat } from '@domain/enums/export-format.enum';
import { JobResponse } from '@shared/responses/job-response.type';

export type DashboardResponse = {
  window_days: number;
  totals: { exports: number; completed: number; failed: number; active: number; rows_exported: number; success_rate: number | null };
  by_format: Record<ExportFormat, number>;
  series: { date: string; count: number }[];
  recent: JobResponse[];
};
