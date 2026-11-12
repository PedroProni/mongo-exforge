import { Inject, Injectable } from '@nestjs/common';
import { JobRepository } from '@domain/repositories/job.repository';
import { DASHBOARD_SERIES_DAYS, DASHBOARD_WINDOW_DAYS, MILLISECONDS_PER_DAY } from '@domain/constants/dashboard.constant';
import { JOB_INJECT_TOKEN } from '@domain/constants/inject.constant';
import { AuthenticatedUser } from '@domain/types/authenticated-user.type';
import { DashboardSummary } from '@domain/types/dashboard-summary.type';

@Injectable()
export class GetDashboardUseCase {
  constructor(@Inject(JOB_INJECT_TOKEN) private readonly jobRepository: JobRepository) {}

  async execute(user: AuthenticatedUser, now: Date = new Date()): Promise<DashboardSummary> {
    const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const series_since = new Date(today - (DASHBOARD_SERIES_DAYS - 1) * MILLISECONDS_PER_DAY);
    const since = new Date(today - (DASHBOARD_WINDOW_DAYS - 1) * MILLISECONDS_PER_DAY);
    const summary = await this.jobRepository.summarizeOwned(user.id, since, series_since);
    const counts = new Map(summary.series.map(item => [item.date, item.count]));
    const series = Array.from({ length: DASHBOARD_SERIES_DAYS }, (_, index) => {
      const date = new Date(series_since.getTime() + index * MILLISECONDS_PER_DAY).toISOString().slice(0, 10);
      return { date, count: counts.get(date) ?? 0 };
    });
    const finished = summary.completed + summary.failed;
    return {
      window_days: DASHBOARD_WINDOW_DAYS,
      totals: {
        exports: summary.exports,
        completed: summary.completed,
        failed: summary.failed,
        active: summary.active,
        rows_exported: summary.rows_exported,
        success_rate: finished > 0 ? summary.completed / finished : null,
      },
      by_format: summary.by_format,
      series,
      recent: summary.recent,
    };
  }
}
