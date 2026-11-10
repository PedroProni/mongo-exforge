import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job, JobDocument } from '@infrastructure/database/schemas/job.schema';
import { JobDocumentMapper } from '@infrastructure/database/mappers/job.mapper';
import { JobEntity } from '@domain/entities/job.entity';
import { ExportStatus } from '@domain/enums/export-status.enum';
import { JobRepository } from '@domain/repositories/job.repository';
import { JobCompletion } from '@domain/types/job-completion.type';
import { JobProps } from '@domain/types/job-props.type';
import { Page } from '@domain/types/page.type';
import { PageRequest } from '@domain/types/page-request.type';

const MAX_ERROR_LENGTH = 500;

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

  async listOwned(user_id: string, request: PageRequest): Promise<Page<JobEntity>> {
    const [rows, total] = await Promise.all([
      this.jobModel
        .find({ user_id })
        .sort({ created_at: -1 })
        .skip((request.page - 1) * request.limit)
        .limit(request.limit)
        .lean<JobProps[]>()
        .exec(),
      this.jobModel.countDocuments({ user_id }).exec(),
    ]);
    return { items: rows.map(row => JobDocumentMapper.toDomain(row)), page: request.page, limit: request.limit, total };
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
        { $set: { status: ExportStatus.COMPLETED, file_key: completion.file_key, rows_exported: completion.rows_exported, finished_at: new Date(), error: '' } },
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
}
