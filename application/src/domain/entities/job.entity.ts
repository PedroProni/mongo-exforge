import { v4 as uuidv4 } from 'uuid';
import { ExportFormat, ExportStatus } from '@domain/enums/all.enums';
import { QueryEntity } from '@domain/entities/complements/query.entity';

export class JobEntity {
  private readonly _id: string;
  private name: string;
  private status: ExportStatus;
  private export_format: ExportFormat;
  private collection: string;
  private query: QueryEntity[];
  private fields?: string[];
  private sort?: Record<string, 1 | -1>;
  private file_url: string;
  private readonly created_at: Date;
  private readonly updated_at: Date;

constructor(props: { _id: string; name: string; status: ExportStatus; export_format: ExportFormat; collection: string; query: QueryEntity[]; fields?: string[]; sort?: Record<string, 1 | -1>; file_url: string; created_at?: Date; updated_at?: Date; }) {
    this._id = props._id || uuidv4();
    this.name = props.name;
    this.status = props.status || ExportStatus.PENDING;
    this.export_format = props.export_format;
    this.collection = props.collection || '';
    this.query = props.query;
    this.fields = props.fields || [];
    this.sort = props.sort || {};
    this.file_url = props.file_url || '';
    this.created_at = props.created_at || new Date();
    this.updated_at = props.updated_at || new Date();
  }

  // Getters
  getId(): string {
    return this._id;
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

  getCollection(): string {
    return this.collection;
  }

  getQuery(): QueryEntity[] {
    return this.query;
  }

  getFields(): string[] {
    return this.fields || [];
  }

  getSort(): Record<string, 1 | -1> {
    return this.sort || {};
  }

  getFileUrl(): string {
    return this.file_url;
  }

  getCreatedAt(): Date {
    return this.created_at;
  }

  getUpdatedAt(): Date {
    return this.updated_at;
  }
}
