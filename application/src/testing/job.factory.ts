import { JobEntity } from '@domain/entities/job.entity';
import { ExportFormat } from '@domain/enums/export-format.enum';
import { ExportStatus } from '@domain/enums/export-status.enum';
import { JobProps } from '@domain/types/job-props.type';

export function buildJob(overrides: Partial<JobProps> = {}): JobEntity {
  const now = new Date('2026-01-01T00:00:00.000Z');
  return new JobEntity({
    _id: 'job-1',
    user_id: 'user-1',
    name: 'My export',
    status: ExportStatus.COMPLETED,
    export_format: ExportFormat.CSV,
    query: [],
    fields: [],
    sort: {},
    file_key: 'exports/user-1/job-1.csv',
    file_size: 0,
    rows_exported: 10,
    attempts: 1,
    max_rows: 0,
    error: '',
    started_at: now,
    finished_at: now,
    created_at: now,
    updated_at: now,
    ...overrides,
  });
}
