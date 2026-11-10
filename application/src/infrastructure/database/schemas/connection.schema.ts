import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ConnectionDocument = HydratedDocument<Connection>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, versionKey: false, collection: 'connection' })
export class Connection {
  @Prop({ required: true, type: String })
  _id!: string;

  @Prop({ required: true, type: String, index: true })
  user_id!: string;

  @Prop({ required: true, type: String })
  name!: string;

  @Prop({ required: true, type: String })
  uri!: string;

  @Prop({ required: true, type: String })
  uri_masked!: string;

  created_at!: Date;

  updated_at!: Date;
}

export const ConnectionSchema = SchemaFactory.createForClass(Connection);
ConnectionSchema.index({ user_id: 1, created_at: -1 });
