import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ExportFormat } from '@domain/enums/export-format.enum';
import { ExportStatus } from '@domain/enums/export-status.enum';
import { JobSort } from '@domain/types/job-sort.type';
import { QueryProps } from '@domain/types/query-props.type';

export type JobDocument = HydratedDocument<Job>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, versionKey: false, collection: 'job' })
export class Job {
  @Prop({ required: true, type: String })
  _id!: string;

  @Prop({ required: true, type: String, index: true })
  user_id!: string;

  @Prop({ required: true, type: String })
  name!: string;

  @Prop({ required: true, enum: ExportStatus, default: ExportStatus.PENDING, type: String })
  status!: ExportStatus;

  @Prop({ required: true, enum: ExportFormat, type: String })
  export_format!: ExportFormat;

  @Prop({ required: true, type: [Object] })
  query!: QueryProps[];

  @Prop({ type: [String], default: [] })
  fields!: string[];

  @Prop({ type: Object, default: {} })
  sort!: JobSort;

  @Prop({ type: String, default: '' })
  file_key!: string;

  @Prop({ type: Number, default: 0 })
  rows_exported!: number;

  @Prop({ type: Number, default: 0 })
  attempts!: number;

  @Prop({ type: String, default: '' })
  error!: string;

  @Prop({ type: Date, default: null })
  started_at!: Date | null;

  @Prop({ type: Date, default: null })
  finished_at!: Date | null;

  created_at!: Date;

  updated_at!: Date;
}

export const JobSchema = SchemaFactory.createForClass(Job);
JobSchema.index({ user_id: 1, created_at: -1 });
JobSchema.index({ status: 1, finished_at: 1 });
