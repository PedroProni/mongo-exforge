import { JobEntity } from "@domain/entities/job.entity";

export interface JobRepository {
    create(entity: JobEntity): Promise<JobEntity>;
    findAll(page: number, limit: number, id?: string): Promise<JobEntity[]>;
}