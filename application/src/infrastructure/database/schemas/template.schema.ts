import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ExportFormat } from '@domain/enums/export-format.enum';
import { JobSort } from '@domain/types/job-sort.type';
import { QueryProps } from '@domain/types/query-props.type';

export type TemplateDocument = HydratedDocument<Template>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, versionKey: false, collection: 'template' })
export class Template {
  @Prop({ required: true, type: String })
  _id!: string;

  @Prop({ required: true, type: String })
  user_id!: string;

  @Prop({ required: true, type: String })
  name!: string;

  @Prop({ required: true, enum: ExportFormat, type: String })
  export_format!: ExportFormat;

  @Prop({ required: true, type: [Object] })
  query!: QueryProps[];

  @Prop({ type: [String], default: [] })
  fields!: string[];

  @Prop({ type: Object, default: {} })
  sort!: JobSort;

  @Prop({ type: Number, default: 0 })
  max_rows!: number;

  created_at!: Date;

  updated_at!: Date;
}

export const TemplateSchema = SchemaFactory.createForClass(Template);
TemplateSchema.index({ user_id: 1, created_at: -1 });
TemplateSchema.index({ user_id: 1, name: 1 }, { unique: true });
