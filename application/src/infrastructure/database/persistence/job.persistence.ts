import { Injectable } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { JobRepository } from '@domain/repositories/job.repository';
import { Job, JobDocument } from '../schemas/job.schema';
import { JobEntity } from '@domain/entities/job.entity';
import { DomainJobMapper } from '@domain/mappers/job.mapper';

@Injectable()
export class JobPersistence implements JobRepository {
  constructor(
    @InjectModel(Job.name) private readonly jobModel: Model<JobDocument>,
    @InjectConnection('source') private readonly sourceConnection: Connection,
  ) {}

  // Main methods
  async create(job: JobEntity, url?: string): Promise<JobEntity> {
    const new_job = DomainJobMapper.toPersistence(job);
    if (url) new_job.file_url = url;
    new_job.status = 'completed';
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

  async getSourceMongoData(job: JobEntity): Promise<any[]> {
    const collection = this.sourceConnection.collection(job.getCollection());
    const query = JSON.parse(job.getQuery().replace(/([a-zA-Z0-9_]+)\s*=/g, '"$1":').replace(/'/g, '"'));
    const projection = job.getFields().length ? job.getFields().reduce((acc, field) => ({ ...acc, [field]: 1 }), {}) : undefined;
    const sort = job.getSort() || {};
    const cursor = collection.find(query, { projection }).sort(sort);
    const data = await cursor.toArray();

    return data;
  }
  // Auxiliary methods
}
