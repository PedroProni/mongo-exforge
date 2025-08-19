import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { JobRepository } from '@domain/repositories/job.repository';
import { Job, JobDocument } from '../schemas/job.schema';
import { JobEntity } from '@domain/entities/job.entity';
import { DomainJobMapper } from '@domain/mappers/job.mapper';
import { QueryEntity } from '@domain/entities/complements/query.entity';
import { MongoConnection } from '@infrastructure/integrations/mongo-integration';

@Injectable()
export class JobPersistence implements JobRepository {
  constructor(
    @InjectModel(Job.name) private readonly jobModel: Model<JobDocument>,
    private readonly mongoConnection: MongoConnection,
  ) {}

  // Main methods
  async create(job: JobEntity): Promise<JobEntity> {
    const new_job = DomainJobMapper.toPersistence(job);
    await this.jobModel.create(new_job);
    return DomainJobMapper.toDomain(new_job);
  }

  async find(page: number, limit: number, user_id: string, id?: string): Promise<JobEntity[]> {
    const query: any = {};
    if (user_id) query.user_id = user_id;
    if (id) query._id = id;

    const jobs = await this.jobModel.find(query).skip((page - 1) * limit).limit(limit).exec();
    return jobs.map(DomainJobMapper.toDomain);
  }

  async getSourceMongoData(job: JobEntity, limit = 1000): Promise<any[]> {
    const final_result: any[] = [];

    const grouped_queries = this.groupQueries(job.getQuery());

    for (const { uri, collection_name, filters } of grouped_queries) {
      const connection = await this.mongoConnection.connect(uri);
      const collection = connection.collection(collection_name);

      const mongo_query = this.buildMongoQuery(filters);

      let projection: Record<string, number> | undefined;
      const fields = job.getFields();
      if (fields.length) {
        projection = fields.reduce((acc, field) => ({ ...acc, [field]: 1 }), {});
        projection._id = 0;
      }

      const sort = job.getSort() || { updated_at: -1 };

      const results: any[] = [];
      let page = 0;

      while (true) {
        const batch = await collection.find(mongo_query, { projection }).sort(sort).skip(page * limit).limit(limit).toArray();
        if (!batch.length) break;
        
        results.push(...batch);
        page++;
      }

      if (!results.length) {
        throw new NotFoundException(`No data found for query on collection ${collection_name}`);
      }

      final_result.push(...results);
    }

    return final_result;
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

  private groupQueries(queries: QueryEntity[]): any[] {
    const grouped: Record<string, { uri: string; collection_name: string; filters: QueryEntity[] }> = {};

    for (const q of queries) {
      const key = `${q.getUri()}::${q.getCollection()}`;
      if (!grouped[key]) {
        grouped[key] = {
          uri: q.getUri(),
          collection_name: q.getCollection(),
          filters: [],
        };
      }
      grouped[key].filters.push(q);
    }

    return Object.values(grouped);
  }
}
