import { JobEntity } from '@domain/entities/job.entity';

export interface JobRepository {
  create(entity: JobEntity): Promise<JobEntity>;
  find(page: number, limit: number, id?: string): Promise<JobEntity[]>;
}
