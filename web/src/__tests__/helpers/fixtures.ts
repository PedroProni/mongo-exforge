import { Dashboard, Job, PreviewResult, Template } from '../../types/api.types';

export const JOB: Job = {
  id: 'j1',
  name: 'Adults export',
  status: 'completed',
  export_format: 'csv',
  rows_exported: 1200,
  file_size: 2048,
  attempts: 1,
  max_rows: null,
  error: null,
  file_available: true,
  query: [{ connection_id: 'c1', collection: 'users', field: 'age', operator: 'gte', value: 18 }],
  fields: ['name', 'age'],
  sort: { age: -1 },
  created_at: '2026-11-10T10:00:00.000Z',
  started_at: '2026-11-10T10:00:01.000Z',
  finished_at: '2026-11-10T10:00:04.000Z',
};

export const RUNNING_JOB: Job = { ...JOB, id: 'j2', name: 'Running export', status: 'in_progress', rows_exported: 50, max_rows: 100, file_size: 0, finished_at: null, file_available: false };

export const FAILED_JOB: Job = { ...JOB, id: 'j3', name: 'Broken export', status: 'failed', error: 'timeout reading source', file_size: 0, file_available: false };

export const DASHBOARD: Dashboard = {
  window_days: 90,
  totals: { exports: 12, completed: 9, failed: 1, active: 1, rows_exported: 34500, success_rate: 0.9 },
  by_format: { csv: 7, json: 3, xlsx: 2 },
  series: [
    { date: '2026-11-10', count: 2 },
    { date: '2026-11-11', count: 0 },
    { date: '2026-11-12', count: 5 },
  ],
  recent: [JOB, RUNNING_JOB],
};

export const PREVIEW: PreviewResult = {
  rows: [
    { name: 'Ada', age: 36 },
    { name: 'Linus', age: 54 },
  ],
  columns: ['name', 'age'],
  row_limit: 20,
  estimated_total: 250000,
  estimate_capped: true,
};

export const TEMPLATE: Template = {
  id: 't1',
  name: 'Weekly adults',
  export_format: 'json',
  query: [{ connection_id: 'c1', collection: 'users', field: 'age', operator: 'gte', value: 18 }],
  fields: ['name'],
  sort: { age: 1 },
  max_rows: 500,
  created_at: '2026-11-10T10:00:00.000Z',
  updated_at: '2026-11-10T10:00:00.000Z',
};
