import { GetDashboardUseCase } from '@application/use-cases/dashboard/get-dashboard.use-case';
import { ExportFormat } from '@domain/enums/export-format.enum';
import { JobRepository } from '@domain/repositories/job.repository';
import { JobSummary } from '@domain/types/job-summary.type';

describe('GetDashboardUseCase', () => {
  const user = { id: 'user-1', email: 'a@test.dev' };
  const now = new Date('2026-11-12T10:00:00.000Z');

  function build(summary: Partial<JobSummary>) {
    const summarizeOwned = jest.fn().mockResolvedValue({
      exports: 0,
      completed: 0,
      failed: 0,
      active: 0,
      rows_exported: 0,
      by_format: { [ExportFormat.CSV]: 0, [ExportFormat.JSON]: 0, [ExportFormat.XLSX]: 0 },
      series: [],
      recent: [],
      ...summary,
    });
    return { useCase: new GetDashboardUseCase({ summarizeOwned } as unknown as JobRepository), summarizeOwned };
  }

  it('queries only the requesting user inside a bounded window', async () => {
    const { useCase, summarizeOwned } = build({});
    await useCase.execute(user, now);
    expect(summarizeOwned).toHaveBeenCalledWith('user-1', new Date('2026-08-15T00:00:00.000Z'), new Date('2026-10-14T00:00:00.000Z'));
  });

  it('fills the 30 day series with zeros and keeps the counts on their day', async () => {
    const { useCase } = build({ exports: 3, completed: 3, series: [{ date: '2026-11-12', count: 3 }] });
    const result = await useCase.execute(user, now);
    expect(result.series).toHaveLength(30);
    expect(result.series[0]).toEqual({ date: '2026-10-14', count: 0 });
    expect(result.series[29]).toEqual({ date: '2026-11-12', count: 3 });
  });

  it('computes the success rate over finished jobs and leaves it null when none finished', async () => {
    expect((await build({ completed: 3, failed: 1 }).useCase.execute(user, now)).totals.success_rate).toBe(0.75);
    expect((await build({ active: 2 }).useCase.execute(user, now)).totals.success_rate).toBeNull();
  });
});
