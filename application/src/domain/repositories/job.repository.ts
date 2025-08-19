import { JobEntity } from '@domain/entities/job.entity';

export interface JobRepository {
  create(entity: JobEntity, url?: string): Promise<JobEntity>;
  find(page: number, limit: number, user_id: string, id?: string): Promise<JobEntity[]>;
  getSourceMongoData(entity: JobEntity): Promise<any[]>;
}
