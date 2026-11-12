import { randomUUID } from 'crypto';
import { QueryEntity } from '@domain/entities/query.entity';
import { ExportFormat } from '@domain/enums/export-format.enum';
import { JobSort } from '@domain/types/job-sort.type';
import { NewTemplateProps } from '@domain/types/new-template-props.type';
import { TemplateProps } from '@domain/types/template-props.type';

export class TemplateEntity {
  private readonly _id: string;
  private readonly user_id: string;
  private readonly name: string;
  private readonly export_format: ExportFormat;
  private readonly query: QueryEntity[];
  private readonly fields: string[];
  private readonly sort: JobSort;
  private readonly max_rows: number;
  private readonly created_at: Date;
  private readonly updated_at: Date;

  constructor(props: TemplateProps) {
    this._id = props._id;
    this.user_id = props.user_id;
    this.name = props.name;
    this.export_format = props.export_format;
    this.query = props.query.map(item => new QueryEntity(item));
    this.fields = props.fields;
    this.sort = props.sort;
    this.max_rows = props.max_rows;
    this.created_at = props.created_at;
    this.updated_at = props.updated_at;
  }

  static create(props: NewTemplateProps): TemplateEntity {
    const now = new Date();
    return new TemplateEntity({ ...props, _id: randomUUID(), created_at: now, updated_at: now });
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

  getMaxRows(): number {
    return this.max_rows;
  }

  getCreatedAt(): Date {
    return this.created_at;
  }

  getUpdatedAt(): Date {
    return this.updated_at;
  }

  toProps(): TemplateProps {
    return {
      _id: this._id,
      user_id: this.user_id,
      name: this.name,
      export_format: this.export_format,
      query: this.query.map(item => item.toProps()),
      fields: this.fields,
      sort: this.sort,
      max_rows: this.max_rows,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}
