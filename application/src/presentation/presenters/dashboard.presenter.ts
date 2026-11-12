import { DashboardSummary } from '@domain/types/dashboard-summary.type';
import { JobPresenter } from '@presentation/presenters/job.presenter';
import { DashboardResponse } from '@shared/responses/dashboard-response.type';

export class DashboardPresenter {
  static toResponse(summary: DashboardSummary): DashboardResponse {
    return { ...summary, recent: summary.recent.map(item => JobPresenter.toResponse(item)) };
  }
}
