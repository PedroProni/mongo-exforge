import { Job } from '../types/api.types';

export function jobProgress(job: Pick<Job, 'status' | 'rows_exported' | 'max_rows'>): number | null {
  if (job.status === 'completed' || job.status === 'expired') return 100;
  if (job.status === 'pending' || job.status === 'failed') return 0;
  if (!job.max_rows || job.max_rows <= 0) return null;
  return Math.min(99, Math.floor((job.rows_exported / job.max_rows) * 100));
}
