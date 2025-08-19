import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ExportFormat, ExportStatus } from '@domain/enums/all.enums';

export type JobDocument = Job & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, versionKey: false, collection: 'job' })
export class Job {
  @Prop({ required: true })
  _id!: string;

  @Prop({ required: true })
  user_id!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, enum: ExportStatus, default: ExportStatus.PENDING, type: String })
  status!: ExportStatus;

  @Prop({ required: true, enum: ExportFormat, type: String })
  export_format!: ExportFormat;

  @Prop({ default: '' })
  join_field!: string;

  @Prop({ required: true, type: Object })
  query!: any;

  @Prop({ type: [String], default: [] })
  fields?: string[];

  @Prop({ type: Object, default: {} })
  sort?: Record<string, 1 | -1>;

  @Prop({ default: '' })
  file_url!: string;

  @Prop({ type: Date, default: Date.now })
  created_at!: Date;

  @Prop({ type: Date, default: Date.now })
  updated_at!: Date;
}

export const JobSchema = SchemaFactory.createForClass(Job);
