import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { JobRepository } from '@domain/repositories/job.repository';
import { Job, JobDocument } from '../schemas/job.schema';
import { JobEntity } from '@domain/entities/job.entity';
import { DomainJobMapper } from '@domain/mappers/job.mapper';

@Injectable()
export class JobPersistence implements JobRepository {
  constructor(@InjectModel(Job.name) private readonly jobModel: Model<JobDocument>) {}

  // Main methods
  async create(job: JobEntity): Promise<JobEntity> {
    const new_job = DomainJobMapper.toPersistence(job);
    await this.jobModel.create(new_job);
    return DomainJobMapper.toDomain(new_job);
  }

  async find(page: number, limit: number, id?: string): Promise<JobEntity[]> {
    const query: any = {};
    if (id) {
      query._id = id;
    }
    const jobs = await this.jobModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    return jobs.map(DomainJobMapper.toDomain);
  }

  // Auxiliary methods
}
