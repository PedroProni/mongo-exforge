import { Injectable, NotFoundException } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { JobRepository } from '@domain/repositories/job.repository';
import { Job, JobDocument } from '../schemas/job.schema';
import { JobEntity } from '@domain/entities/job.entity';
import { DomainJobMapper } from '@domain/mappers/job.mapper';
import { QueryEntity } from '@domain/entities/complements/query.entity';

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

  async getSourceMongoData(job: JobEntity, limit = 1000): Promise<any[]> {
    const collection = this.sourceConnection.collection(job.getCollection());

    let projection: Record<string, number> | undefined;
    const query = this.buildMongoQuery(job.getQuery());
    const fields = job.getFields();

    if (fields.length) {
      projection = fields.reduce((acc, field) => ({ ...acc, [field]: 1 }), {});
      projection._id = 0;
    }

    const sort = job.getSort() || { updated_at: -1 };

    const results: any[] = [];
    let page = 0;

    while (true) {
      const batch = await collection
        .find(query, { projection })
        .sort(sort)
        .skip(page * limit)
        .limit(limit)
        .toArray();
      if (!batch.length) break;

      results.push(...batch);
      page++;
    }

    if (!results.length) {
      throw new NotFoundException(`No data found for this query: ${JSON.stringify(query)}`);
    }

    return results;
  }

  // Auxiliary methods
  private buildMongoQuery(queries: QueryEntity[]): Record<string, any> {
    const mongo_query: Record<string, any> = {};
    queries.forEach(query => {
      const field = query.getField();
      const operator = query.getOperator();
      const value = query.getValue();

      if (!field || !operator) return;

      switch (operator) {
        case 'eq':
          mongo_query[field] = value;
          break;
        case 'ne':
          mongo_query[field] = { $ne: value };
          break;
        case 'gt':
          mongo_query[field] = { $gt: value };
          break;
        case 'gte':
          mongo_query[field] = { $gte: value };
          break;
        case 'lt':
          mongo_query[field] = { $lt: value };
          break;
        case 'lte':
          mongo_query[field] = { $lte: value };
          break;
        case 'in':
          mongo_query[field] = { $in: value };
          break;
        case 'nin':
          mongo_query[field] = { $nin: value };
          break;
        default:
          throw new Error(`Unsupported operator: ${operator}`);
      }
    });
    return mongo_query;
  }
}
