import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Job, JobDocument } from '@infrastructure/database/schemas/job.schema';
import { JobDocumentMapper } from '@infrastructure/database/mappers/job.mapper';
import { JobEntity } from '@domain/entities/job.entity';
import { ExportFormat } from '@domain/enums/export-format.enum';
import { ExportStatus } from '@domain/enums/export-status.enum';
import { JobRepository } from '@domain/repositories/job.repository';
import { JobAggregate } from '@domain/types/job-aggregate.type';
import { JobFilter } from '@domain/types/job-filter.type';
import { JobSummary } from '@domain/types/job-summary.type';
import { JobCompletion } from '@domain/types/job-completion.type';
import { JobProps } from '@domain/types/job-props.type';
import { Page } from '@domain/types/page.type';
import { PageRequest } from '@domain/types/page-request.type';
import { DASHBOARD_MAX_TIME_MS, DASHBOARD_RECENT_LIMIT } from '@domain/constants/dashboard.constant';
import { MAX_ERROR_LENGTH } from '@domain/constants/export.constant';

@Injectable()
export class JobPersistence implements JobRepository {
  constructor(@InjectModel(Job.name) private readonly jobModel: Model<JobDocument>) {}

  async create(job: JobEntity): Promise<JobEntity> {
    await this.jobModel.create(JobDocumentMapper.toPersistence(job));
    return job;
  }

  async findById(id: string): Promise<JobEntity | null> {
    const raw = await this.jobModel.findById(id).lean<JobProps>().exec();
    return raw ? JobDocumentMapper.toDomain(raw) : null;
  }

  async findOwned(user_id: string, id: string): Promise<JobEntity | null> {
    const raw = await this.jobModel.findOne({ _id: id, user_id }).lean<JobProps>().exec();
    return raw ? JobDocumentMapper.toDomain(raw) : null;
  }

  async listOwned(user_id: string, request: PageRequest, filter: JobFilter): Promise<Page<JobEntity>> {
    const match = this.buildMatch(user_id, filter);
    const [rows, total] = await Promise.all([
      this.jobModel
        .find(match)
        .sort({ created_at: -1 })
        .skip((request.page - 1) * request.limit)
        .limit(request.limit)
        .lean<JobProps[]>()
        .exec(),
      this.jobModel.countDocuments(match).exec(),
    ]);
    return { items: rows.map(row => JobDocumentMapper.toDomain(row)), page: request.page, limit: request.limit, total };
  }

  async summarizeOwned(user_id: string, since: Date, series_since: Date): Promise<JobSummary> {
    const finished = [ExportStatus.COMPLETED, ExportStatus.EXPIRED];
    const [result] = await this.jobModel
      .aggregate<JobAggregate>([
        { $match: { user_id, created_at: { $gte: since } } },
        {
          $facet: {
            totals: [
              {
                $group: {
                  _id: null,
                  exports: { $sum: 1 },
                  completed: { $sum: { $cond: [{ $in: ['$status', finished] }, 1, 0] } },
                  failed: { $sum: { $cond: [{ $eq: ['$status', ExportStatus.FAILED] }, 1, 0] } },
                  active: { $sum: { $cond: [{ $in: ['$status', [ExportStatus.PENDING, ExportStatus.IN_PROGRESS]] }, 1, 0] } },
                  rows_exported: { $sum: { $cond: [{ $in: ['$status', finished] }, '$rows_exported', 0] } },
                },
              },
            ],
            formats: [{ $group: { _id: '$export_format', count: { $sum: 1 } } }],
            series: [
              { $match: { created_at: { $gte: series_since } } },
              { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at', timezone: 'UTC' } }, count: { $sum: 1 } } },
              { $sort: { _id: 1 } },
            ],
            recent: [{ $sort: { created_at: -1 } }, { $limit: DASHBOARD_RECENT_LIMIT }],
          },
        },
      ])
      .option({ maxTimeMS: DASHBOARD_MAX_TIME_MS })
      .exec();
    const totals = result.totals[0];
    const by_format = { [ExportFormat.CSV]: 0, [ExportFormat.JSON]: 0, [ExportFormat.XLSX]: 0 };
    result.formats.forEach(item => {
      by_format[item._id] = item.count;
    });
    return {
      exports: totals?.exports ?? 0,
      completed: totals?.completed ?? 0,
      failed: totals?.failed ?? 0,
      active: totals?.active ?? 0,
      rows_exported: totals?.rows_exported ?? 0,
      by_format,
      series: result.series.map(item => ({ date: item._id, count: item.count })),
      recent: result.recent.map(row => JobDocumentMapper.toDomain(row)),
    };
  }

  async markInProgress(id: string, attempt: number): Promise<void> {
    await this.jobModel
      .updateOne(
        { _id: id, status: { $in: [ExportStatus.PENDING, ExportStatus.IN_PROGRESS] } },
        { $set: { status: ExportStatus.IN_PROGRESS, attempts: attempt, started_at: new Date(), finished_at: null, error: '', rows_exported: 0 } },
      )
      .exec();
  }

  async updateProgress(id: string, rows_exported: number): Promise<void> {
    await this.jobModel.updateOne({ _id: id, status: ExportStatus.IN_PROGRESS }, { $set: { rows_exported } }).exec();
  }

  async markCompleted(id: string, completion: JobCompletion): Promise<void> {
    await this.jobModel
      .updateOne(
        { _id: id, status: ExportStatus.IN_PROGRESS },
        { $set: { status: ExportStatus.COMPLETED, file_key: completion.file_key, file_size: completion.file_size, rows_exported: completion.rows_exported, finished_at: new Date(), error: '' } },
      )
      .exec();
  }

  async markFailed(id: string, error: string): Promise<void> {
    await this.jobModel
      .updateOne(
        { _id: id, status: { $in: [ExportStatus.PENDING, ExportStatus.IN_PROGRESS] } },
        { $set: { status: ExportStatus.FAILED, error: error.slice(0, MAX_ERROR_LENGTH), finished_at: new Date() } },
      )
      .exec();
  }

  async deleteOwned(user_id: string, id: string): Promise<boolean> {
    const result = await this.jobModel.deleteOne({ _id: id, user_id }).exec();
    return result.deletedCount > 0;
  }

  async deleteAllOwned(user_id: string): Promise<string[]> {
    const keys = (
      await this.jobModel
        .find({ user_id, file_key: { $ne: '' } }, { file_key: 1 })
        .lean<{ file_key: string }[]>()
        .exec()
    ).map(item => item.file_key);
    await this.jobModel.deleteMany({ user_id }).exec();
    return keys;
  }

  async findExpired(finished_before: Date, limit: number): Promise<JobEntity[]> {
    const rows = await this.jobModel
      .find({ status: ExportStatus.COMPLETED, file_key: { $ne: '' }, finished_at: { $lt: finished_before } })
      .limit(limit)
      .lean<JobProps[]>()
      .exec();
    return rows.map(row => JobDocumentMapper.toDomain(row));
  }

  async markExpired(id: string): Promise<void> {
    await this.jobModel.updateOne({ _id: id, status: ExportStatus.COMPLETED }, { $set: { status: ExportStatus.EXPIRED, file_key: '' } }).exec();
  }

  private buildMatch(user_id: string, filter: JobFilter): FilterQuery<JobDocument> {
    const match: FilterQuery<JobDocument> = { user_id };
    if (filter.status) match.status = filter.status;
    if (filter.q) match.name = { $regex: filter.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    return match;
  }
}
