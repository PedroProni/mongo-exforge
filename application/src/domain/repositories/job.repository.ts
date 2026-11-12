import { JobEntity } from '@domain/entities/job.entity';
import { JobFilter } from '@domain/types/job-filter.type';
import { JobSummary } from '@domain/types/job-summary.type';
import { JobCompletion } from '@domain/types/job-completion.type';
import { Page } from '@domain/types/page.type';
import { PageRequest } from '@domain/types/page-request.type';

export interface JobRepository {
  create(job: JobEntity): Promise<JobEntity>;
  findById(id: string): Promise<JobEntity | null>;
  findOwned(user_id: string, id: string): Promise<JobEntity | null>;
  listOwned(user_id: string, request: PageRequest, filter: JobFilter): Promise<Page<JobEntity>>;
  summarizeOwned(user_id: string, since: Date, series_since: Date): Promise<JobSummary>;
  deleteOwned(user_id: string, id: string): Promise<boolean>;
  deleteAllOwned(user_id: string): Promise<string[]>;
  markInProgress(id: string, attempt: number): Promise<void>;
  updateProgress(id: string, rows_exported: number): Promise<void>;
  markCompleted(id: string, completion: JobCompletion): Promise<void>;
  markFailed(id: string, error: string): Promise<void>;
  findExpired(finished_before: Date, limit: number): Promise<JobEntity[]>;
  markExpired(id: string): Promise<void>;
}
