import { randomUUID } from 'crypto';
import { QueryEntity } from '@domain/entities/query.entity';
import { ExportFormat } from '@domain/enums/export-format.enum';
import { ExportStatus } from '@domain/enums/export-status.enum';
import { JobProps } from '@domain/types/job-props.type';
import { JobSort } from '@domain/types/job-sort.type';
import { NewJobProps } from '@domain/types/new-job-props.type';

export class JobEntity {
  private readonly _id: string;
  private readonly user_id: string;
  private readonly name: string;
  private readonly status: ExportStatus;
  private readonly export_format: ExportFormat;
  private readonly query: QueryEntity[];
  private readonly fields: string[];
  private readonly sort: JobSort;
  private readonly file_key: string;
  private readonly rows_exported: number;
  private readonly attempts: number;
  private readonly error: string;
  private readonly started_at: Date | null;
  private readonly finished_at: Date | null;
  private readonly created_at: Date;
  private readonly updated_at: Date;

  constructor(props: JobProps) {
    this._id = props._id;
    this.user_id = props.user_id;
    this.name = props.name;
    this.status = props.status;
    this.export_format = props.export_format;
    this.query = props.query.map(item => new QueryEntity(item));
    this.fields = props.fields;
    this.sort = props.sort;
    this.file_key = props.file_key;
    this.rows_exported = props.rows_exported;
    this.attempts = props.attempts;
    this.error = props.error;
    this.started_at = props.started_at;
    this.finished_at = props.finished_at;
    this.created_at = props.created_at;
    this.updated_at = props.updated_at;
  }

  static create(props: NewJobProps): JobEntity {
    const now = new Date();
    return new JobEntity({
      ...props,
      _id: randomUUID(),
      status: ExportStatus.PENDING,
      file_key: '',
      rows_exported: 0,
      attempts: 0,
      error: '',
      started_at: null,
      finished_at: null,
      created_at: now,
      updated_at: now,
    });
  }

  getId(): string {
    return this._id;
  }

  getUserId(): string {
    return this.user_id;
  }

  getName(): string {
    return this.name;
  }

  getStatus(): ExportStatus {
    return this.status;
  }

  getExportFormat(): ExportFormat {
    return this.export_format;
  }

  getQuery(): QueryEntity[] {
    return this.query;
  }

  getFields(): string[] {
    return this.fields;
  }

  getSort(): JobSort {
    return this.sort;
  }

  getFileKey(): string {
    return this.file_key;
  }

  getRowsExported(): number {
    return this.rows_exported;
  }

  getAttempts(): number {
    return this.attempts;
  }

  getError(): string {
    return this.error;
  }

  getStartedAt(): Date | null {
    return this.started_at;
  }

  getFinishedAt(): Date | null {
    return this.finished_at;
  }

  getCreatedAt(): Date {
    return this.created_at;
  }

  getUpdatedAt(): Date {
    return this.updated_at;
  }
}
